import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/lib/data";
import { TooltipProvider } from "@/components/Tooltip";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Patient Funnel Analytics",
  description: "Next.js Patient Funnel Analytics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col lg:flex-row">
        <DataProvider>
          <TooltipProvider>
            <Sidebar />
            <main className="flex-1 flex justify-center w-full overflow-y-auto">
              <div className="w-full max-w-[1280px] px-[32px] py-[40px]">
                {children}
              </div>
            </main>
          </TooltipProvider>
        </DataProvider>
      </body>
    </html>
  );
}
