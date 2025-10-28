"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EmailLogin from "./email-login";
import PhoneLogin from "./phone-login";
import GoogleLogin from "./google-login";
import { Bot } from "lucide-react";

export default function LoginForm() {
    return (
        <Card className="w-full max-w-md shadow-2xl">
             <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 mb-2">
                    <Bot className="h-8 w-8 text-primary"/>
                    <CardTitle className="text-3xl font-headline">HealthWise Companion</CardTitle>
                </div>
                <CardDescription>Sign in to access your personalized health insights.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="email">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="phone">Phone</TabsTrigger>
                    </TabsList>
                    <TabsContent value="email">
                        <EmailLogin />
                    </TabsContent>
                    <TabsContent value="phone">
                        <PhoneLogin />
                    </TabsContent>
                </Tabs>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                </div>

                <GoogleLogin />

            </CardContent>
        </Card>
    )
}
