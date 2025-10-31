
"use client"

import { useState, useRef, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFirebase } from '@/firebase/provider';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const phoneSchema = z.object({
  phone: z.string().min(10, { message: "Please enter a valid phone number with country code." }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

const getFriendlyPhoneAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-phone-number':
            return 'The phone number is not valid. Please include the country code (e.g., +1).';
        case 'auth/too-many-requests':
            return 'You have requested an OTP too many times. Please wait a while before trying again.';
        case 'auth/code-expired':
            return 'The verification code has expired. Please request a new one.';
        case 'auth/invalid-verification-code':
            return 'The verification code you entered is incorrect. Please try again.';
        default:
            return 'An unexpected error occurred. Please try again later.';
    }
};

export default function PhoneLogin() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const { auth } = useFirebase();
    const { toast } = useToast();
    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    // Initialize reCAPTCHA verifier
    useEffect(() => {
        if (!auth || (window as any).recaptchaVerifier) return;
        if (recaptchaContainerRef.current) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                'size': 'invisible',
                'callback': (response: any) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                }
            });
        }
    }, [auth]);
    
    const phoneForm = useForm<{phone: string}>({
        resolver: zodResolver(phoneSchema),
        defaultValues: { phone: "+1" },
    });

    const otpForm = useForm<{otp: string}>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    const onPhoneSubmit = async (data: {phone: string}) => {
        setIsSubmitting(true);
        try {
            const verifier = (window as any).recaptchaVerifier;
            const result = await signInWithPhoneNumber(auth, data.phone, verifier);
            setConfirmationResult(result);
             toast({ title: "OTP Sent!", description: "Check your phone for the verification code."});
        } catch (error: any) {
            console.error("Phone Auth Error Code:", error.code);
            const friendlyMessage = getFriendlyPhoneAuthErrorMessage(error.code);
             toast({
                variant: "destructive",
                title: "Failed to Send OTP",
                description: friendlyMessage,
            });
            // Reset reCAPTCHA to allow retries
            if ((window as any).recaptchaVerifier && (window as any).grecaptcha) {
                 (window as any).recaptchaVerifier.render().then((widgetId: any) => {
                    (window as any).grecaptcha.reset(widgetId);
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

     const onOtpSubmit = async (data: {otp: string}) => {
        if (!confirmationResult) return;
        setIsSubmitting(true);
        try {
            await confirmationResult.confirm(data.otp);
            // AuthProvider will handle redirect
        } catch (error: any)             {
             console.error("OTP Error Code:", error.code);
             const friendlyMessage = getFriendlyPhoneAuthErrorMessage(error.code);
             toast({
                variant: "destructive",
                title: "Verification Failed",
                description: friendlyMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div>
            <div ref={recaptchaContainerRef}></div>
            {!confirmationResult ? (
                 <Form {...phoneForm}>
                    <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                        <FormField
                            control={phoneForm.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 123 456 7890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send OTP
                        </Button>
                    </form>
                </Form>
            ) : (
                <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                        <FormField
                            control={otpForm.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify & Sign In
                        </Button>
                         <p className="text-center text-sm">
                            <Button variant="link" type="button" onClick={() => setConfirmationResult(null)} className="p-0 h-auto">
                                Use a different phone number
                            </Button>
                        </p>
                    </form>
                </Form>
            )}
        </div>
    )
}
