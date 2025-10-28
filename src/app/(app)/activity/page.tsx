import ActivityTracker from "@/components/health-wise/activity-tracker";

export default function ActivityPage() {
  return (
     <div>
      <h1 className="text-2xl font-bold font-headline text-foreground mb-4">
        Activity Tracker
      </h1>
      <ActivityTracker />
    </div>
  );
}
