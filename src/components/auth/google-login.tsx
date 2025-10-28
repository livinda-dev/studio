"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/firebase/provider";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GoogleLogin() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { auth } = useFirebase();
    const { toast } = useToast();
    
    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // On success, AuthProvider will handle the redirect.
        } catch (error: any) {
             console.error("Google Sign-In Error:", error);
             toast({
                variant: "destructive",
                title: "Google Sign-In Failed",
                description: error.message || "Could not sign in with Google. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
         <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
            {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177 56.5L357 128C327.9 100.3 291.8 84 248 84c-83.3 0-151.7 68.3-151.7 172 0 103.7 68.4 172 151.7 172 87.3 0 142.2-61.2 146.9-138.6H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
                </svg>
            )}
            Sign in with Google
        </Button>
    )
}
