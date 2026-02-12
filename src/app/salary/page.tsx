"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Wallet, Calendar, Car, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { workDaysAPI, teamAPI, settingsAPI } from "@/lib/api";

interface WorkDay {
  id: string;
  date: string;
  withCar: boolean;
  isDouble: boolean;
  memberId: string;
}

export default function SalaryPage() {
  const { language, currentUser, systemSettings, updateSystemSettings } = useStore();
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [memberInfo, setMemberInfo] = useState<{ id: string; dailyRate: number; carBonus: number } | null>(null);
  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth());
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // Load settings, work days and member info
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load system settings (for payday)
        const settings = await settingsAPI.get();
        if (settings) {
          updateSystemSettings(settings);
        }

        // Get all work days
        const days = await workDaysAPI.getAll();
        setWorkDays(days);

        // Get team members to find current user's rates
        const team = await teamAPI.getAll();
        const member = team.find((m: any) => 
          m.email === currentUser.email || m.userId === currentUser.id
        );
        if (member) {
          setMemberInfo({
            id: member.id,
            dailyRate: member.dailyRate || 0,
            carBonus: member.carBonus || 0,
          });
        }
      } catch (error) {
        console.error("Failed to load salary data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser]);

  // Get salary period based on payday setting
  const payday = systemSettings.salaryPayday || 1;
  
  const getSalaryPeriod = () => {
    let startDate: Date, endDate: Date;
    if (payday === 1) {
      // Simple case: 1st to end of month
      startDate = new Date(salaryYear, salaryMonth, 1);
      endDate = new Date(salaryYear, salaryMonth + 1, 0);
    } else {
      // From payday of previous month to payday-1 of selected month
      const prevMonth = salaryMonth === 0 ? 11 : salaryMonth - 1;
      const prevYear = salaryMonth === 0 ? salaryYear - 1 : salaryYear;
      startDate = new Date(prevYear, prevMonth, payday);
      endDate = new Date(salaryYear, salaryMonth, payday - 1);
    }
    
    // Generate array of days in period
    const periodDays: { date: Date; day: number; isNewMonth: boolean }[] = [];
    const current = new Date(startDate);
    let lastMonth = current.getMonth();
    
    while (current <= endDate) {
      const isNewMonth = current.getMonth() !== lastMonth;
      periodDays.push({
        date: new Date(current),
        day: current.getDate(),
        isNewMonth
      });
      lastMonth = current.getMonth();
      current.setDate(current.getDate() + 1);
    }
    
    return { startDate, endDate, periodDays };
  };

  // Filter work days for current user and salary period
  const myWorkDays = useMemo(() => {
    if (!memberInfo) return [];
    
    const { startDate, endDate } = getSalaryPeriod();
    
    return workDays.filter((wd) => {
      // Check if this work day belongs to current user
      if (wd.memberId !== memberInfo.id) return false;
      
      // Check if in salary period
      const wdDate = new Date(wd.date);
      return wdDate >= startDate && wdDate <= endDate;
    });
  }, [workDays, memberInfo, salaryMonth, salaryYear, payday]);

  // Calculate salary
  const salary = useMemo(() => {
    if (!memberInfo) return { total: 0, days: 0, carDays: 0, doubleDays: 0 };
    
    let total = 0;
    let days = 0;
    let carDays = 0;
    let doubleDays = 0;

    myWorkDays.forEach((wd) => {
      let dayPay = memberInfo.dailyRate;
      if (wd.isDouble) {
        dayPay *= 2;
        doubleDays++;
      }
      if (wd.withCar) {
        dayPay += memberInfo.carBonus;
        carDays++;
      }
      total += dayPay;
      days++;
    });

    return { total, days, carDays, doubleDays };
  }, [myWorkDays, memberInfo]);

  // Get work day for specific date
  const getWorkDay = (dateStr: string) => {
    return myWorkDays.find((wd) => wd.date === dateStr);
  };

  const months = language === "ru" 
    ? ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => {
    if (salaryMonth === 0) {
      setSalaryMonth(11);
      setSalaryYear(salaryYear - 1);
    } else {
      setSalaryMonth(salaryMonth - 1);
    }
  };

  const nextMonth = () => {
    if (salaryMonth === 11) {
      setSalaryMonth(0);
      setSalaryYear(salaryYear + 1);
    } else {
      setSalaryMonth(salaryMonth + 1);
    }
  };

  const { startDate, endDate, periodDays } = getSalaryPeriod();
  const formatDate = (d: Date) => `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  const periodStr = `${formatDate(startDate)} — ${formatDate(endDate)}`;
  const todayStr = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400">{language === "ru" ? "Загрузка..." : "Loading..."}</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Wallet className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
          {language === "ru" ? "Моя зарплата" : "My Salary"}
        </h1>
        <p className="text-slate-400 mt-1">
          {language === "ru" 
            ? "Просмотр отработанных дней и начисленной зарплаты" 
            : "View worked days and earned salary"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salary Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 p-6 rounded-2xl glass-theme"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            {language === "ru" ? "Итого за период" : "Period Total"}
          </h2>

          {/* Total Salary */}
          <div className="text-center py-6 mb-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
            <div className="text-4xl font-bold text-emerald-400">
              {salary.total.toLocaleString()} ₽
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {periodStr}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-slate-400">{language === "ru" ? "Отработано дней" : "Days worked"}</span>
              <span className="text-white font-medium">{salary.days}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-slate-400 flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />
                {language === "ru" ? "С доп. ставкой" : "With bonus"}
              </span>
              <span className="text-white font-medium">{salary.carDays}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                {language === "ru" ? "Двойные" : "Double rate"}
              </span>
              <span className="text-white font-medium">{salary.doubleDays}</span>
            </div>
          </div>

          {/* Rates Info */}
          {memberInfo && (
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-500">
              <div>{language === "ru" ? "Ставка" : "Rate"}: {memberInfo.dailyRate} ₽/{language === "ru" ? "день" : "day"}</div>
              <div>{language === "ru" ? "Доп. ставка" : "Bonus"}: +{memberInfo.carBonus} ₽</div>
            </div>
          )}
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-6 rounded-2xl glass-theme"
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={prevMonth} className="text-slate-400 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white capitalize">{months[salaryMonth]} {salaryYear}</h2>
              <p className="text-xs text-slate-500">{periodStr}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={nextMonth} className="text-slate-400 hover:text-white">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Days Grid - Period based */}
          <div className="flex flex-wrap gap-2">
            {periodDays.map((dayInfo, idx) => {
              const { date, day, isNewMonth } = dayInfo;
              const dateStr = date.toISOString().split('T')[0];
              const workDay = getWorkDay(dateStr);
              const isToday = dateStr === todayStr;
              const isWorked = !!workDay;
              const hasCar = workDay?.withCar || false;
              const isDouble = workDay?.isDouble || false;
              
              return (
                <div key={idx} className="flex items-center">
                  {/* Month separator */}
                  {isNewMonth && idx > 0 && (
                    <div className="w-px h-10 bg-indigo-500/50 mx-2" />
                  )}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex flex-col items-center justify-center text-sm transition-all relative",
                      isWorked && isDouble && "bg-violet-500/30 border border-violet-500/50 text-violet-300",
                      isWorked && hasCar && !isDouble && "bg-amber-500/30 border border-amber-500/50 text-amber-300",
                      isWorked && !hasCar && !isDouble && "bg-emerald-500/30 border border-emerald-500/50 text-emerald-300",
                      !isWorked && isToday && "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300",
                      !isWorked && !isToday && "bg-white/5 text-slate-500"
                    )}
                  >
                    <span className={cn("font-medium", isWorked && "text-white")}>{day}</span>
                    {isWorked && (
                      <div className="flex gap-0.5">
                        {hasCar && <Car className="w-2.5 h-2.5 text-amber-400" />}
                        {isDouble && <Zap className="w-2.5 h-2.5 text-violet-400" />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500/50" />
              <span>{language === "ru" ? "Рабочий день" : "Work day"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500/50" />
              <span>{language === "ru" ? "С доп. ставкой" : "With bonus"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-violet-500/30 border border-violet-500/50" />
              <span>{language === "ru" ? "Двойной день" : "Double day"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-500/20 border border-cyan-500/50" />
              <span>{language === "ru" ? "Сегодня" : "Today"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-px h-4 bg-indigo-500/50" />
              <span>{language === "ru" ? "Новый месяц" : "New month"}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
