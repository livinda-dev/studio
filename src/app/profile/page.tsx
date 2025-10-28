import UserProfile from "@/components/health-wise/user-profile";

export default function ProfilePage() {
  return (
    <div>
       <h1 className="text-2xl font-bold font-headline text-foreground mb-4">
        My Profile
      </h1>
      <UserProfile />
    </div>
  );
}
