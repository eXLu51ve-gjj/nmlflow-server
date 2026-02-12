"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  prefix = "",
  suffix = "",
  change,
  changeType = "positive",
  icon: Icon,
  gradient,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "glass-theme",
        "p-6 group cursor-pointer"
      )}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20",
          "transition-opacity duration-300 group-hover:opacity-40",
          gradient
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4",
          "bg-gradient-to-br",
          gradient
        )}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Title */}
      <p className="text-sm text-slate-400 mb-1">{title}</p>

      {/* Value with CountUp */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">
          {prefix}
          <CountUp end={value} duration={2} separator=" " />
          {suffix}
        </span>
      </div>

      {/* Change indicator */}
      {change && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              "text-sm font-medium",
              changeType === "positive" && "text-emerald-500",
              changeType === "negative" && "text-red-500",
              changeType === "neutral" && "text-slate-400"
            )}
          >
            {change}
          </span>
        </div>
      )}

      {/* Hover glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
          "transition-opacity duration-300",
          "bg-gradient-to-br from-transparent via-transparent to-white/5"
        )}
      />
    </motion.div>
  );
}
