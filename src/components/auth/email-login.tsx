
"use client"

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFirebase } from '@/firebase/provider';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const getFriendlyAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'The email address you entered is not valid. Please check and try again.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid credentials. Please check your email and password and try again.';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email address. Please sign in or use a different email.';
        case 'auth/weak-password':
            return 'The password is too weak. It must be at least 6 characters long.';
        default:
            return 'An unexpected error occurred during authentication. Please try again later.';
    }
};

export default function EmailLogin() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const { auth } = useFirebase();
    const { toast } = useToast();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsSubmitting(true);
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, data.email, data.password);
                toast({ title: "Account created successfully! Redirecting..."});
            } else {
                await signInWithEmailAndPassword(auth, data.email, data.password);
            }
        } catch (error: any) {
            console.error("Authentication Error Code:", error.code);

            if (isSignUp && error.code === 'auth/email-already-in-use') {
                 toast({
                    title: "Account Exists",
                    description: "This email is already registered. Please sign in.",
                });
                setIsSignUp(false); // Switch to sign-in mode
            } else {
                const friendlyMessage = getFriendlyAuthErrorMessage(error.code);
                toast({
                    variant: "destructive",
                    title: "Authentication Failed",
                    description: friendlyMessage,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSignUp ? "Create Account" : "Sign In"}
                </Button>

                 <p className="text-center text-sm text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                    <Button variant="link" type="button" onClick={() => setIsSignUp(!isSignUp)} className="p-0 h-auto">
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </Button>
                </p>
            </form>
        </Form>
    )
}
