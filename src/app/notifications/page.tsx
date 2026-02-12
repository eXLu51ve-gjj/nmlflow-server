"use client";

import { useState, useMemo, useEffect } from "react";
import { useStore, Activity } from "@/store";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Search,
  Filter,
  CheckSquare,
  UserPlus,
  ArrowRight,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Clock,
  X,
  Archive,
  MessageSquare,
  ExternalLink,
  PieChart,
} from "lucide-react";

// Типы действий с иконками и цветами
const actionConfig: Record<string, { icon: any; color: string; bgColor: string; label: { ru: string; en: string } }> = {
  created: { icon: Plus, color: "text-emerald-400", bgColor: "bg-emerald-500/20", label: { ru: "Создано", en: "Created" } },
  moved: { icon: ArrowRight, color: "text-blue-400", bgColor: "bg-blue-500/20", label: { ru: "Перемещено", en: "Moved" } },
  completed: { icon: CheckSquare, color: "text-violet-400", bgColor: "bg-violet-500/20", label: { ru: "Завершено", en: "Completed" } },
  deleted: { icon: Trash2, color: "text-red-400", bgColor: "bg-red-500/20", label: { ru: "Удалено", en: "Deleted" } },
  updated: { icon: Edit, color: "text-amber-400", bgColor: "bg-amber-500/20", label: { ru: "Обновлено", en: "Updated" } },
  joined: { icon: UserPlus, color: "text-cyan-400", bgColor: "bg-cyan-500/20", label: { ru: "Присоединился", en: "Joined" } },
  closed: { icon: CheckSquare, color: "text-green-400", bgColor: "bg-green-500/20", label: { ru: "Закрыто", en: "Closed" } },
  archived: { icon: Archive, color: "text-slate-400", bgColor: "bg-slate-500/20", label: { ru: "Архивировано", en: "Archived" } },
  commented: { icon: MessageSquare, color: "text-indigo-400", bgColor: "bg-indigo-500/20", label: { ru: "Комментарий", en: "Commented" } },
};

const typeConfig: Record<string, { label: { ru: string; en: string }; color: string }> = {
  task: { label: { ru: "Задача", en: "Task" }, color: "text-indigo-400" },
  lead: { label: { ru: "Лид", en: "Lead" }, color: "text-emerald-400" },
  team: { label: { ru: "Команда", en: "Team" }, color: "text-amber-400" },
};

// Цвета для pie chart - контрастные, в разброс
const pieColors = [
  "rgba(139, 92, 246, 0.5)",   // violet (фиолетовый)
  "rgba(249, 115, 22, 0.5)",   // orange (оранжевый)
  "rgba(34, 197, 94, 0.5)",    // green (зелёный)
  "rgba(59, 130, 246, 0.5)",   // blue (синий)
  "rgba(239, 68, 68, 0.5)",    // red (красный)
  "rgba(20, 184, 166, 0.5)",   // teal (бирюзовый)
  "rgba(234, 179, 8, 0.5)",    // yellow (жёлтый)
  "rgba(236, 72, 153, 0.5)",   // pink (розовый)
  "rgba(99, 102, 241, 0.5)",   // indigo (индиго)
  "rgba(6, 182, 212, 0.5)",    // cyan (голубой)
];

const pieColorsHex = [
  "#8b5cf6", "#f97316", "#22c55e", "#3b82f6", "#ef4444",
  "#14b8a6", "#eab308", "#ec4899", "#6366f1", "#06b6d4",
];

