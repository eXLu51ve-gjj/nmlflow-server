"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card backdrop-blur-xl border border-glass-border rounded-xl p-3 shadow-xl">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-400">
              {entry.name === "revenue" ? "Выручка" : "Прогноз"}:
            </span>
            <span className="text-white font-medium">
              {new Intl.NumberFormat("ru-RU").format(entry.value)} ₽
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const monthNamesRu = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function RevenueChart() {
  const { language, leads, tasks, revenueSettings } = useStore();

  // Calculate revenue data based on all enabled sources
  const data = useMemo(() => {
    const now = new Date();
    const monthNames = language === "ru" ? monthNamesRu : monthNamesEn;
    
    // Get last 6 months
    const months: { month: string; revenue: number; forecast: number; date: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[date.getMonth()],
        revenue: 0,
        forecast: 0,
        date,
      });
    }

    // Calculate from all enabled sources
    const enabledSources = revenueSettings.sources.filter(s => s.enabled);
    
    enabledSources.forEach(source => {
      if (source.type === "crm") {
        const closedLeads = leads.filter(l => l.status === "closed");
        closedLeads.forEach(lead => {
          const leadDate = new Date(lead.createdAt);
          const monthData = months.find(m => 
            m.date.getMonth() === leadDate.getMonth() && 
            m.date.getFullYear() === leadDate.getFullYear()
          );
          if (monthData) {
            if (source.fixedAmount > 0) {
              monthData.revenue += source.fixedAmount;
            } else {
              monthData.revenue += lead.value || 0;
            }
          }
        });
      } else if (source.type === "project") {
        // Only calculate if project AND column AND amount are set
        if (source.projectId && source.columnId && source.fixedAmount > 0) {
          const projectTasks = tasks.filter(
            t => t.projectId === source.projectId && t.status === source.columnId
          );
          projectTasks.forEach(task => {
            const taskDate = new Date(task.createdAt);
            const monthData = months.find(m => 
              m.date.getMonth() === taskDate.getMonth() && 
              m.date.getFullYear() === taskDate.getFullYear()
            );
            if (monthData) {
              monthData.revenue += source.fixedAmount;
            }
          });
        }
      }
    });

    // Calculate forecast
    const revenueValues = months.map(m => m.revenue).filter(v => v > 0);
    const avgRevenue = revenueValues.length > 0 
      ? revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length 
      : 0;
    
    const currentMonthIdx = months.findIndex(m => 
      m.date.getMonth() === now.getMonth() && m.date.getFullYear() === now.getFullYear()
    );
    if (currentMonthIdx >= 0) {
      months[currentMonthIdx].forecast = Math.round(avgRevenue * 1.1);
    }
    
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    months.push({
      month: monthNames[nextMonth.getMonth()],
      revenue: 0,
      forecast: Math.round(avgRevenue * 1.15),
      date: nextMonth,
    });

    return months.map(({ month, revenue, forecast }) => ({ month, revenue, forecast }));
  }, [leads, tasks, revenueSettings, language]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "glass-theme",
        "p-6"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {t("dashboard.revenueForecast", language)}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {language === "ru" ? "За последние 6 месяцев" : "Last 6 months"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-sm text-slate-400">
              {language === "ru" ? "Выручка" : "Revenue"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-sm text-slate-400">
              {language === "ru" ? "Прогноз" : "Forecast"}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              name="revenue"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#forecastGradient)"
              name="forecast"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
