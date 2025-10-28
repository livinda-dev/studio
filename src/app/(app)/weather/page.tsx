import DailyTip from "@/components/health-wise/daily-tip";
import WeatherAlert from "@/components/health-wise/weather-alert";

export default function WeatherPage() {
  return (
    <div className="space-y-8">
       <div>
         <h1 className="text-2xl font-bold font-headline text-foreground mb-4">
            Weather & Health Tip
         </h1>
         <div className="flex flex-col gap-8">
            <WeatherAlert />
            <DailyTip />
         </div>
       </div>
    </div>
  );
}
