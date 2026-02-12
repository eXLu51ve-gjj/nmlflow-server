"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, RevenueSource } from "@/store";
import { cn } from "@/lib/utils";
import { Settings, RotateCcw, DollarSign, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveRevenueSettings } from "@/lib/api-actions";

export function RevenueSettings() {
  const { 
    language, 
    revenueSettings, 
    updateRevenueSettings, 
    resetRevenueSettings,
    projects,
    leads,
    tasks,
    currentUser,
  } = useStore();

  // Local state for editing
  const [localSources, setLocalSources] = useState<RevenueSource[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with store on mount and when store changes
  useEffect(() => {
    setLocalSources(revenueSettings.sources);
  }, [revenueSettings.sources]);

  // Calculate total revenue
  const calculatedRevenue = useMemo(() => {
    let total = 0;
    let count = 0;

    localSources.filter(s => s.enabled).forEach(source => {
      if (source.type === "crm") {
        const closedLeads = leads.filter(l => l.status === "closed");
        count += closedLeads.length;
        if (source.fixedAmount > 0) {
          total += closedLeads.length * source.fixedAmount;
        } else {
          total += closedLeads.reduce((sum, l) => sum + (l.value || 0), 0);
        }
      } else if (source.type === "project") {
        // Only calculate if project AND column are selected
        if (source.projectId && source.columnId && source.fixedAmount > 0) {
          const projectTasks = tasks.filter(
            t => t.projectId === source.projectId && t.status === source.columnId
          );
          count += projectTasks.length;
          total += projectTasks.length * source.fixedAmount;
        }
      }
    });

    return { total: Math.round(total), count };
  }, [localSources, leads, tasks]);

  const handleAddSource = (type: "crm" | "project") => {
    const newSource: RevenueSource = {
      id: `${type}-${Date.now()}`,
      type,
      fixedAmount: 0,
      enabled: true,
    };
    const newSources = [...localSources, newSource];
    setLocalSources(newSources);
    setHasChanges(true);
  };

  const handleUpdateSource = (id: string, updates: Partial<RevenueSource>) => {
    setLocalSources(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setHasChanges(true);
  };

  const handleDeleteSource = (id: string) => {
    setLocalSources(prev => prev.filter(s => s.id !== id));
    setHasChanges(true);
  };

  const handleSave = async () => {
    updateRevenueSettings({ sources: localSources });
    // Save to database
    await saveRevenueSettings(currentUser.id, localSources);
    setHasChanges(false);
  };

  const handleReset = async () => {
    const defaultSources = [{ id: "crm-default", type: "crm" as const, fixedAmount: 0, enabled: true }];
    resetRevenueSettings();
    setLocalSources(defaultSources);
    // Save to database
    await saveRevenueSettings(currentUser.id, defaultSources);
    setShowResetConfirm(false);
    setHasChanges(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={cn("relative overflow-hidden rounded-2xl glass-theme p-6")}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">
            {language === "ru" ? "Настройки выручки" : "Revenue Settings"}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowResetConfirm(true)}
          className="text-slate-400 hover:text-red-400"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {language === "ru" ? "Сброс" : "Reset"}
        </Button>
      </div>

      {/* Current Revenue Display */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-white">
              {language === "ru" ? "Текущая выручка" : "Current Revenue"}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-emerald-400">
              {new Intl.NumberFormat("ru-RU").format(calculatedRevenue.total)} ₽
            </p>
            <p className="text-xs text-slate-400">
              {calculatedRevenue.count} {language === "ru" ? "карточек" : "cards"}
            </p>
          </div>
        </div>
      </div>

      {/* Sources List */}
      <ScrollArea className="h-[280px] pr-2">
        <div className="space-y-3">
          {localSources.map((source) => (
            <SourceItem
              key={source.id}
              source={source}
              projects={projects}
              language={language}
              onUpdate={(updates) => handleUpdateSource(source.id, updates)}
              onDelete={() => handleDeleteSource(source.id)}
            />
          ))}
        </div>

        {/* Add Buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddSource("crm")}
            className="flex-1 border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-indigo-500 bg-transparent"
          >
            <Plus className="w-4 h-4 mr-1" />
            CRM
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddSource("project")}
            className="flex-1 border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-indigo-500 bg-transparent"
          >
            <Plus className="w-4 h-4 mr-1" />
            {language === "ru" ? "Проект" : "Project"}
          </Button>
        </div>
      </ScrollArea>

      {/* Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-white/10"
        >
          <Button
            onClick={handleSave}
            className="w-full bg-indigo-500 hover:bg-indigo-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {language === "ru" ? "Сохранить" : "Save"}
          </Button>
        </motion.div>
      )}

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowResetConfirm(false)}
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
                  <RotateCcw className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {language === "ru" ? "Сбросить настройки?" : "Reset settings?"}
                </h3>
              </div>
              
              <p className="text-sm text-slate-400 mb-6">
                {language === "ru" 
                  ? "Все настройки выручки будут сброшены к значениям по умолчанию."
                  : "All revenue settings will be reset to defaults."}
              </p>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 text-slate-400 hover:text-white"
                  onClick={() => setShowResetConfirm(false)}
                >
                  {language === "ru" ? "Отмена" : "Cancel"}
                </Button>
                <Button
                  className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                  onClick={handleReset}
                >
                  {language === "ru" ? "Сбросить" : "Reset"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Source Item Component
function SourceItem({
  source,
  projects,
  language,
  onUpdate,
  onDelete,
}: {
  source: RevenueSource;
  projects: any[];
  language: string;
  onUpdate: (updates: Partial<RevenueSource>) => void;
  onDelete: () => void;
}) {
  const selectedProject = projects.find(p => p.id === source.projectId);
  const columns = selectedProject?.columns || [];

  return (
    <div className={cn(
      "p-3 rounded-xl transition-all",
      source.enabled 
        ? "bg-slate-800/50" 
        : "bg-slate-900/50 opacity-60"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={source.enabled}
            onCheckedChange={(checked) => onUpdate({ enabled: checked })}
          />
          <span className={cn(
            "text-sm font-medium",
            source.type === "crm" ? "text-emerald-400" : "text-indigo-400"
          )}>
            {source.type === "crm" ? "CRM" : language === "ru" ? "Проект" : "Project"}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {source.type === "project" && (
        <div className="space-y-2 mb-3">
          {/* Project Select */}
          <select
            value={source.projectId || ""}
            onChange={(e) => onUpdate({ projectId: e.target.value, columnId: undefined })}
            className="w-full px-3 py-2 rounded-lg bg-slate-900/80 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 border-0"
            style={{ border: 'none' }}
          >
            <option value="">{language === "ru" ? "Выберите проект" : "Select project"}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          {/* Column Select */}
          {source.projectId && (
            <select
              value={source.columnId || ""}
              onChange={(e) => onUpdate({ columnId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900/80 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 border-0"
              style={{ border: 'none' }}
            >
              <option value="">{language === "ru" ? "Выберите колонку" : "Select column"}</option>
              {columns.map((column: any) => (
                <option key={column.id} value={column.id}>
                  {column.name[language] || column.name.ru}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Fixed Amount - only for projects */}
      {source.type === "project" && (
        <div>
          <Label className="text-[10px] text-slate-400 mb-1 block">
            {language === "ru" ? "Сумма за карточку (₽)" : "Amount per card (₽)"}
          </Label>
          <input
            type="number"
            value={source.fixedAmount || 0}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              onUpdate({ fixedAmount: isNaN(value) ? 0 : value });
            }}
            placeholder="0"
            className="w-full h-8 px-3 rounded-lg bg-slate-900/80 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 border-0"
            style={{ border: 'none' }}
          />
        </div>
      )}
      
      {source.type === "crm" && (
        <p className="text-[10px] text-slate-500">
          {language === "ru" ? "Сумма берётся из карточки лида" : "Amount taken from lead card"}
        </p>
      )}
    </div>
  );
}
