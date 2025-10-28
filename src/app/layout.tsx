import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import BottomNavbar from '@/components/health-wise/bottom-navbar';

export const metadata: Metadata = {
  title: 'HealthWise Companion',
  description: 'An AI-powered health companion for symptom guidance, activity tracking, and daily wellness.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto p-4 md:p-8 mb-20">
            {children}
          </main>
          <BottomNavbar />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
