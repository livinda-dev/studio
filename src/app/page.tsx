import { User, Bot, HeartPulse } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SymptomChecker from "@/components/health-wise/symptom-checker";
import UserProfile from "@/components/health-wise/user-profile";
import ActivityTracker from "@/components/health-wise/activity-tracker";
import WeatherAlert from "@/components/health-wise/weather-alert";
import DailyTip from "@/components/health-wise/daily-tip";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-card shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-foreground">
              HealthWise Companion
            </h1>
          </div>
          <Avatar>
            <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" alt="User Avatar" data-ai-hint="person face" />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SymptomChecker />
          </div>
          <div className="flex flex-col gap-8">
            <UserProfile />
            <ActivityTracker />
            <WeatherAlert />
            <DailyTip />
          </div>
        </div>
      </main>
    </div>
  );
}
