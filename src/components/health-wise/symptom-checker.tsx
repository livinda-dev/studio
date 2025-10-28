"use client";

import React, { useState, useRef, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { handleChatMessage, handleReminder } from "@/app/actions";
import { type HealthCompanionOutput } from "@/ai/flows/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

type Reminder = {
  symptom: string;
  advice: string;
};

type MessageContent = string | (HealthCompanionOutput & { tool_code?: { name: string; args: Reminder } });

type Message = {
  id: number;
  sender: "user" | "ai" | "system";
  content: MessageContent;
};

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

export default function SymptomChecker() {
  const [state, formAction] = useActionState(handleChatMessage, initialState);
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "system",
      content: "Welcome! I'm your AI Health Companion. Ask me about your symptoms or just say hello.",
    },
  ]);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
      toast({
        title: 'Reminder Set!',
        description: `You will get daily reminders about your ${reminder.symptom}.`,
      });
    }
  };

  useEffect(() => {
    if (state.data) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "ai", content: state.data },
      ]);
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
  
  const handleFormSubmit = async (formData: FormData) => {
    const message = formData.get("message") as string;
    if (message.trim()) {
      const currentUserMessage: Message = { id: Date.now(), sender: "user", content: message };
      setMessages(prev => [...prev, currentUserMessage]);
      
      const historyForAI = messages
        .map((msg) => {
            if (msg.sender === 'user') {
                return { role: 'user', content: msg.content as string };
            }
            if (msg.sender === 'ai') {
                const content = typeof msg.content === 'string' ? msg.content : msg.content.textResponse;
                return { role: 'model', content: content };
            }
            return null;
        })
        .filter((item): item is {role: 'user' | 'model', content: string} => item !== null);

      formData.set('history', JSON.stringify(historyForAI));
      
      formAction(formData);
      formRef.current?.reset();
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                    {messages.map((message) => {
                       const isUser = message.sender === 'user';
                       const isSystem = message.sender === 'system';
                       
                       let contentText = '';
                       let reminder: Reminder | undefined;

                       if (typeof message.content === 'string') {
                           contentText = message.content;
                       } else {
                           contentText = message.content.textResponse;
                           if (message.content.tool_code?.name === 'setReminderTool') {
                               reminder = message.content.tool_code.args;
                           }
                       }

                       return (
                            <div
                                key={message.id}
                                className={`flex items-start gap-3 ${
                                isUser ? "justify-end" : "justify-start"
                                }`}
                            >
                                {!isUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                    <Bot className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                )}
                                
                                <div
                                    className={`max-w-md rounded-lg px-4 py-2 shadow-md ${
                                    isUser
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card border"
                                    } ${isSystem ? 'w-full text-center bg-transparent border-none shadow-none text-muted-foreground text-sm' : ''}`}
                                >
                                    <p>{contentText}</p>
                                    {reminder && (
                                        <div className="mt-2 pt-2 border-t border-primary/20">
                                            <p className="text-xs text-muted-foreground mb-2">The AI would like to set a reminder.</p>
                                            <Button size="sm" onClick={() => onAcceptReminder(reminder!)}>Accept Reminder</Button>
                                        </div>
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
            <form ref={formRef} action={handleFormSubmit} className="flex w-full items-center gap-2">
                <Input
                    name="message"
                    placeholder="Ask me about symptoms or just say hi..."
                    className="flex-1"
                    autoComplete="off"
                    required
                    disabled={useFormStatus().pending}
                />
                <SubmitButton />
            </form>
        </div>
    </div>
  );
}
