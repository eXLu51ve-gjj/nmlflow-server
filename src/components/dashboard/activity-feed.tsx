"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, CheckSquare, UserPlus, TrendingUp } from "lucide-react";

const getActivityIcon = (type: string, action: string) => {
  if (type === "lead") return Users;
  if (type === "task") return CheckSquare;
  if (type === "team") return UserPlus;
  return TrendingUp;
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "lead":
      return "from-indigo-500 to-blue-500";
    case "task":
      return "from-emerald-500 to-teal-500";
    case "team":
      return "from-violet-500 to-purple-500";
    default:
      return "from-slate-500 to-slate-600";
  }
};

const formatTime = (timestamp: string, language: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return language === "ru" ? "только что" : "just now";
  if (diffMins < 60) return `${diffMins} ${language === "ru" ? "мин" : "min"}`;
  if (diffHours < 24) return `${diffHours} ${language === "ru" ? "ч" : "h"}`;
  return `${diffDays} ${language === "ru" ? "дн" : "d"}`;
};

export function ActivityFeed() {
  const { language, activities, teamMembers } = useStore();

  const getUser = (userId: string) => {
    return teamMembers.find((m) => m.id === userId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "glass-theme",
        "p-6"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-app-text">
          {t("dashboard.teamActivity", language)}
        </h3>
        <span className="text-sm text-app-text-muted">
          {language === "ru" ? "Сегодня" : "Today"}
        </span>
      </div>

      {/* Activity List */}
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {activities.slice(0, 10).map((activity, index) => {
            const Icon = getActivityIcon(activity.type, activity.action);
            const user = getUser(activity.userId);
            const colorClass = getActivityColor(activity.type);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-4 group"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl",
                    "bg-gradient-to-br flex items-center justify-center",
                    colorClass
                  )}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-app-text truncate">{activity.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {user && (
                      <>
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-app-text-muted">{user.name}</span>
                        <span className="text-xs text-app-text-muted">•</span>
                      </>
                    )}
                    <span className="text-xs text-app-text-muted">
                      {formatTime(activity.timestamp, language)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