export default function NotificationsPage() {
  const { language, activities, teamMembers, tasks, leads, projects, setCurrentProject, clearActivities, maxActivities, setMaxActivities, currentUser, isAdmin } = useStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [chartAnimated, setChartAnimated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/tasks");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    setMounted(true);
    // Запускаем анимацию диаграммы через небольшую задержку
    const timer = setTimeout(() => setChartAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Don't render for non-admins
  if (!isAdmin()) {
    return null;
  }

  // Статистика активности по участникам
  const userStats = useMemo(() => {
    const stats: Record<string, { total: number; created: number; moved: number; commented: number; updated: number }> = {};
    
    activities.forEach((activity) => {
      const userId = activity.userId;
      if (!stats[userId]) {
        stats[userId] = { total: 0, created: 0, moved: 0, commented: 0, updated: 0 };
      }
      stats[userId].total++;
      if (activity.action === "created") stats[userId].created++;
      if (activity.action === "moved") stats[userId].moved++;
      if (activity.action === "commented") stats[userId].commented++;
      if (activity.action === "updated") stats[userId].updated++;
    });

    return Object.entries(stats)
      .map(([oderId, data]) => {
        // Find activity with this userId to get name/avatar
        const activityWithUser = activities.find(a => a.userId === oderId && a.userName);
        const member = teamMembers.find((m) => m.userId === oderId);
        return {
          userId: oderId,
          name: activityWithUser?.userName || member?.name || (oderId === currentUser.id ? currentUser.name : "Неизвестный"),
          avatar: activityWithUser?.userAvatar || member?.avatar || (oderId === currentUser.id ? currentUser.avatar : undefined),
          ...data,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [activities, teamMembers, currentUser]);

  const totalActivities = activities.length;

  // Фильтрация активностей
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      if (searchQuery && !activity.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterType !== "all" && activity.type !== filterType) return false;
      if (filterAction !== "all" && activity.action !== filterAction) return false;
      if (filterUser !== "all" && activity.userId !== filterUser) return false;
      if (filterDate !== "all") {
        const activityDate = new Date(activity.timestamp);
        const now = new Date();
        if (filterDate === "today" && activityDate.toDateString() !== now.toDateString()) return false;
        if (filterDate === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (activityDate < weekAgo) return false;
        }
        if (filterDate === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (activityDate < monthAgo) return false;
        }
      }
      return true;
    });
  }, [activities, searchQuery, filterType, filterAction, filterUser, filterDate]);

  // Пагинация
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(start, start + itemsPerPage);
  }, [filteredActivities, currentPage, itemsPerPage]);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterAction, filterUser, filterDate]);

  // Группировка по дате (для пагинированных данных)
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};
    paginatedActivities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = language === "ru" ? "Сегодня" : "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = language === "ru" ? "Вчера" : "Yesterday";
      } else {
        key = date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "long", year: "numeric" });
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(activity);
    });
    return groups;
  }, [paginatedActivities, language]);

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "short" });
    const timeStr = date.toLocaleTimeString(language === "ru" ? "ru-RU" : "en-US", { hour: "2-digit", minute: "2-digit" });
    return `${dateStr}, ${timeStr}`;
  };

  const canNavigate = (activity: Activity) => {
    if (!activity.targetId || activity.action === "deleted") return false;
    if (activity.type === "task") return tasks.some((t) => t.id === activity.targetId);
    if (activity.type === "lead") return leads.some((l) => l.id === activity.targetId);
    return false;
  };

  const handleNavigate = (activity: Activity) => {
    if (activity.projectId) setCurrentProject(activity.projectId);
    if (activity.type === "task") router.push(`/tasks?highlight=${activity.targetId}`);
    else if (activity.type === "lead") router.push(`/crm?highlight=${activity.targetId}`);
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId)?.name || null;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterAction("all");
    setFilterUser("all");
    setFilterDate("all");
  };

  const hasActiveFilters = searchQuery || filterType !== "all" || filterAction !== "all" || filterUser !== "all" || filterDate !== "all";

  // SVG Pie Chart с линиями-указателями
  const renderPieChart = () => {
    // Показываем заглушку до монтирования для избежания hydration mismatch
    if (!mounted) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center">
            <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
            <p className="text-sm">{language === "ru" ? "Загрузка..." : "Loading..."}</p>
          </div>
        </div>
      );
    }

    if (userStats.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center">
            <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{language === "ru" ? "Нет данных" : "No data"}</p>
          </div>
        </div>
      );
    }

    const width = 700;
    const height = 450;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 130;
    const innerRadius = 58; // радиус внутренней дуги сегментов (с небольшим отступом от центра)
    const centerCircleRadius = 50; // радиус центрального круга
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number, r: number = radius) => {
      const angle = 2 * Math.PI * percent - Math.PI / 2;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      return [centerX + x * r, centerY + y * r];
    };

    // Сортируем по убыванию для правильного распределения цветов
    const sortedStats = [...userStats].sort((a, b) => b.total - a.total);
    const maxPercent = sortedStats[0]?.total / totalActivities || 0;

    const segments: { path: string; color: string; colorHex: string; percent: number; midAngle: number; user: typeof sortedStats[0]; segRadius: number }[] = [];
    
    sortedStats.forEach((user, index) => {
      const percent = user.total / totalActivities;
      
      // Радиус зависит от процента - больше процент = больше радиус
      const extraRadius = (percent / maxPercent) * 50; // до 50px дополнительно
      const segRadius = radius + extraRadius;
      
      // Gap в пикселях, конвертируем в угол для каждого радиуса
      const gapPx = 3; // отступ в пикселях
      const outerGapAngle = gapPx / segRadius; // угол для внешнего радиуса
      const innerGapAngle = gapPx / innerRadius; // угол для внутреннего радиуса
      
      const startAngle = 2 * Math.PI * cumulativePercent - Math.PI / 2;
      const endAngle = 2 * Math.PI * (cumulativePercent + percent) - Math.PI / 2;
      
      // Внешняя дуга с отступом
      const [startX, startY] = [
        centerX + Math.cos(startAngle + outerGapAngle) * segRadius,
        centerY + Math.sin(startAngle + outerGapAngle) * segRadius,
      ];
      const [endX, endY] = [
        centerX + Math.cos(endAngle - outerGapAngle) * segRadius,
        centerY + Math.sin(endAngle - outerGapAngle) * segRadius,
      ];
      
      // Внутренняя дуга с отступом
      const [innerStartX, innerStartY] = [
        centerX + Math.cos(startAngle + innerGapAngle) * innerRadius,
        centerY + Math.sin(startAngle + innerGapAngle) * innerRadius,
      ];
      const [innerEndX, innerEndY] = [
        centerX + Math.cos(endAngle - innerGapAngle) * innerRadius,
        centerY + Math.sin(endAngle - innerGapAngle) * innerRadius,
      ];
      
      cumulativePercent += percent;
      const actualAngle = (endAngle - outerGapAngle) - (startAngle + outerGapAngle);
      const largeArcFlag = actualAngle > Math.PI ? 1 : 0;
      
      const pathData = [
        `M ${innerStartX} ${innerStartY}`,
        `L ${startX} ${startY}`,
        `A ${segRadius} ${segRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        `L ${innerEndX} ${innerEndY}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
        "Z",
      ].join(" ");

      const midPercent = cumulativePercent - percent / 2;
      const midAngle = 2 * Math.PI * midPercent - Math.PI / 2;

      segments.push({
        path: pathData,
        color: pieColors[index % pieColors.length],
        colorHex: pieColorsHex[index % pieColorsHex.length],
        percent,
        midAngle,
        user,
        segRadius,
      });
    });

    return (
      <div className="relative">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.15)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </radialGradient>
          </defs>
          
          {/* Фоновое свечение под диаграммой - убрано для прозрачности */}
          
          {/* Сегменты */}
          {segments.map((seg, index) => (
            <g key={seg.user.userId}>
              <path
                d={seg.path}
                fill={seg.color}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="hover:opacity-80 cursor-pointer"
                style={{ 
                  filter: `drop-shadow(0 0 8px ${seg.colorHex}50)`,
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transform: chartAnimated ? 'scale(1)' : 'scale(0)',
                  opacity: chartAnimated ? 1 : 0,
                  transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s, opacity 0.4s ease ${index * 0.1}s`,
                }}
              />
              {/* Процент на сегменте */}
              {seg.percent > 0.05 && (() => {
                const labelRadius = (seg.segRadius + innerRadius) / 2;
                const [labelX, labelY] = [
                  centerX + Math.cos(seg.midAngle) * labelRadius,
                  centerY + Math.sin(seg.midAngle) * labelRadius,
                ];
                return (
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white text-xs font-bold"
                    style={{ 
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                      opacity: chartAnimated ? 1 : 0,
                      transition: `opacity 0.4s ease ${0.5 + index * 0.1}s`,
                    }}
                  >
                    {(seg.percent * 100).toFixed(0)}%
                  </text>
                );
              })()}
            </g>
          ))}

          {/* Линии-указатели */}
          {segments.map((seg, index) => {
            const lineStartRadius = seg.segRadius + 5;
            const lineEndRadius = seg.segRadius + 50;
            const [lineStartX, lineStartY] = [
              centerX + Math.cos(seg.midAngle) * lineStartRadius,
              centerY + Math.sin(seg.midAngle) * lineStartRadius,
            ];
            const [lineEndX, lineEndY] = [
              centerX + Math.cos(seg.midAngle) * lineEndRadius,
              centerY + Math.sin(seg.midAngle) * lineEndRadius,
            ];
            
            // Горизонтальная линия
            const isRight = seg.midAngle > -Math.PI / 2 && seg.midAngle < Math.PI / 2;
            const horizontalEndX = isRight ? lineEndX + 50 : lineEndX - 50;
            
            const lineDelay = 0.6 + index * 0.1;
            
            return (
              <g key={`line-${seg.user.userId}`} style={{ opacity: chartAnimated ? 1 : 0, transition: `opacity 0.4s ease ${lineDelay}s` }}>
                {/* Линия от сегмента */}
                <line
                  x1={lineStartX}
                  y1={lineStartY}
                  x2={lineEndX}
                  y2={lineEndY}
                  stroke={seg.colorHex}
                  strokeWidth="2"
                />
                {/* Горизонтальная линия */}
                <line
                  x1={lineEndX}
                  y1={lineEndY}
                  x2={horizontalEndX}
                  y2={lineEndY}
                  stroke={seg.colorHex}
                  strokeWidth="2"
                />
                {/* Точка на конце */}
                <circle
                  cx={horizontalEndX}
                  cy={lineEndY}
                  r="3"
                  fill={seg.colorHex}
                />
                {/* Имя участника */}
                <text
                  x={isRight ? horizontalEndX + 8 : horizontalEndX - 8}
                  y={lineEndY}
                  textAnchor={isRight ? "start" : "end"}
                  dominantBaseline="middle"
                  className="fill-white text-[11px]"
                >
                  {seg.user.name.split(" ")[0]}
                </text>
              </g>
            );
          })}

          {/* Центральный круг с glassmorphism */}
          <circle
            cx={centerX}
            cy={centerY}
            r={centerCircleRadius}
            fill="rgba(30, 41, 59, 0.9)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            style={{
              transformOrigin: `${centerX}px ${centerY}px`,
              transform: chartAnimated ? 'scale(1)' : 'scale(0)',
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
            }}
          />
          <text 
            x={centerX} 
            y={centerY - 8} 
            textAnchor="middle" 
            className="fill-white text-2xl font-bold"
            style={{
              opacity: chartAnimated ? 1 : 0,
              transition: 'opacity 0.4s ease 0.5s',
            }}
          >
            {totalActivities}
          </text>
          <text 
            x={centerX} 
            y={centerY + 12} 
            textAnchor="middle" 
            className="fill-slate-400 text-[10px]"
            style={{
              opacity: chartAnimated ? 1 : 0,
              transition: 'opacity 0.4s ease 0.6s',
            }}
          >
            {language === "ru" ? "действий" : "actions"}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {language === "ru" ? "Уведомления и логи" : "Notifications & Logs"}
          </h1>
          <p className="text-slate-400 text-sm">
            {filteredActivities.length} {language === "ru" ? "записей" : "entries"}
            {hasActiveFilters && <span className="text-indigo-400 ml-2">({language === "ru" ? "с фильтрами" : "filtered"})</span>}
          </p>
        </div>
        {activities.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(true)} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-2" />
            {language === "ru" ? "Очистить логи" : "Clear logs"}
          </Button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-6 p-4 rounded-2xl glass-theme">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium text-white">{language === "ru" ? "Фильтры" : "Filters"}</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-slate-400 hover:text-white">
              <X className="w-4 h-4 mr-1" />
              {language === "ru" ? "Сбросить" : "Clear"}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={language === "ru" ? "Поиск..." : "Search..."} className="pl-9 bg-slate-900/60 text-white h-9" style={{ borderColor: 'transparent' }} />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32 bg-slate-900/60 text-white h-9" style={{ borderColor: 'transparent' }}><SelectValue placeholder={language === "ru" ? "Тип" : "Type"} /></SelectTrigger>
            <SelectContent className="glass-dropdown text-white">
              <SelectItem value="all">{language === "ru" ? "Все типы" : "All types"}</SelectItem>
              <SelectItem value="task">{language === "ru" ? "Задачи" : "Tasks"}</SelectItem>
              <SelectItem value="lead">{language === "ru" ? "Лиды" : "Leads"}</SelectItem>
              <SelectItem value="team">{language === "ru" ? "Команда" : "Team"}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-36 bg-slate-900/60 text-white h-9" style={{ borderColor: 'transparent' }}><SelectValue placeholder={language === "ru" ? "Действие" : "Action"} /></SelectTrigger>
            <SelectContent className="glass-dropdown text-white">
              <SelectItem value="all">{language === "ru" ? "Все действия" : "All actions"}</SelectItem>
              <SelectItem value="created">{language === "ru" ? "Создано" : "Created"}</SelectItem>
              <SelectItem value="moved">{language === "ru" ? "Перемещено" : "Moved"}</SelectItem>
              <SelectItem value="updated">{language === "ru" ? "Обновлено" : "Updated"}</SelectItem>
              <SelectItem value="deleted">{language === "ru" ? "Удалено" : "Deleted"}</SelectItem>
              <SelectItem value="commented">{language === "ru" ? "Комментарий" : "Commented"}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-40 bg-slate-900/60 text-white h-9" style={{ borderColor: 'transparent' }}><SelectValue placeholder={language === "ru" ? "Участник" : "Member"} /></SelectTrigger>
            <SelectContent className="glass-dropdown text-white">
              <SelectItem value="all">{language === "ru" ? "Все участники" : "All members"}</SelectItem>
              {teamMembers.map((member) => (<SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger className="w-32 bg-slate-900/60 text-white h-9" style={{ borderColor: 'transparent' }}><SelectValue placeholder={language === "ru" ? "Период" : "Period"} /></SelectTrigger>
            <SelectContent className="glass-dropdown text-white">
              <SelectItem value="all">{language === "ru" ? "Всё время" : "All time"}</SelectItem>
              <SelectItem value="today">{language === "ru" ? "Сегодня" : "Today"}</SelectItem>
              <SelectItem value="week">{language === "ru" ? "Неделя" : "This week"}</SelectItem>
              <SelectItem value="month">{language === "ru" ? "Месяц" : "This month"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left - Pie Chart */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {language === "ru" ? "Активность команды" : "Team Activity"}
          </h2>
          
          {renderPieChart()}

          {/* Legend */}
          <div className="mt-4 space-y-1 rounded-xl glass-theme p-3">
            {[...userStats].sort((a, b) => b.total - a.total).map((user, index) => {
              const percent = totalActivities > 0 ? ((user.total / totalActivities) * 100).toFixed(1) : 0;
              return (
                <div key={user.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColorsHex[index % pieColorsHex.length] }} />
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-[10px] bg-slate-700">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white flex-1 truncate">{user.name}</span>
                  <span className="text-xs text-slate-400">{user.total} ({percent}%)</span>
                </div>
              );
            })}
          </div>

          {/* Stats breakdown */}
          {userStats.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-slate-400 mb-3">
                {language === "ru" ? "По типам действий" : "By action type"}
              </h3>
              <div className="grid grid-cols-2 gap-2 rounded-xl glass-theme p-3">
                {[
                  { key: "created", label: language === "ru" ? "Создано" : "Created", color: "text-emerald-400" },
                  { key: "moved", label: language === "ru" ? "Перемещено" : "Moved", color: "text-blue-400" },
                  { key: "commented", label: language === "ru" ? "Комментарии" : "Comments", color: "text-indigo-400" },
                  { key: "updated", label: language === "ru" ? "Обновлено" : "Updated", color: "text-amber-400" },
                ].map((stat) => {
                  const total = userStats.reduce((sum, u) => sum + (u as any)[stat.key], 0);
                  return (
                    <div key={stat.key} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span className={cn("text-xs", stat.color)}>{stat.label}</span>
                      <span className="text-sm font-medium text-white">{total}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right - Activity List */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {language === "ru" ? "Журнал действий" : "Activity Log"}
            </h2>
            <span className="text-xs text-slate-500">
              {filteredActivities.length} {language === "ru" ? "записей" : "entries"}
            </span>
          </div>

          {/* Pagination Controls */}
          {filteredActivities.length > 0 && (
            <div className="flex items-center justify-between gap-2 mb-4 p-2 rounded-xl bg-slate-900/50">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 h-7 text-xs text-slate-400 hover:text-white disabled:opacity-30"
                >
                  «
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 h-7 text-xs text-slate-400 hover:text-white disabled:opacity-30"
                >
                  ‹
                </Button>
                
                {(() => {
                  const pages: (number | string)[] = [];
                  const maxVisible = 5;
                  
                  if (totalPages <= maxVisible + 2) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    
                    if (currentPage > 3) pages.push("...");
                    
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);
                    
                    for (let i = start; i <= end; i++) pages.push(i);
                    
                    if (currentPage < totalPages - 2) pages.push("...");
                    
                    pages.push(totalPages);
                  }
                  
                  return pages.map((page, idx) => (
                    typeof page === "number" ? (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-7 h-7 p-0 text-xs",
                          currentPage === page
                            ? "bg-indigo-500/30 text-indigo-400 border border-indigo-500/50"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={idx} className="px-1 text-slate-500 text-xs">...</span>
                    )
                  ));
                })()}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-2 h-7 text-xs text-slate-400 hover:text-white disabled:opacity-30"
                >
                  ›
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-2 h-7 text-xs text-slate-400 hover:text-white disabled:opacity-30"
                >
                  »
                </Button>
              </div>
              
              {/* Max activities storage selector */}
              <Select value={String(maxActivities)} onValueChange={(v) => setMaxActivities(Number(v))}>
                <SelectTrigger className="w-24 h-7 bg-slate-900/60 !text-white text-xs" style={{ borderColor: 'transparent' }}>
                  <SelectValue className="!text-white" />
                </SelectTrigger>
                <SelectContent className="glass-dropdown text-white">
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex-1 h-[500px] space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {Object.keys(groupedActivities).length === 0 ? (
              <div className="text-center py-12 rounded-2xl glass-theme">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">{language === "ru" ? "Нет записей" : "No entries found"}</p>
              </div>
            ) : (
              Object.entries(groupedActivities).map(([date, items]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-400">{date}</span>
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-xs text-slate-500">{items.length}</span>
                  </div>
                  <div className="rounded-xl glass-theme overflow-hidden">
                    <AnimatePresence>
                      {items.map((activity, index) => {
                        const config = actionConfig[activity.action] || actionConfig.created;
                        const typeConf = typeConfig[activity.type] || typeConfig.task;
                        const Icon = config.icon;
                        // For display - use activity data or fallback
                        const displayUser = activity.userName ? 
                          { name: activity.userName, avatar: activity.userAvatar } :
                          teamMembers.find((m) => m.userId === activity.userId) || 
                          (activity.userId === currentUser.id ? currentUser : null);
                        // For modal - always try to find full TeamMember
                        const fullMember = teamMembers.find((m) => m.userId === activity.userId);
                        return (
                          <motion.div key={activity.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.03 }} className={cn("flex items-center gap-3 p-3", "hover:bg-white/5 transition-all", index !== items.length - 1 && "border-b border-white/5")}>
                            <div className={cn("p-1.5 rounded-lg", config.bgColor)}>
                              <Icon className={cn("w-3.5 h-3.5", config.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded", config.bgColor, config.color)}>
                                  {config.label[language]}
                                </span>
                                {activity.projectId && getProjectName(activity.projectId) && (
                                  <span className="text-[10px] text-slate-500">{getProjectName(activity.projectId)}</span>
                                )}
                              </div>
                              <p className="text-xs text-white mt-0.5 truncate">{activity.subject}</p>
                            </div>
                            {displayUser && (
                              <button 
                                onClick={() => {
                                  if (activity.userId === currentUser.id) return;
                                  // Try to find full member, otherwise create partial object for modal
                                  const memberForModal = fullMember || (displayUser ? {
                                    id: activity.userId,
                                    name: displayUser.name,
                                    avatar: displayUser.avatar || "",
                                    email: "",
                                    role: "",
                                    phone: "",
                                    isOnline: false,
                                    isAdmin: false,
                                    dailyRate: 0,
                                    carBonus: 0,
                                    createdAt: "",
                                  } as typeof teamMembers[0] : null);
                                  if (memberForModal) setSelectedMember(memberForModal);
                                }} 
                                className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1 transition-colors cursor-pointer"
                              >
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={displayUser.avatar} />
                                  <AvatarFallback className="text-[8px] bg-slate-700">{displayUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-[11px] text-slate-300">{displayUser.name.split(" ")[0]}</span>
                              </button>
                            )}
                            <div className="flex items-center gap-1">
                              {canNavigate(activity) && (
                                <Button variant="ghost" size="sm" onClick={() => handleNavigate(activity)} className="p-1 h-auto text-slate-400 hover:text-indigo-400">
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              )}
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">{formatDateTime(activity.timestamp)}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl glass-theme p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {language === "ru" ? "Профиль участника" : "Member Profile"}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-white p-1 h-auto">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="w-20 h-20 mb-4">
                  <AvatarImage src={selectedMember.avatar} />
                  <AvatarFallback className="text-2xl bg-slate-700">{selectedMember.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h4 className="text-xl font-semibold text-white">{selectedMember.name}</h4>
                <p className="text-sm text-slate-400">{selectedMember.role}</p>
                {selectedMember.email && (
                  <p className="text-xs text-slate-500 mt-1">{selectedMember.email}</p>
                )}
              </div>

              {/* Activity Stats */}
              {(() => {
                const memberStats = userStats.find(s => s.userId === selectedMember.id);
                if (!memberStats) return null;
                const percent = totalActivities > 0 ? ((memberStats.total / totalActivities) * 100).toFixed(1) : 0;
                return (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-slate-400">
                      {language === "ru" ? "Статистика активности" : "Activity Stats"}
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-2xl font-bold text-white">{memberStats.total}</p>
                        <p className="text-xs text-slate-400">{language === "ru" ? "Всего действий" : "Total actions"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <p className="text-2xl font-bold text-indigo-400">{percent}%</p>
                        <p className="text-xs text-slate-400">{language === "ru" ? "От общего" : "Of total"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10">
                        <p className="text-lg font-bold text-emerald-400">{memberStats.created}</p>
                        <p className="text-xs text-slate-400">{language === "ru" ? "Создано" : "Created"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/10">
                        <p className="text-lg font-bold text-blue-400">{memberStats.moved}</p>
                        <p className="text-xs text-slate-400">{language === "ru" ? "Перемещено" : "Moved"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-500/10">
                        <p className="text-lg font-bold text-indigo-400">{memberStats.commented}</p>
                        <p className="text-xs text-slate-400">{language === "ru" ? "Комментарии" : "Comments"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10">
                        <p className="text-lg font-bold text-amber-400">{memberStats.updated}</p>
                        <p className="text-xs text-slate-400">{language === "ru" ? "Обновлено" : "Updated"}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl glass-theme p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-500/20">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {language === "ru" ? "Очистить логи?" : "Clear logs?"}
                </h3>
              </div>
              
              <p className="text-sm text-slate-400 mb-6">
                {language === "ru" 
                  ? `Вы уверены, что хотите удалить все ${activities.length} записей? Это действие нельзя отменить.`
                  : `Are you sure you want to delete all ${activities.length} entries? This action cannot be undone.`
                }
              </p>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 text-slate-400 hover:text-white"
                  onClick={() => setShowClearConfirm(false)}
                >
                  {language === "ru" ? "Отмена" : "Cancel"}
                </Button>
                <Button
                  className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                  onClick={() => {
                    clearActivities();
                    setShowClearConfirm(false);
                  }}
                >
                  {language === "ru" ? "Удалить" : "Delete"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

