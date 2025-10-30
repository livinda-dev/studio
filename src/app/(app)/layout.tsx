import BottomNavbar from "@/components/health-wise/bottom-navbar";
import TopNavbar from "@/components/health-wise/top-navbar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
          <TopNavbar />
          <main className="flex-grow container mx-auto p-4 md:p-8 md:mb-0 mb-20">
            {children}
          </main>
          <BottomNavbar />
        </div>
    );
}
