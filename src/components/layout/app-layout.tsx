"use client";

import { usePathname } from "next/navigation";
import { useStore } from "@/store";
import { Sidebar } from "./sidebar";
import { MainContent } from "./main-content";
import { Background } from "./background";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ChatWidget } from "@/components/chat/chat-widget";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useStore();
  
  // Login page - no sidebar, no auth guard wrapper (handled in page)
  if (pathname === "/login") {
    return (
      <div className="min-h-screen relative">
        <Background />
        {children}
      </div>
    );
  }
  
  // Protected pages - with sidebar and auth guard
  return (
    <AuthGuard>
      <div className="min-h-screen relative">
        <Background />
        <Sidebar />
        <MainContent>{children}</MainContent>
        <ChatWidget />
      </div>
    </AuthGuard>
  );
}
