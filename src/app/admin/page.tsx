"use client";

import { useState, useEffect, useRef } from "react";
import { useStore, ArchiveFolder, Task, TeamMember, WorkDay } from "@/store";
import { useApiActions } from "@/hooks/use-api-actions";
import { t } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Archive,
  Download,
  Trash2,
  FolderArchive,
  Calendar,
  Settings2,
  XCircle,
  FileArchive,
  Eye,
  Upload,
  FileText,
  FileJson,
  MapPin,
  Phone,
  User,
  MessageSquare,
  Clock,
  Tag,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  X,
  StickyNote,
  Users,
  Shield,
  ShieldOff,
  UserPlus,
  Activity,
  Mail,
  Car,
  Wallet,
  Check,
  Plus,
  Lock,
  Unlock,
  Key,
  Copy,
  RefreshCw,
  Globe,
  Server,
} from "lucide-react";

export default function AdminPage() {
  const {
    language,
    projects,
    currentProjectId,
    isAdmin,
    getArchiveFolders,
    getArchivedTasksByFolder,
    archiveTasksByPeriod,
    deleteArchiveFolder,
    importArchive,
    updateArchiveSettings,
    tasks,
    teamMembers,
    calendarNotes,
    getCalendarNote,
    activities,
    workDays,
    getMemberSalary,
    systemSettings,
  } = useStore();

  // API actions for database operations
  const api = useApiActions();

  const [mounted, setMounted] = useState(false);
  const [showCreateArchive, setShowCreateArchive] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState<string>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [viewFolder, setViewFolder] = useState<ArchiveFolder | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState<ArchiveFolder | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteFileInputRef = useRef<HTMLInputElement>(null);
  
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterProjectId, setFilterProjectId] = useState<string>("all");
  
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  
  const [viewMember, setViewMember] = useState<TeamMember | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [confirmDeleteMember, setConfirmDeleteMember] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [newMemberDailyRate, setNewMemberDailyRate] = useState("1000");
  
  // Editing rates for salary tracking
  const [editingRates, setEditingRates] = useState({ dailyRate: "1000", carBonus: "500", payday: "1" });
  const [newMemberCarBonus, setNewMemberCarBonus] = useState("500");
  
  // Load payday from system settings
  useEffect(() => {
    if (systemSettings.salaryPayday) {
      setEditingRates(prev => ({ ...prev, payday: String(systemSettings.salaryPayday) }));
    }
  }, [systemSettings.salaryPayday]);
  
  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth());
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());

  const archiveProjectId = selectedProjectId || currentProjectId;
  const archiveProject = projects.find((p) => p.id === archiveProjectId) || projects[0];
  const columns = archiveProject?.columns || [];
  
  const { archiveFolders: allArchiveFolders } = useStore();
  
  const filteredArchiveFolders = allArchiveFolders.filter((folder) => {
    if (filterProjectId !== "all" && folder.projectId !== filterProjectId) return false;
    if (filterYear !== "all") {
      const folderYear = new Date(folder.createdAt).getFullYear().toString();
      if (folderYear !== filterYear) return false;
    }
    if (filterMonth !== "all") {
      const folderMonth = (new Date(folder.createdAt).getMonth() + 1).toString();
      if (folderMonth !== filterMonth) return false;
    }
    return true;
  });
  
  const availableYears = [...new Set(allArchiveFolders.map(f => new Date(f.createdAt).getFullYear()))].sort((a, b) => b - a);
  
  const months = language === "ru" 
    ? ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setSelectedColumnId("all"); }, [archiveProjectId]);

  if (!mounted) {
    return <div className="p-6 lg:p-8"><div className="text-slate-400">{language === "ru" ? "Загрузка..." : "Loading..."}</div></div>;
  }

  if (!isAdmin()) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <XCircle className="w-16 h-16 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{language === "ru" ? "Доступ запрещён" : "Access Denied"}</h1>
          <p className="text-slate-400">{language === "ru" ? "Эта страница доступна только администраторам" : "This page is only available to administrators"}</p>
        </div>
      </div>
    );
  }

  const getTasksToArchive = () => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return tasks.filter((t) => {
      if (t.projectId !== archiveProjectId) return false;
      if (selectedColumnId !== "all" && t.status !== selectedColumnId) return false;
      const taskDate = new Date(t.createdAt);
      return taskDate >= start && taskDate <= end;
    });
  };

  const previewTasks = getTasksToArchive();

  const handleCreateArchive = () => {
    if (!startDate || !endDate || previewTasks.length === 0) return;
    archiveTasksByPeriod(startDate, endDate, selectedColumnId === "all" ? undefined : selectedColumnId, archiveProjectId);
    setShowCreateArchive(false);
    setStartDate("");
    setEndDate("");
    setSelectedColumnId("all");
  };

  const handleDownloadArchive = (folder: ArchiveFolder, format: "json" | "txt" | "pdf") => {
    const archivedTasks = getArchivedTasksByFolder(folder.id);
    const project = projects.find(p => p.id === folder.projectId);
    
    if (format === "json") {
      const archiveData = {
        version: "1.0", exportedAt: new Date().toISOString(),
        folder: { id: folder.id, name: folder.name, projectId: folder.projectId, projectName: project?.name || "Unknown", startDate: folder.startDate, endDate: folder.endDate, createdAt: folder.createdAt },
        tasks: archivedTasks.map((task) => {
          const assignee = teamMembers.find(m => m.id === task.assigneeId);
          return { id: task.id, title: task.title, description: task.description, address: task.address, phone: task.phone, status: task.status, priority: task.priority, deadline: task.deadline, tags: task.tags, assigneeId: task.assigneeId, assigneeName: assignee?.name, comments: task.comments, attachments: task.attachments, createdAt: task.createdAt, archivedAt: task.archivedAt };
        }),
      };
      const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `archive-${folder.name.replace(/\s+/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === "txt") {
      let text = `АРХИВ ЗАДАЧ\nПроект: ${project?.name}\nПериод: ${folder.name}\nВсего задач: ${archivedTasks.length}\n\n`;
      archivedTasks.forEach((task, i) => {
        const assignee = teamMembers.find(m => m.id === task.assigneeId);
        text += `#${i + 1} ${task.title}\n`;
        if (task.address) text += `Адрес: ${task.address}\n`;
        if (assignee) text += `Исполнитель: ${assignee.name}\n`;
        text += `\n`;
      });
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `archive-${folder.name.replace(/\s+/g, "-")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Архив: ${folder.name}</title><style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#4f46e5}.task{border:1px solid #e5e7eb;padding:15px;margin:10px 0;border-radius:8px}</style></head><body><h1>Архив: ${folder.name}</h1><p>Проект: ${project?.name} | Задач: ${archivedTasks.length}</p>`;
      archivedTasks.forEach((task, i) => {
        html += `<div class="task"><strong>#${i + 1} ${task.title}</strong>${task.address ? `<br>Адрес: ${task.address}` : ""}</div>`;
      });
      html += `</body></html>`;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    }
    setShowExportOptions(null);
  };

  const handleImportArchive = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.version && data.folder && data.tasks) {
          importArchive(data, archiveProjectId);
          alert(language === "ru" ? `Архив "${data.folder.name}" импортирован` : `Archive "${data.folder.name}" imported`);
        }
      } catch { alert(language === "ru" ? "Ошибка чтения файла" : "Error reading file"); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteFolder = (folderId: string) => { deleteArchiveFolder(folderId); setConfirmDelete(null); };
  const getColumnName = (columnId: string) => columns.find(c => c.id === columnId)?.name[language] || columnId;

  // Get salary period dates based on payday
  const payday = parseInt(editingRates.payday) || 1;
  const getSalaryPeriod = () => {
    // Period: from payday of previous month to payday-1 of current month
    // e.g., payday=20, selected month=Jan 2026: Dec 20, 2025 - Jan 19, 2026
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
  
  const getSalaryPeriodDays = () => {
    const { startDate, endDate } = getSalaryPeriod();
    // Use local date format to avoid timezone issues
    const formatLocalDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const startStr = formatLocalDate(startDate);
    const endStr = formatLocalDate(endDate);
    return workDays.filter(wd => {
      return wd.date >= startStr && wd.date <= endStr;
    });
  };
  
  const getMemberWorkDays = (memberId: string) => getSalaryPeriodDays().filter(wd => wd.memberId === memberId);
  const calculateMemberSalary = (member: TeamMember) => {
    const days = getMemberWorkDays(member.id);
    const doubleDays = days.filter(d => d.isDouble).length;
    // Двойные дни считаются как 2 дня
    const effectiveDays = days.length + doubleDays;
    const baseSalary = effectiveDays * (member.dailyRate || 0);
    const carBonus = days.filter(d => d.withCar).length * (member.carBonus || 0);
    return { days: days.length, carDays: days.filter(d => d.withCar).length, doubleDays, total: baseSalary + carBonus };
  };
  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

  return (
    <div className="p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-1">{t("admin.title", language)}</h1>
        <p className="text-slate-400 text-sm">{language === "ru" ? "Архивация задач проектов" : "Project tasks archiving"}</p>
      </motion.div>

      {/* Row 1: Create Archive | Calendar | Archive Folders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Create Archive */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl glass-theme p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-indigo-500/20"><Archive className="w-5 h-5 text-indigo-400" /></div>
            <h2 className="text-lg font-semibold text-white">{language === "ru" ? "Создать архив" : "Create Archive"}</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">{language === "ru" ? "Проект" : "Project"}</Label>
                <Select value={archiveProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    {projects.map((proj) => (<SelectItem key={proj.id} value={proj.id} className="text-white hover:bg-white/10">{proj.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">{language === "ru" ? "Колонка" : "Column"}</Label>
                <Select value={selectedColumnId} onValueChange={setSelectedColumnId}>
                  <SelectTrigger className="bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="all" className="text-white hover:bg-white/10">{language === "ru" ? "Все" : "All"}</SelectItem>
                    {columns.map((col) => (<SelectItem key={col.id} value={col.id} className="text-white hover:bg-white/10">{col.name[language]} {col.isArchiveColumn && "📦"}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">{language === "ru" ? "С даты" : "From"}</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }} />
              </div>
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">{language === "ru" ? "По дату" : "To"}</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }} />
              </div>
            </div>
            {startDate && endDate && (
              <div className={cn("p-3 rounded-lg border", previewTasks.length > 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-700/30 border-white/5")}>
                <p className={cn("text-sm font-medium", previewTasks.length > 0 ? "text-emerald-400" : "text-slate-400")}>
                  {language === "ru" ? "Найдено задач:" : "Tasks found:"} <span className="text-lg">{previewTasks.length}</span>
                </p>
              </div>
            )}
            <Button onClick={handleCreateArchive} disabled={!startDate || !endDate || previewTasks.length === 0} className="w-full btn-theme-gradient disabled:opacity-50">
              <Archive className="w-4 h-4 mr-2" />{language === "ru" ? "Архивировать" : "Archive"} {previewTasks.length > 0 && `(${previewTasks.length})`}
            </Button>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/20"><Settings2 className="w-4 h-4 text-amber-400" /></div>
              <h3 className="text-sm font-semibold text-white">{language === "ru" ? "Автоархивация" : "Auto Archive"}</h3>
              <button onClick={() => updateArchiveSettings(archiveProjectId, { enabled: !archiveProject?.archiveSettings?.enabled })} className={cn("ml-auto px-3 py-1 rounded-lg text-xs font-medium transition-colors", archiveProject?.archiveSettings?.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700/50 text-slate-400")}>
                {archiveProject?.archiveSettings?.enabled ? (language === "ru" ? "Вкл" : "On") : (language === "ru" ? "Выкл" : "Off")}
              </button>
            </div>
            {(() => {
              const archiveCol = columns.find(c => c.isArchiveColumn);
              return archiveCol ? (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3">
                  <div className="flex items-center gap-2"><Archive className="w-4 h-4 text-amber-400" /><span className="text-sm text-amber-300">{archiveCol.name[language]}</span></div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-700/30 border border-white/5 mb-3">
                  <p className="text-xs text-slate-500">{language === "ru" ? "Пометьте колонку 📦 в режиме редактирования проекта" : "Mark a column with 📦 in project edit mode"}</p>
                </div>
              );
            })()}
            <div>
              <Label className="text-slate-400 text-sm mb-2 block">{language === "ru" ? "День архивации:" : "Archive day:"}</Label>
              <div className="grid grid-cols-7 gap-1 p-2 rounded-lg bg-slate-900/50 border border-white/5">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <button key={day} onClick={() => updateArchiveSettings(archiveProjectId, { archiveDay: day })} className={cn("w-8 h-8 rounded-lg text-xs font-medium transition-all", archiveProject?.archiveSettings?.archiveDay === day ? "bg-indigo-500 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white")}>{day}</button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl glass-theme p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-cyan-500/20"><Calendar className="w-5 h-5 text-cyan-400" /></div>
            <h2 className="text-lg font-semibold text-white">{language === "ru" ? "Календарь" : "Calendar"}</h2>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium capitalize">{calendarDate.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { month: "long" })}</span>
              <select value={calendarDate.getFullYear()} onChange={(e) => setCalendarDate(new Date(parseInt(e.target.value), calendarDate.getMonth(), 1))} className="bg-slate-800/50 rounded-lg px-2 py-1 text-sm text-white" style={{ borderColor: 'transparent' }}>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (<option key={year} value={year}>{year}</option>))}
              </select>
            </div>
            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {(language === "ru" ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]).map((day) => (
              <div key={day} className="text-center text-xs text-slate-500 font-medium py-1">{day}</div>
            ))}
          </div>
          {(() => {
            const today = new Date();
            const year = calendarDate.getFullYear();
            const month = calendarDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            let startDay = firstDay.getDay() - 1;
            if (startDay < 0) startDay = 6;
            const days = [];
            for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
            for (let d = 1; d <= lastDay.getDate(); d++) {
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isArchiveDay = d === archiveProject?.archiveSettings?.archiveDay;
              const isSelected = selectedDay === dateStr;
              const hasNote = calendarNotes.some(n => n.date === dateStr);
              days.push(
                <button key={d} onClick={() => { setSelectedDay(dateStr); setNoteText(getCalendarNote(dateStr)?.text || ""); }}
                  className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all relative",
                    isSelected && "bg-indigo-500 text-white",
                    isToday && !isSelected && "bg-cyan-500/30 text-cyan-300",
                    isArchiveDay && !isToday && !isSelected && "ring-2 ring-amber-400 text-amber-400",
                    !isToday && !isArchiveDay && !isSelected && "text-slate-400 hover:bg-white/10 hover:text-white"
                  )}>
                  {d}{hasNote && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />}
                </button>
              );
            }
            return <div className="grid grid-cols-7 gap-1">{days}</div>;
          })()}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-cyan-500/30" /><span className="text-xs text-slate-500">{language === "ru" ? "Сегодня" : "Today"}</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-emerald-400" /><span className="text-xs text-slate-500">{language === "ru" ? "Заметка" : "Note"}</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded ring-2 ring-amber-400" /><span className="text-xs text-slate-500">{language === "ru" ? "День архивации" : "Archive day"}</span></div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white">{selectedDay ? `${language === "ru" ? "Заметки на" : "Notes for"} ${new Date(selectedDay).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "short" })}` : (language === "ru" ? "Выберите день" : "Select a day")}</span>
            </div>
            {selectedDay ? (
              <div className="space-y-2">
                {(() => {
                  const notes = calendarNotes.filter(n => n.date === selectedDay);
                  return notes.length > 0 ? (
                    <div className="space-y-2 max-h-[120px] overflow-y-auto">
                      {notes.map((note) => (
                        <div key={note.id} className="p-2 rounded-lg bg-slate-900/70 border border-white/5 group flex justify-between">
                          <div className="flex-1 min-w-0">
                            {note.text && <p className="text-xs text-slate-300">{note.text}</p>}
                            {note.attachments.length > 0 && <div className="flex gap-1 mt-1">{note.attachments.map((att, idx) => <img key={idx} src={att} alt="" className="w-8 h-8 rounded object-cover" />)}</div>}
                          </div>
                          <button onClick={() => api.deleteCalendarNote(note.id)} className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-xs text-slate-500 text-center py-2">{language === "ru" ? "Нет заметок" : "No notes"}</div>;
                })()}
                <div className="pt-2 border-t border-white/5">
                  <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder={language === "ru" ? "Новая заметка..." : "New note..."} className="w-full h-10 bg-slate-900/50 rounded-lg p-2 text-xs text-white placeholder-slate-500 resize-none" style={{ borderColor: 'transparent' }} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={async () => { if (selectedDay && noteText.trim()) { await api.createCalendarNote(selectedDay, noteText.trim()); setNoteText(""); } }} disabled={!noteText.trim()} className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-medium">{language === "ru" ? "Добавить" : "Add"}</button>
                    <input ref={noteFileInputRef} type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file && selectedDay) { const reader = new FileReader(); reader.onload = async (ev) => { const note = await api.createCalendarNote(selectedDay, "📷", [ev.target?.result as string]); }; reader.readAsDataURL(file); } if (noteFileInputRef.current) noteFileInputRef.current.value = ""; }} className="hidden" />
                    <button onClick={() => noteFileInputRef.current?.click()} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"><ImageIcon className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ) : <div className="text-center text-slate-500 text-xs py-4">{language === "ru" ? "Нажмите на день" : "Click on a day"}</div>}
          </div>
        </motion.div>

        {/* Archive Folders */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl glass-theme p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/20"><FolderArchive className="w-5 h-5 text-amber-400" /></div>
            <h2 className="text-lg font-semibold text-white">{t("admin.archiveFolders", language)}</h2>
            <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-slate-400">{filteredArchiveFolders.length}</span>
            <div className="ml-auto">
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportArchive} className="hidden" />
              <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10">
                <Upload className="w-4 h-4 mr-2" />{language === "ru" ? "Импорт" : "Import"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <select value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)} className="bg-slate-900/50 rounded-lg px-2 py-1.5 text-xs text-white" style={{ borderColor: 'transparent' }}>
              <option value="all">{language === "ru" ? "Все проекты" : "All projects"}</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-slate-900/50 rounded-lg px-2 py-1.5 text-xs text-white" style={{ borderColor: 'transparent' }}>
              <option value="all">{language === "ru" ? "Все годы" : "All years"}</option>
              {availableYears.map(year => <option key={year} value={year.toString()}>{year}</option>)}
            </select>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-slate-900/50 rounded-lg px-2 py-1.5 text-xs text-white" style={{ borderColor: 'transparent' }}>
              <option value="all">{language === "ru" ? "Все месяцы" : "All months"}</option>
              {months.map((m, i) => <option key={i} value={(i + 1).toString()}>{m}</option>)}
            </select>
          </div>
          {filteredArchiveFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileArchive className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-slate-400 text-sm">{t("admin.noArchives", language)}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredArchiveFolders.map((folder) => {
                const project = projects.find(p => p.id === folder.projectId);
                return (
                  <div key={folder.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10">
                    <div className="p-1.5 rounded-lg bg-amber-500/10"><FolderArchive className="w-4 h-4 text-amber-400" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-medium text-white truncate">{folder.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500 truncate">{project?.name}</span>
                        <span className="text-[10px] text-indigo-400">{folder.taskIds.length} {language === "ru" ? "задач" : "tasks"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewFolder(folder)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setShowExportOptions(folder)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"><Download className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setConfirmDelete(folder.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Row 2: Salary Tracking (2 cols) | Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salary Tracking - spans 2 columns */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2 rounded-2xl glass-theme p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20"><Wallet className="w-5 h-5 text-emerald-400" /></div>
              <h2 className="text-lg font-semibold text-white">{language === "ru" ? "Учёт зарплаты" : "Salary Tracking"}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (salaryMonth === 0) { setSalaryMonth(11); setSalaryYear(salaryYear - 1); } else { setSalaryMonth(salaryMonth - 1); } }} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-medium text-white capitalize min-w-[120px] text-center">{months[salaryMonth]} {salaryYear}</span>
              <button onClick={() => { if (salaryMonth === 11) { setSalaryMonth(0); setSalaryYear(salaryYear + 1); } else { setSalaryMonth(salaryMonth + 1); } }} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Left: Workers with calendar grid */}
            <div className="flex-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {teamMembers.map((member) => {
                const salary = calculateMemberSalary(member);
                const { startDate, endDate, periodDays } = getSalaryPeriod();
                
                return (
                  <div key={member.id} className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                    {/* Member header */}
                    <div className="flex items-center gap-3 mb-2">
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-8 h-8 rounded-full border border-white/10 cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all" 
                        onClick={() => setViewMember(member)}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{member.name}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-400">{salary.total.toLocaleString()}₽</p>
                        <p className="text-[10px] text-slate-500">{salary.days} {language === "ru" ? "дн" : "d"} / {salary.carDays}🚗 / {salary.doubleDays}x2</p>
                      </div>
                    </div>
                    
                    {/* Days grid - shows period days in order */}
                    <div className="flex flex-wrap gap-1">
                      {periodDays.map((dayInfo, idx) => {
                        const { date, day, isNewMonth } = dayInfo;
                        // Use local date format to avoid timezone issues
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const workDay = workDays.find(wd => wd.memberId === member.id && wd.date === dateStr);
                        const isWorked = !!workDay;
                        const hasCar = workDay?.withCar || false;
                        const isDouble = workDay?.isDouble || false;
                        const isToday = dateStr === todayStr;
                        
                        return (
                          <div key={idx} className="relative group flex items-center">
                            {/* Month separator */}
                            {isNewMonth && idx > 0 && (
                              <div className="w-px h-7 bg-indigo-500/50 mx-1" />
                            )}
                            <button
                              onClick={() => {
                                if (isWorked) {
                                  api.removeWorkDay(member.id, dateStr);
                                } else {
                                  api.addWorkDay(member.id, dateStr, false);
                                }
                              }}
                              className={cn(
                                "w-7 h-7 rounded text-xs font-medium flex items-center justify-center transition-all",
                                isWorked && isDouble && "bg-violet-500/50 text-violet-200 ring-1 ring-violet-400/50",
                                isWorked && hasCar && !isDouble && "bg-amber-500/40 text-amber-200",
                                isWorked && !hasCar && !isDouble && "bg-emerald-500/40 text-emerald-200",
                                !isWorked && isToday && "bg-cyan-500/30 text-cyan-300 ring-1 ring-cyan-500/50",
                                !isWorked && !isToday && "bg-slate-700/60 text-slate-400 hover:bg-slate-600/60 hover:text-slate-200"
                              )}
                            >
                              {day}
                            </button>
                            {isWorked && (
                              <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                  onClick={(e) => { e.stopPropagation(); api.toggleWorkDayCar(member.id, dateStr); }}
                                  className={cn(
                                    "w-5 h-5 rounded text-[9px] flex items-center justify-center",
                                    hasCar ? "bg-amber-500 text-white" : "bg-slate-600 text-slate-300 hover:bg-amber-500"
                                  )}
                                >
                                  {hasCar ? "🚗" : "+"}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); api.toggleWorkDayDouble(member.id, dateStr); }}
                                  className={cn(
                                    "w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center",
                                    isDouble ? "bg-violet-500 text-white" : "bg-slate-600 text-slate-300 hover:bg-violet-500"
                                  )}
                                >
                                  x2
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Send report button */}
                      <button
                        onClick={() => {
                          const days = getMemberWorkDays(member.id);
                          if (days.length === 0) return;
                          
                          const { startDate, endDate } = getSalaryPeriod();
                          const formatDate = (d: Date) => `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
                          const periodStr = `${formatDate(startDate)} — ${formatDate(endDate)}`;
                          
                          const workedDates = days.map(d => {
                            const date = new Date(d.date);
                            let dayStr = `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
                            if (d.withCar) dayStr += " (+доп)";
                            if (d.isDouble) dayStr += " (x2)";
                            return dayStr;
                          }).join(", ");
                          
                          const subject = encodeURIComponent(language === "ru" 
                            ? `Отчёт по зарплате за ${periodStr}` 
                            : `Salary report for ${periodStr}`);
                          
                          const body = encodeURIComponent(
                            (language === "ru" 
                              ? `Здравствуйте, ${member.name}!\n\nВаш отчёт по зарплате за период ${periodStr}:\n\n` 
                              : `Hello, ${member.name}!\n\nYour salary report for ${periodStr}:\n\n`) +
                            (language === "ru" ? `Ставка за день: ${member.dailyRate}₽\n` : `Daily rate: ${member.dailyRate}₽\n`) +
                            (language === "ru" ? `Доп. ставка: ${member.carBonus}₽\n\n` : `Bonus rate: ${member.carBonus}₽\n\n`) +
                            (language === "ru" ? `Рабочие дни (${salary.days}): ${workedDates}\n` : `Work days (${salary.days}): ${workedDates}\n`) +
                            (language === "ru" ? `Дней с доп. ставкой: ${salary.carDays}\n` : `Days with bonus: ${salary.carDays}\n`) +
                            (language === "ru" ? `Двойных дней: ${salary.doubleDays}\n\n` : `Double days: ${salary.doubleDays}\n\n`) +
                            (language === "ru" ? `ИТОГО: ${salary.total.toLocaleString()}₽` : `TOTAL: ${salary.total.toLocaleString()}₽`)
                          );
                          
                          window.open(`mailto:${member.email}?subject=${subject}&body=${body}`, '_blank');
                        }}
                        className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition-colors"
                        title={member.email}
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      
                      {/* Individual rates */}
                      <div className="flex items-center gap-1 ml-2">
                        <input
                          type="number"
                          value={member.dailyRate}
                          onChange={(e) => api.updateTeamMember(member.id, { dailyRate: parseInt(e.target.value) || 0 })}
                          className="w-14 h-6 px-1 text-[10px] text-white bg-slate-800/50 rounded border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          title={language === "ru" ? "Ставка/день" : "Daily rate"}
                        />
                        <span className="text-[10px] text-slate-500">+</span>
                        <input
                          type="number"
                          value={member.carBonus}
                          onChange={(e) => api.updateTeamMember(member.id, { carBonus: parseInt(e.target.value) || 0 })}
                          className="w-12 h-6 px-1 text-[10px] text-white bg-slate-800/50 rounded border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          title={language === "ru" ? "Доп. ставка" : "Bonus"}
                        />
                        <span className="text-[10px] text-slate-500">₽</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Rate settings */}
            <div className="w-52 space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                <h3 className="text-sm font-medium text-white mb-3">{language === "ru" ? "Ставки" : "Rates"}</h3>
                
                <div className="space-y-2">
                  <div>
                    <Label className="text-slate-400 text-xs mb-1 block">{language === "ru" ? "За день (₽)" : "Per day (₽)"}</Label>
                    <Input
                      type="number"
                      value={editingRates.dailyRate}
                      onChange={(e) => setEditingRates(prev => ({ ...prev, dailyRate: e.target.value }))}
                      className="bg-slate-800/50 text-white h-7 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ borderColor: 'transparent' }}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1 block">{language === "ru" ? "Доп. ставка (₽)" : "Bonus (₽)"}</Label>
                    <Input
                      type="number"
                      value={editingRates.carBonus}
                      onChange={(e) => setEditingRates(prev => ({ ...prev, carBonus: e.target.value }))}
                      className="bg-slate-800/50 text-white h-7 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ borderColor: 'transparent' }}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs mb-1 block">{language === "ru" ? "День зарплаты" : "Payday"}</Label>
                    <select
                      value={editingRates.payday}
                      onChange={(e) => {
                        const newPayday = parseInt(e.target.value);
                        setEditingRates(prev => ({ ...prev, payday: e.target.value }));
                        api.updateSettings({ salaryPayday: newPayday });
                      }}
                      className="w-full bg-slate-800/50 text-white h-7 text-sm rounded-md px-2"
                      style={{ borderColor: 'transparent' }}
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d} {language === "ru" ? "числа" : ""}</option>
                      ))}
                    </select>
                    {(() => {
                      const { startDate, endDate } = getSalaryPeriod();
                      const formatDate = (d: Date) => `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
                      return (
                        <p className="text-[9px] text-slate-500 mt-1">
                          {formatDate(startDate)} — {formatDate(endDate)}
                        </p>
                      );
                    })()}
                  </div>
                  <Button
                    onClick={() => {
                      teamMembers.forEach(m => {
                        api.updateTeamMember(m.id, {
                          dailyRate: parseInt(editingRates.dailyRate) || 1000,
                          carBonus: parseInt(editingRates.carBonus) || 500
                        });
                      });
                    }}
                    size="sm"
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-xs"
                  >
                    {language === "ru" ? "Применить ко всем" : "Apply to all"}
                  </Button>
                  <Button
                    onClick={() => {
                      const { startDate, endDate } = getSalaryPeriod();
                      teamMembers.forEach(m => {
                        const memberWorkDays = workDays.filter(wd => {
                          const d = new Date(wd.date);
                          return wd.memberId === m.id && d >= startDate && d <= endDate;
                        });
                        memberWorkDays.forEach(wd => api.removeWorkDay(m.id, wd.date));
                      });
                    }}
                    size="sm"
                    variant="ghost"
                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1.5" />
                    {language === "ru" ? "Сбросить период" : "Reset period"}
                  </Button>
                </div>
              </div>

              {/* Legend */}
              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                <h4 className="text-xs font-medium text-slate-400 mb-2">{language === "ru" ? "Легенда" : "Legend"}</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-500/40" />
                    <span className="text-[10px] text-slate-400">{language === "ru" ? "Рабочий день" : "Work day"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500/40" />
                    <span className="text-[10px] text-slate-400">{language === "ru" ? "С доп. ставкой" : "With bonus"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-violet-500/50 ring-1 ring-violet-400/50" />
                    <span className="text-[10px] text-slate-400">{language === "ru" ? "Двойной день" : "Double day"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-cyan-500/30 ring-1 ring-cyan-500/50" />
                    <span className="text-[10px] text-slate-400">{language === "ru" ? "Сегодня" : "Today"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-px h-4 bg-indigo-500/50" />
                    <span className="text-[10px] text-slate-400">{language === "ru" ? "Новый месяц" : "New month"}</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-slate-400 mb-1">{language === "ru" ? "Итого за период" : "Period total"}</p>
                <p className="text-2xl font-bold text-emerald-400">{teamMembers.reduce((sum, m) => sum + calculateMemberSalary(m).total, 0).toLocaleString()}₽</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Management */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-2xl glass-theme p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/20"><Users className="w-5 h-5 text-violet-400" /></div>
              <h2 className="text-lg font-semibold text-white">{language === "ru" ? "Команда" : "Team"}</h2>
              <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-slate-400">{teamMembers.length}</span>
            </div>
            <button onClick={() => setShowAddMember(true)} className="p-1.5 rounded-lg bg-violet-500 hover:bg-violet-600 text-white"><UserPlus className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 group">
                <div className="relative">
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="w-9 h-9 rounded-full border border-white/10 cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all" 
                    onClick={() => setViewMember(member)}
                  />
                  <div className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900", member.isOnline ? "bg-emerald-500" : "bg-slate-500")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-medium text-white truncate">{member.name}</h3>
                    {member.isAdmin && <Shield className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">{member.role}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => setViewMember(member)} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"><Eye className="w-3 h-3" /></button>
                  <button onClick={() => api.updateTeamMember(member.id, { isAdmin: !member.isAdmin })} className={cn("p-1 rounded", member.isAdmin ? "text-amber-400 hover:bg-amber-500/10" : "text-slate-400 hover:text-amber-400 hover:bg-amber-500/10")}>
                    {member.isAdmin ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  </button>
                  <button onClick={() => setConfirmDeleteMember(member.id)} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 3: System Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-6 rounded-2xl glass-theme p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-slate-500/20"><Server className="w-5 h-5 text-slate-400" /></div>
          <h2 className="text-lg font-semibold text-white">{language === "ru" ? "Настройки системы" : "System Settings"}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Registration Mode */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-medium text-white">{language === "ru" ? "Режим регистрации" : "Registration Mode"}</h3>
            </div>
            <div className="space-y-2">
              {[
                { id: "open", label: language === "ru" ? "Открытая" : "Open", icon: Unlock, color: "emerald" },
                { id: "invite", label: language === "ru" ? "По приглашению" : "Invite Only", icon: Key, color: "amber" },
                { id: "closed", label: language === "ru" ? "Закрытая" : "Closed", icon: Lock, color: "red" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => api.updateSettings({ registrationMode: mode.id as any })}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-all",
                    systemSettings.registrationMode === mode.id
                      ? `bg-${mode.color}-500/20 text-${mode.color}-400 border border-${mode.color}-500/30`
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-transparent"
                  )}
                  style={systemSettings.registrationMode === mode.id ? {
                    backgroundColor: mode.color === "emerald" ? "rgba(16, 185, 129, 0.2)" : mode.color === "amber" ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    color: mode.color === "emerald" ? "#34d399" : mode.color === "amber" ? "#fbbf24" : "#f87171",
                    borderColor: mode.color === "emerald" ? "rgba(16, 185, 129, 0.3)" : mode.color === "amber" ? "rgba(245, 158, 11, 0.3)" : "rgba(239, 68, 68, 0.3)"
                  } : {}}
                >
                  <mode.icon className="w-4 h-4" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Invite Codes */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-medium text-white">{language === "ru" ? "Инвайт-коды" : "Invite Codes"}</h3>
              </div>
              <button
                onClick={() => api.generateInviteCode()}
                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
                title={language === "ru" ? "Создать код" : "Generate code"}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
              {systemSettings.inviteCodes.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">{language === "ru" ? "Нет активных кодов" : "No active codes"}</p>
              ) : (
                systemSettings.inviteCodes.map((code) => (
                  <div key={code} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 group">
                    <code className="text-xs font-mono text-amber-400">{code}</code>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => navigator.clipboard.writeText(code)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title={language === "ru" ? "Копировать" : "Copy"}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => api.deleteInviteCode(code)}
                        className="p-1 rounded text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Security Settings */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-medium text-white">{language === "ru" ? "Безопасность" : "Security"}</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-slate-400">{language === "ru" ? "Сброс пароля" : "Password Reset"}</span>
                <button
                  onClick={() => api.updateSettings({ allowPasswordReset: !systemSettings.allowPasswordReset })}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    systemSettings.allowPasswordReset ? "bg-emerald-500" : "bg-slate-600"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                    systemSettings.allowPasswordReset ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </button>
              </label>
              <div>
                <label className="text-xs text-slate-400 block mb-1">{language === "ru" ? "Макс. попыток входа" : "Max login attempts"}</label>
                <select
                  value={systemSettings.maxLoginAttempts}
                  onChange={(e) => api.updateSettings({ maxLoginAttempts: parseInt(e.target.value) })}
                  className="w-full bg-slate-800/50 text-white text-xs h-7 rounded-md px-2"
                  style={{ borderColor: 'transparent' }}
                >
                  {[3, 5, 10, 0].map(n => (
                    <option key={n} value={n}>{n === 0 ? (language === "ru" ? "Без лимита" : "No limit") : n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">{language === "ru" ? "Таймаут сессии (мин)" : "Session timeout (min)"}</label>
                <select
                  value={systemSettings.sessionTimeout}
                  onChange={(e) => api.updateSettings({ sessionTimeout: parseInt(e.target.value) })}
                  className="w-full bg-slate-800/50 text-white text-xs h-7 rounded-md px-2"
                  style={{ borderColor: 'transparent' }}
                >
                  {[0, 15, 30, 60, 120, 480].map(n => (
                    <option key={n} value={n}>{n === 0 ? (language === "ru" ? "Без лимита" : "No limit") : `${n} ${language === "ru" ? "мин" : "min"}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-medium text-white">{language === "ru" ? "Обслуживание" : "Maintenance"}</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs text-slate-300 block">{language === "ru" ? "Режим обслуживания" : "Maintenance Mode"}</span>
                  <span className="text-[10px] text-slate-500">{language === "ru" ? "Только админы могут войти" : "Only admins can login"}</span>
                </div>
                <button
                  onClick={() => api.updateSettings({ maintenanceMode: !systemSettings.maintenanceMode })}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    systemSettings.maintenanceMode ? "bg-red-500" : "bg-slate-600"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                    systemSettings.maintenanceMode ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </button>
              </label>
              
              {systemSettings.maintenanceMode && (
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-[10px] text-red-400">{language === "ru" ? "⚠️ Система в режиме обслуживания" : "⚠️ System is in maintenance mode"}</p>
                </div>
              )}

              <div className="pt-2 border-t border-white/5">
                <p className="text-[10px] text-slate-500 mb-2">{language === "ru" ? "Статистика" : "Statistics"}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-slate-800/50 text-center">
                    <p className="text-lg font-bold text-white">{teamMembers.length}</p>
                    <p className="text-[9px] text-slate-500">{language === "ru" ? "Пользователей" : "Users"}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/50 text-center">
                    <p className="text-lg font-bold text-white">{tasks.length}</p>
                    <p className="text-[9px] text-slate-500">{language === "ru" ? "Задач" : "Tasks"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <Modal open={!!viewFolder} onClose={() => { setViewFolder(null); setViewTask(null); }}>
        <ModalHeader onClose={() => { setViewFolder(null); setViewTask(null); }}><ModalTitle>{viewFolder?.name}</ModalTitle></ModalHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {viewFolder && getArchivedTasksByFolder(viewFolder.id).map((task) => {
            const assignee = teamMembers.find(m => m.id === task.assigneeId);
            return (
              <div key={task.id} onClick={() => setViewTask(task)} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 cursor-pointer">
                <h4 className="text-sm font-medium text-orange-400 mb-2">{task.title}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {task.address && <div className="flex items-center gap-1.5 text-slate-400"><MapPin className="w-3 h-3 text-indigo-400" /><span className="truncate">{task.address}</span></div>}
                  {task.phone && <div className="flex items-center gap-1.5 text-slate-400"><Phone className="w-3 h-3 text-emerald-400" /><span>{task.phone}</span></div>}
                  {assignee && <div className="flex items-center gap-1.5 text-slate-400"><User className="w-3 h-3 text-violet-400" /><span>{assignee.name}</span></div>}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal open={!!viewTask} onClose={() => setViewTask(null)}>
        <ModalHeader onClose={() => setViewTask(null)}><ModalTitle>{viewTask?.title}</ModalTitle></ModalHeader>
        {viewTask && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {viewTask.description && <div><Label className="text-slate-500 text-xs">{language === "ru" ? "Описание" : "Description"}</Label><p className="text-sm text-white mt-1">{viewTask.description}</p></div>}
            <div className="grid grid-cols-2 gap-4">
              {viewTask.address && <div><Label className="text-slate-500 text-xs">{language === "ru" ? "Адрес" : "Address"}</Label><p className="text-sm text-white mt-1">{viewTask.address}</p></div>}
              {viewTask.phone && <div><Label className="text-slate-500 text-xs">{language === "ru" ? "Телефон" : "Phone"}</Label><p className="text-sm text-white mt-1">{viewTask.phone}</p></div>}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!showExportOptions} onClose={() => setShowExportOptions(null)}>
        <ModalHeader onClose={() => setShowExportOptions(null)}><ModalTitle>{language === "ru" ? "Экспорт архива" : "Export Archive"}</ModalTitle></ModalHeader>
        <div className="space-y-3">
          <button onClick={() => showExportOptions && handleDownloadArchive(showExportOptions, "json")} className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30">
            <div className="p-2 rounded-lg bg-indigo-500/20"><FileJson className="w-5 h-5 text-indigo-400" /></div>
            <div className="text-left"><h4 className="text-sm font-medium text-white">JSON</h4><p className="text-xs text-slate-500">{language === "ru" ? "Для импорта обратно" : "For re-import"}</p></div>
          </button>
          <button onClick={() => showExportOptions && handleDownloadArchive(showExportOptions, "txt")} className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30">
            <div className="p-2 rounded-lg bg-emerald-500/20"><FileText className="w-5 h-5 text-emerald-400" /></div>
            <div className="text-left"><h4 className="text-sm font-medium text-white">TXT</h4><p className="text-xs text-slate-500">{language === "ru" ? "Текстовый отчёт" : "Text report"}</p></div>
          </button>
          <button onClick={() => showExportOptions && handleDownloadArchive(showExportOptions, "pdf")} className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-amber-500/30">
            <div className="p-2 rounded-lg bg-amber-500/20"><FileArchive className="w-5 h-5 text-amber-400" /></div>
            <div className="text-left"><h4 className="text-sm font-medium text-white">PDF</h4><p className="text-xs text-slate-500">{language === "ru" ? "Для печати" : "For printing"}</p></div>
          </button>
        </div>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <ModalHeader onClose={() => setConfirmDelete(null)}><ModalTitle>{language === "ru" ? "Удалить архив?" : "Delete archive?"}</ModalTitle></ModalHeader>
        <div className="space-y-4">
          <p className="text-slate-400">{language === "ru" ? "Это действие нельзя отменить." : "This action cannot be undone."}</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)} className="flex-1 text-slate-400 hover:text-white hover:bg-white/10">{t("common.cancel", language)}</Button>
            <Button onClick={() => confirmDelete && handleDeleteFolder(confirmDelete)} className="flex-1 bg-red-500 hover:bg-red-600"><Trash2 className="w-4 h-4 mr-2" />{t("common.delete", language)}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewMember} onClose={() => setViewMember(null)}>
        <ModalHeader onClose={() => setViewMember(null)}><ModalTitle>{viewMember?.name}</ModalTitle></ModalHeader>
        {viewMember && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center gap-4">
              <img src={viewMember.avatar} alt={viewMember.name} className="w-16 h-16 rounded-full border-2 border-white/10" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-white">{viewMember.name}</h3>
                  {viewMember.isAdmin && <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">Admin</span>}
                </div>
                <p className="text-sm text-slate-400">{viewMember.role}</p>
                <div className={cn("flex items-center gap-1.5 mt-1 text-xs", viewMember.isOnline ? "text-emerald-400" : "text-slate-500")}>
                  <div className={cn("w-2 h-2 rounded-full", viewMember.isOnline ? "bg-emerald-400" : "bg-slate-500")} />
                  {viewMember.isOnline ? (language === "ru" ? "Онлайн" : "Online") : (language === "ru" ? "Оффлайн" : "Offline")}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-white/5">
                <div className="flex items-center gap-2 text-slate-400 mb-1"><Mail className="w-4 h-4" /><span className="text-xs">Email</span></div>
                <p className="text-sm text-white">{viewMember.email}</p>
              </div>
              {viewMember.phone && (
                <div className="p-3 rounded-lg bg-slate-900/50 border border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 mb-1"><Phone className="w-4 h-4" /><span className="text-xs">{language === "ru" ? "Телефон" : "Phone"}</span></div>
                  <p className="text-sm text-white">{viewMember.phone}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showAddMember} onClose={() => setShowAddMember(false)}>
        <ModalHeader onClose={() => setShowAddMember(false)}><ModalTitle>{language === "ru" ? "Добавить участника" : "Add Team Member"}</ModalTitle></ModalHeader>
        <div className="space-y-4">
          <div><Label className="text-slate-300 text-sm mb-2 block">{language === "ru" ? "Имя" : "Name"}</Label><Input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder={language === "ru" ? "Иван Иванов" : "John Doe"} className="bg-slate-800/50 border-white/10 text-white" /></div>
          <div><Label className="text-slate-300 text-sm mb-2 block">Email</Label><Input type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="email@example.com" className="bg-slate-800/50 border-white/10 text-white" /></div>
          <div><Label className="text-slate-300 text-sm mb-2 block">{language === "ru" ? "Телефон" : "Phone"}</Label><Input value={newMemberPhone} onChange={(e) => setNewMemberPhone(e.target.value)} placeholder="+7 (999) 123-45-67" className="bg-slate-800/50 border-white/10 text-white" /></div>
          <div><Label className="text-slate-300 text-sm mb-2 block">{language === "ru" ? "Должность" : "Role"}</Label><Input value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} placeholder={language === "ru" ? "Разработчик" : "Developer"} className="bg-slate-800/50 border-white/10 text-white" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300 text-sm mb-2 block">{language === "ru" ? "Ставка/день (₽)" : "Daily rate (₽)"}</Label><Input type="number" value={newMemberDailyRate} onChange={(e) => setNewMemberDailyRate(e.target.value)} className="bg-slate-800/50 border-white/10 text-white" /></div>
            <div><Label className="text-slate-300 text-sm mb-2 block">{language === "ru" ? "За машину (₽)" : "Car bonus (₽)"}</Label><Input type="number" value={newMemberCarBonus} onChange={(e) => setNewMemberCarBonus(e.target.value)} className="bg-slate-800/50 border-white/10 text-white" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowAddMember(false)} className="flex-1 text-slate-400 hover:text-white hover:bg-white/10">{t("common.cancel", language)}</Button>
            <Button onClick={() => { if (newMemberName && newMemberEmail) { api.createTeamMember({ name: newMemberName, email: newMemberEmail, phone: newMemberPhone, role: newMemberRole || "Team Member", avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${newMemberName.replace(/\s+/g, "")}`, isOnline: false, isAdmin: false, dailyRate: parseInt(newMemberDailyRate) || 1000, carBonus: parseInt(newMemberCarBonus) || 0 }); setNewMemberName(""); setNewMemberEmail(""); setNewMemberPhone(""); setNewMemberRole(""); setNewMemberDailyRate("1000"); setNewMemberCarBonus("500"); setShowAddMember(false); } }} disabled={!newMemberName || !newMemberEmail} className="flex-1 bg-violet-500 hover:bg-violet-600 disabled:opacity-50">
              <UserPlus className="w-4 h-4 mr-2" />{language === "ru" ? "Добавить" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!confirmDeleteMember} onClose={() => setConfirmDeleteMember(null)}>
        <ModalHeader onClose={() => setConfirmDeleteMember(null)}><ModalTitle>{language === "ru" ? "Удалить участника?" : "Delete team member?"}</ModalTitle></ModalHeader>
        <div className="space-y-4">
          <p className="text-slate-400">{language === "ru" ? "Это действие нельзя отменить." : "This action cannot be undone."}</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setConfirmDeleteMember(null)} className="flex-1 text-slate-400 hover:text-white hover:bg-white/10">{t("common.cancel", language)}</Button>
            <Button onClick={() => { if (confirmDeleteMember) { api.deleteTeamMember(confirmDeleteMember); setConfirmDeleteMember(null); } }} className="flex-1 bg-red-500 hover:bg-red-600"><Trash2 className="w-4 h-4 mr-2" />{t("common.delete", language)}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
