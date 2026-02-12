"use client";

import { useStore } from "@/store";
import { motion } from "framer-motion";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useStore();

  return (
    <motion.main
      initial={false}
      animate={{
        marginLeft: sidebarCollapsed ? 80 : 260,
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen"
    >
      {children}
    </motion.main>
  );
}
