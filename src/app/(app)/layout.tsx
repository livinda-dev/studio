import BottomNavbar from "@/components/health-wise/bottom-navbar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto p-4 md:p-8 mb-20">
            {children}
          </main>
          <BottomNavbar />
        </div>
    );
}
