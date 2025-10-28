import SymptomChecker from "@/components/health-wise/symptom-checker";

export default function ChatPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-headline text-foreground mb-4">
        AI Symptom Checker
      </h1>
      <SymptomChecker />
    </div>
  );
}
