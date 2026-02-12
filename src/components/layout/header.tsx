"use client";

import { useStore } from "@/store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Search, Bell, Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function Header() {
  const { language, setLanguage, sidebarCollapsed, currentUser } = useStore();
  const { theme, setTheme } = useTheme();

  const initials = currentUser.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.header
      initial={false}
      animate={{ left: sidebarCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed top-0 right-0 z-30 h-16",
        "glass-header",
        "flex items-center justify-between px-6"
      )}
    >
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder={t("common.search", language)}
          className="pl-10 bg-slate-800/40 border-white/10 focus:border-indigo-500/50 rounded-xl"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-white/10"
            >
              <Globe className="w-5 h-5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="glass-dropdown text-white"
          >
            <DropdownMenuItem
              onClick={() => setLanguage("ru")}
              className={cn("text-white hover:bg-white/10", language === "ru" && "bg-indigo-500/20")}
            >
              🇷🇺 Русский
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage("en")}
              className={cn("text-white hover:bg-white/10", language === "en" && "bg-indigo-500/20")}
            >
              🇬🇧 English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-xl hover:bg-white/10"
        >
          <Sun className="w-5 h-5 text-slate-400 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-5 h-5 text-slate-400 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-white/10"
        >
          <Bell className="w-5 h-5 text-slate-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full" />
        </Button>

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-xl hover:bg-white/10 p-1"
            >
              <Avatar className="w-9 h-9">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="glass-dropdown text-white min-w-[180px]"
          >
            <div className="px-3 py-2 border-b border-white/10">
              <p className="text-sm font-medium text-white">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
            </div>
            <Link href="/settings">
              <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                {t("settings.profile", language)}
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                {t("settings.title", language)}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
