"use client";

import React, { useState, useRef, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Bot, Send, User, Stethoscope, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { handleSymptomCheck } from "@/app/actions";
import { type AiSymptomCheckOutput } from "@/ai/flows/ai-symptom-check";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  id: number;
  sender: "user" | "ai" | "system";
  content: string | AiSymptomCheckOutput;
};

const initialState = {
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
  const [state, formAction] = useActionState(handleSymptomCheck, initialState);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "system",
      content: "Welcome! Describe your symptoms to get educational, non-diagnostic guidance.",
    },
  ]);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.data) {
      setMessages((prev) => [
        ...prev.filter(m => m.sender !== 'ai' || typeof m.content === 'string'),
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
    const symptomDescription = formData.get("symptomDescription") as string;
    if (symptomDescription.trim()) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "user", content: symptomDescription },
      ]);
      formAction(formData);
      formRef.current?.reset();
    }
  };


  return (
    <Card className="flex h-[70vh] flex-col shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Stethoscope className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline">AI Symptom Checker</CardTitle>
        </div>
        <CardDescription>
          This is for educational purposes and is not a substitute for professional medical advice.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender !== "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                {typeof message.content === 'string' ? (
                  <div
                    className={`max-w-md rounded-lg px-4 py-2 shadow-md ${
                       message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border"
                    } ${message.sender === 'system' ? 'w-full text-center bg-transparent border-none shadow-none text-muted-foreground text-sm' : ''}`}
                  >
                    <p>{message.content}</p>
                  </div>
                ) : (
                  <div className="max-w-md rounded-lg px-4 py-3 shadow-md bg-secondary border space-y-4">
                    <p className="font-semibold text-base">Analysis for: <span className="text-primary">{message.content.symptom}</span></p>
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm"><AlertTriangle className="text-destructive h-4 w-4"/> Possible Causes</h3>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                        {message.content.possible_causes.map((cause, i) => <li key={i}>{cause}</li>)}
                      </ul>
                    </div>
                      <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm"><CheckCircle className="text-accent-foreground h-4 w-4"/> General Advice</h3>
                      <p className="text-xs">{message.content.advice}</p>
                    </div>
                  </div>
                )}

                {message.sender === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
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
      </CardContent>
      <CardFooter className="border-t p-4">
        <form ref={formRef} action={handleFormSubmit} className="flex w-full items-center gap-2">
          <Input
            name="symptomDescription"
            placeholder="Type your symptoms here..."
            className="flex-1"
            autoComplete="off"
            required
            disabled={useFormStatus().pending}
          />
          <SubmitButton />
        </form>
      </CardFooter>
    </Card>
  );
}
