"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, HeartPulse, User, CloudSun, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/chat", label: "Chat", icon: Bot },
  { href: "/activity", label: "Activity", icon: HeartPulse },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-t-lg md:hidden">
      <div className="container mx-auto grid h-16 max-w-lg grid-cols-4 items-center">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
            >
              <item.icon
                className={cn("h-6 w-6", isActive && "text-primary")}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "text-primary"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
