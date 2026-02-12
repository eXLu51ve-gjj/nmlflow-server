"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserPlus, Plus, FileText, Calendar } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    labelKey: "dashboard.newLead" as const,
    icon: UserPlus,
    href: "/crm",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    labelKey: "dashboard.newTask" as const,
    icon: Plus,
    href: "/tasks",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    labelRu: "Отчёт",
    labelEn: "Report",
    icon: FileText,
    href: "#",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    labelRu: "Встреча",
    labelEn: "Meeting",
    icon: Calendar,
    href: "#",
    gradient: "from-orange-500 to-amber-500",
  },
];

export function QuickActions() {
  const { language } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "glass-theme",
        "p-6"
      )}
    >
      {/* Header */}
      <h3 className="text-lg font-semibold text-white mb-4">
        {t("dashboard.quickActions", language)}
      </h3>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const label =
            "labelKey" in action && action.labelKey
              ? t(action.labelKey as any, language)
              : language === "ru"
              ? action.labelRu
              : action.labelEn;

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={action.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-auto py-4 flex flex-col items-center gap-2",
                    "bg-slate-800/40 hover:bg-slate-800/60 border border-white/10",
                    "rounded-xl transition-all duration-200"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      "bg-gradient-to-br",
                      action.gradient
                    )}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-slate-300">{label}</span>
                </Button>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
