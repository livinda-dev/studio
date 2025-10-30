"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Bot, Send, User, Loader2, Volume2 } from "lucide-react";
import { handleChatMessage, handleReminder } from "@/app/actions";
import { type HealthCompanionOutput } from "@/ai/flows/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const CHAT_HISTORY_KEY = 'healthwise-chat-history';

type Reminder = {
  symptom: string;
  advice: string;
};

type ToolRequest = { name: string; args: any };

type MessageContent = string | (HealthCompanionOutput & { toolRequests?: ToolRequest[] });

type Message = {
  id: number;
  sender: "user" | "ai" | "system";
  content: MessageContent;
};

const SYSTEM_MESSAGE_WELCOME = "Welcome! I'm your AI Health Companion. Ask me about your symptoms or just say hello.";

const initialState: { data: HealthCompanionOutput | null; error: string | null; } = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending} aria-label="Send message">
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
    </Button>
  );
}

function ChatForm({
  onFormAction,
}: {
  onFormAction: (formData: FormData) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        onFormAction(formData);
        if (!pending) {
          formRef.current?.reset();
        }
      }}
      className="flex w-full items-center gap-2"
    >
      <Input
        name="message"
        placeholder="Ask me about symptoms or just say hi..."
        className="flex-1"
        autoComplete="off"
        required
        disabled={pending}
      />
      <SubmitButton />
    </form>
  );
}

export default function SymptomChecker() {
  const [state, formAction] = useFormState(handleChatMessage, initialState);
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      } else {
        setMessages([
          { id: 1, sender: "system", content: SYSTEM_MESSAGE_WELCOME },
        ]);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
       setMessages([
          { id: 1, sender: "system", content: SYSTEM_MESSAGE_WELCOME },
        ]);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    try {
        if (messages.length > 0) {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        } else {
            // If messages are cleared, remove from storage as well
            localStorage.removeItem(CHAT_HISTORY_KEY);
        }
    } catch (error) {
         console.error("Failed to save chat history to localStorage", error);
    }
  }, [messages]);


  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        variant: 'destructive',
        title: 'Notifications not supported',
        description: 'This browser does not support desktop notifications.',
      });
      return false;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast({
        title: 'Permission Denied',
        description: 'You will not receive reminder notifications.',
      });
      return false;
    }
    return true;
  };

  const onAcceptReminder = async (reminder: Reminder) => {
    const permissionGranted = await requestNotificationPermission();
    if (permissionGranted) {
      await handleReminder(reminder);
      // Also save to localStorage as a backup/quick access method
      localStorage.setItem('healthwise-reminder', JSON.stringify({ ...reminder, lastShown: Date.now() }));
      toast({
        title: 'Reminder Set!',
        description: `You will get daily reminders about your ${reminder.symptom}.`,
      });
    }
  };
  
  useEffect(() => {
    if (state.data) {
      const newAiMessage: Message = { id: Date.now(), sender: "ai", content: state.data };
      
      const toolRequests = (state.data.toolRequests || []) as ToolRequest[];
      const clearHistoryToolCall = toolRequests.find(tool => tool.name === 'clearChatHistoryTool');

      if (clearHistoryToolCall) {
        // Clear history but show the AI's confirmation message first.
        setMessages([newAiMessage]);
        // After a very short delay, reset to just the welcome message.
        setTimeout(() => {
            setMessages([{ id: Date.now(), sender: "system", content: SYSTEM_MESSAGE_WELCOME }]);
        }, 2000);
      } else {
        setMessages((prev) => [...prev, newAiMessage]);
      }
      
      // Auto-play audio if available
      if (state.data.audioData && audioRef.current) {
        audioRef.current.src = state.data.audioData;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }

    } else if (state.error) {
       setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "system", content: `Error: ${state.error}` },
      ]);
    }
  }, [state]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);
  
  const handleFormAction = (formData: FormData) => {
    const message = formData.get("message") as string;
    if (message.trim()) {
      const currentUserMessage: Message = { id: Date.now(), sender: "user", content: message };
      const newMessages = [...messages, currentUserMessage];
      setMessages(newMessages);

      const historyJson = JSON.stringify(newMessages);
      formData.set('history', historyJson);
      
      formAction(formData);
    }
  };

  const playAudio = (audioData: string) => {
      if(audioRef.current) {
          audioRef.current.src = audioData;
          audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
  }


  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        <audio ref={audioRef} className="hidden" />
        <div className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                    {messages.map((message) => {
                       const isUser = message.sender === 'user';
                       const isSystem = message.sender === 'system';
                       
                       let contentText = '';
                       let reminder: Reminder | undefined;
                       let audioData: string | undefined;

                       if (typeof message.content === 'string') {
                           contentText = message.content;
                       } else {
                           contentText = message.content.textResponse;
                           audioData = message.content.audioData;

                           const toolRequests = (message.content.toolRequests || []) as ToolRequest[];
                           const reminderToolCall = toolRequests.find(tool => tool.name === 'setReminderTool');
                           if (reminderToolCall) {
                                reminder = reminderToolCall.args;
                           }
                       }

                       return (
                            <div
                                key={message.id}
                                className={`flex items-start gap-3 ${
                                isUser ? "justify-end" : "justify-start"
                                } ${isSystem ? "w-full justify-center" : ""}`}
                            >
                                {!isUser && !isSystem && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                    <Bot className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                )}
                                
                                <div
                                    className={`max-w-md rounded-lg px-4 py-2 shadow-md flex items-center gap-2 ${
                                    isUser
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card border"
                                    } ${isSystem ? 'w-full text-center bg-transparent border-none shadow-none text-muted-foreground text-sm' : ''}`}
                                >
                                    <div>
                                        <p>{contentText}</p>
                                        {reminder && (
                                            <div className="mt-2 pt-2 border-t border-primary/20">
                                                <p className="text-xs mb-2">I can set a daily reminder for this. Would you like that?</p>
                                                <Button size="sm" variant="secondary" className="text-secondary-foreground" onClick={() => onAcceptReminder(reminder!)}>Accept Reminder</Button>
                                            </div>
                                        )}
                                    </div>
                                    {!isUser && !isSystem && audioData && (
                                        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => playAudio(audioData!)}>
                                            <Volume2 className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                               

                                {isUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                    <User className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                )}
                            </div>
                       )
                    })}
                    {useFormStatus().pending && (
                        <div className="flex items-start gap-3 justify-start">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    <Bot className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="max-w-md rounded-lg px-4 py-2 shadow-md bg-card border flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                <p className="text-muted-foreground">AI is thinking...</p>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
        <div className="border-t p-4">
            <ChatForm onFormAction={handleFormAction} />
        </div>
    </div>
  );
}
