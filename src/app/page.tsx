"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Users, CheckSquare, TrendingUp, DollarSign } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RevenueSettings } from "@/components/dashboard/revenue-settings";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TeamWidget } from "@/components/dashboard/team-widget";

export default function DashboardPage() {
  const { language, leads, tasks, projects, currentUser, isAdmin, revenueSettings } = useStore();
  const router = useRouter();

  // Redirect non-admin users to tasks page
  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/tasks");
    }
  }, [isAdmin, router]);

  // Don't render dashboard for non-admins
  if (!isAdmin()) {
    return null;
  }

  // Calculate stats
  const totalLeads = leads.length;
  const activeLeads = leads.filter((l) => l.status !== "closed").length;
  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  
  // Calculate revenue based on settings (all enabled sources)
  const totalRevenue = (() => {
    let total = 0;
    const enabledSources = revenueSettings.sources.filter(s => s.enabled);
    
    enabledSources.forEach(source => {
      if (source.type === "crm") {
        const closedLeads = leads.filter((l) => l.status === "closed");
        if (source.fixedAmount > 0) {
          total += closedLeads.length * source.fixedAmount;
        } else {
          total += closedLeads.reduce((sum, l) => sum + (l.value || 0), 0);
        }
      } else if (source.type === "project") {
        // Only calculate if project AND column AND amount are set
        if (source.projectId && source.columnId && source.fixedAmount > 0) {
          const projectTasks = tasks.filter(
            t => t.projectId === source.projectId && t.status === source.columnId
          );
          total += projectTasks.length * source.fixedAmount;
        }
      }
    });
    
    return Math.round(total);
  })();

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white">
          {t("dashboard.welcome", language)}, {currentUser.name}
        </h1>
        <p className="text-slate-400 mt-1">
          {language === "ru"
            ? "Вот что происходит с вашими проектами сегодня"
            : "Here's what's happening with your projects today"}
        </p>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Stats Row - 4 cards */}
        <div className="col-span-12 lg:col-span-3">
          <StatCard
            title={t("dashboard.totalLeads", language)}
            value={totalLeads}
            change="+12% vs last month"
            changeType="positive"
            icon={Users}
            gradient="from-indigo-500 to-blue-500"
            delay={0}
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatCard
            title={t("dashboard.activeTasks", language)}
            value={activeTasks}
            change={`${completedTasks} ${language === "ru" ? "завершено" : "completed"}`}
            changeType="neutral"
            icon={CheckSquare}
            gradient="from-emerald-500 to-teal-500"
            delay={0.1}
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatCard
            title={t("dashboard.activeLeads", language)}
            value={activeLeads}
            change="+3 this week"
            changeType="positive"
            icon={TrendingUp}
            gradient="from-violet-500 to-purple-500"
            delay={0.2}
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatCard
            title={language === "ru" ? "Выручка" : "Revenue"}
            value={totalRevenue}
            prefix=""
            suffix=" ₽"
            change="+24% vs last month"
            changeType="positive"
            icon={DollarSign}
            gradient="from-orange-500 to-amber-500"
            delay={0.3}
          />
        </div>

        {/* Revenue Chart - Large */}
        <div className="col-span-12 lg:col-span-8">
          <RevenueChart />
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 lg:col-span-4">
          <QuickActions />
        </div>

        {/* Revenue Settings */}
        <div className="col-span-12 lg:col-span-4">
          <RevenueSettings />
        </div>

        {/* Team Widget */}
        <div className="col-span-12 lg:col-span-4">
          <TeamWidget />
        </div>
      </div>
    </div>
  );
}
