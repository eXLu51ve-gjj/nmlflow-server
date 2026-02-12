"use client";

import { useState, useEffect, useRef } from "react";
import { useStore, Task, Project, ProjectColumn, TeamMember } from "@/store";
import { useApiActions } from "@/hooks/use-api-actions";
import { t } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Calendar,
  Tag,
  AlertCircle,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  MessageSquare,
  Trash2,
  Pencil,
  ImageIcon,
  X,
  Check,
  GripVertical,
  Archive,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const priorityConfig = {
  high: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertCircle },
  medium: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock },
  low: { color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: CheckCircle2 },
};

const columnColors = [
  { value: "from-slate-500 to-slate-600", label: { ru: "Серый", en: "Gray" } },
  { value: "from-blue-500 to-indigo-500", label: { ru: "Синий", en: "Blue" } },
  { value: "from-amber-500 to-orange-500", label: { ru: "Оранжевый", en: "Orange" } },
  { value: "from-emerald-500 to-green-500", label: { ru: "Зелёный", en: "Green" } },
  { value: "from-red-500 to-rose-500", label: { ru: "Красный", en: "Red" } },
  { value: "from-violet-500 to-purple-500", label: { ru: "Фиолетовый", en: "Purple" } },
  { value: "from-cyan-500 to-teal-500", label: { ru: "Бирюзовый", en: "Cyan" } },
  { value: "from-pink-500 to-rose-500", label: { ru: "Розовый", en: "Pink" } },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function TaskCard({ task, overlay = false, onClick, onViewMember }: { task: Task; overlay?: boolean; onClick?: () => void; onViewMember?: (member: TeamMember) => void }) {
  const { language, teamMembers } = useStore();
  // Support both old assigneeId and new assigneeIds
  const assigneeIds = task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []);
  const assignees = teamMembers.filter((m) => assigneeIds.includes(m.id));
  const priority = task.priority ? priorityConfig[task.priority] : null;
  const PriorityIcon = priority?.icon;
  const lastComment = task.comments?.[task.comments.length - 1];
  const hasPhotos = task.attachments && task.attachments.length > 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { task } });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <motion.div
      ref={!overlay ? setNodeRef : undefined}
      style={!overlay ? style : undefined}
      {...(!overlay ? attributes : {})}
      {...(!overlay ? listeners : {})}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "group rounded-xl cursor-grab active:cursor-grabbing overflow-hidden touch-none",
        "glass-theme",
        "hover:bg-slate-800/60 hover:border-white/20 transition-all duration-200",
        isDragging && "opacity-50",
        overlay && "shadow-2xl rotate-3"
      )}
    >
      {task.coverImage && (
        <div className="w-full h-32 overflow-hidden">
          <img src={task.coverImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold text-orange-400 line-clamp-2 flex items-center gap-1.5">
            {task.title === task.address && task.address && <MapPin className="w-4 h-4 flex-shrink-0" />}
            {task.title}
          </h4>
          {task.priority && priority && PriorityIcon && (
            <Badge variant="outline" className={cn("shrink-0 text-xs", priority.color)}>
              <PriorityIcon className="w-3 h-3 mr-1" />
              {t(`tasks.${task.priority}` as any, language)}
            </Badge>
          )}
        </div>
        {task.description && <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>}
        {task.address && task.title !== task.address && (
          <div className="flex items-center gap-1.5 text-xs mb-1.5">
            <MapPin className="w-3 h-3 text-indigo-400" />
            <span className="truncate text-white/90">{task.address}</span>
          </div>
        )}
        {task.phone && (
          <div className="flex items-center gap-1.5 text-xs mb-2">
            <Phone className="w-3 h-3 text-emerald-400" />
            <span className="text-white/90">{task.phone}</span>
          </div>
        )}
        {hasPhotos && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex -space-x-2">
              {task.attachments!.slice(0, 3).map((img, i) => (
                <div key={i} className="w-8 h-8 rounded-md overflow-hidden border-2 border-slate-800">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {task.attachments!.length > 3 && <span className="text-xs text-slate-500">+{task.attachments!.length - 3}</span>}
          </div>
        )}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {task.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Tag className="w-3 h-3" />{tag}
              </span>
            ))}
            {task.tags.length > 2 && <span className="text-xs text-slate-500">+{task.tags.length - 2}</span>}
          </div>
        )}
        {lastComment && (
          <div className="p-2 rounded-lg bg-slate-900/50 border border-white/5 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <MessageSquare className="w-3 h-3" />{lastComment.authorName}
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{lastComment.text}</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {assignees.length > 0 && (
              <div className="flex -space-x-1.5">
                {assignees.slice(0, 3).map((assignee) => (
                  <Avatar 
                    key={assignee.id} 
                    className="w-6 h-6 border-2 border-slate-800 cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all"
                    onClick={(e) => { e.stopPropagation(); onViewMember?.(assignee); }}
                  >
                    <AvatarImage src={assignee.avatar} />
                    <AvatarFallback className="text-xs bg-slate-700">{assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {assignees.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                    +{assignees.length - 3}
                  </div>
                )}
              </div>
            )}
            {/* Дата создания */}
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Plus className="w-3 h-3" />
              {new Date(task.createdAt).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "short" })}
            </span>
            {task.deadline && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3 h-3" />
                {new Date(task.deadline).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
          {task.comments && task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MessageSquare className="w-3 h-3" />{task.comments.length}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}


// Editable Column Header
function EditableColumnHeader({
  column,
  tasksCount,
  isEditMode,
  onUpdate,
  onDelete,
}: {
  column: ProjectColumn;
  tasksCount: number;
  isEditMode: boolean;
  onUpdate: (updates: Partial<ProjectColumn>) => void;
  onDelete: () => void;
}) {
  const { language } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name[language]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (isEditMode && isEditing) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="h-8 bg-slate-800/50 border-white/10 text-white text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onUpdate({ name: { ...column.name, [language]: editName } });
              setIsEditing(false);
            }
            if (e.key === "Escape") {
              setEditName(column.name[language]);
              setIsEditing(false);
            }
          }}
        />
        <button
          onClick={() => {
            onUpdate({ name: { ...column.name, [language]: editName } });
            setIsEditing(false);
          }}
          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setEditName(column.name[language]);
            setIsEditing(false);
          }}
          className="p-1.5 rounded-lg bg-slate-500/20 text-slate-400 hover:bg-slate-500/30"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-1">
      {isEditMode ? (
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-5 h-5 rounded-full cursor-pointer ring-2 ring-white/20 hover:ring-white/40"
            style={{
              background: column.color.includes("slate") ? "linear-gradient(to right, #64748b, #475569)" :
                         column.color.includes("blue") ? "linear-gradient(to right, #3b82f6, #6366f1)" :
                         column.color.includes("amber") ? "linear-gradient(to right, #f59e0b, #f97316)" :
                         column.color.includes("emerald") ? "linear-gradient(to right, #10b981, #22c55e)" :
                         column.color.includes("red") ? "linear-gradient(to right, #ef4444, #f43f5e)" :
                         column.color.includes("violet") ? "linear-gradient(to right, #8b5cf6, #a855f7)" :
                         column.color.includes("cyan") ? "linear-gradient(to right, #06b6d4, #14b8a6)" :
                         column.color.includes("pink") ? "linear-gradient(to right, #ec4899, #f43f5e)" :
                         "linear-gradient(to right, #64748b, #475569)"
            }}
          />
          {showColorPicker && (
            <div className="absolute top-7 left-0 z-50 p-3 rounded-xl bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-xl min-w-[160px]">
              <div className="grid grid-cols-4 gap-2">
                {columnColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      onUpdate({ color: c.value });
                      setShowColorPicker(false);
                    }}
                    className={cn(
                      "w-8 h-8 rounded-full flex-shrink-0",
                      column.color === c.value && "ring-2 ring-white ring-offset-2 ring-offset-slate-800"
                    )}
                    style={{
                      background: c.value.includes("slate") ? "linear-gradient(to right, #64748b, #475569)" :
                                 c.value.includes("blue") ? "linear-gradient(to right, #3b82f6, #6366f1)" :
                                 c.value.includes("amber") ? "linear-gradient(to right, #f59e0b, #f97316)" :
                                 c.value.includes("emerald") ? "linear-gradient(to right, #10b981, #22c55e)" :
                                 c.value.includes("red") ? "linear-gradient(to right, #ef4444, #f43f5e)" :
                                 c.value.includes("violet") ? "linear-gradient(to right, #8b5cf6, #a855f7)" :
                                 c.value.includes("cyan") ? "linear-gradient(to right, #06b6d4, #14b8a6)" :
                                 c.value.includes("pink") ? "linear-gradient(to right, #ec4899, #f43f5e)" :
                                 "linear-gradient(to right, #64748b, #475569)"
                    }}
                    title={c.label[language]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={cn("w-3 h-3 rounded-full bg-gradient-to-r", column.color)} />
      )}
      
      <h3
        className={cn(
          "text-sm font-semibold",
          isEditMode && "cursor-pointer hover:opacity-80"
        )}
        style={{
          color: column.color.includes("slate") ? "#94a3b8" :
                 column.color.includes("blue") ? "#60a5fa" :
                 column.color.includes("amber") ? "#fbbf24" :
                 column.color.includes("emerald") ? "#34d399" :
                 column.color.includes("red") ? "#f87171" :
                 column.color.includes("violet") ? "#a78bfa" :
                 column.color.includes("cyan") ? "#22d3ee" :
                 column.color.includes("pink") ? "#f472b6" :
                 "#ffffff"
        }}
        onClick={() => isEditMode && setIsEditing(true)}
      >
        {column.name[language]}
      </h3>
      
      <span className="ml-auto px-2 py-0.5 rounded text-xs bg-white/10 text-slate-400">
        {tasksCount}
      </span>
      
      {/* Archive column indicator */}
      {column.isArchiveColumn && !isEditMode && (
        <span title={language === "ru" ? "Архивная колонка" : "Archive column"}>
          <Archive className="w-3.5 h-3.5 text-amber-400" />
        </span>
      )}
      
      {isEditMode && (
        <>
          <button
            onClick={() => onUpdate({ isArchiveColumn: !column.isArchiveColumn })}
            className={cn(
              "p-1 rounded-lg transition-colors",
              column.isArchiveColumn 
                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" 
                : "hover:bg-amber-500/10 text-slate-400 hover:text-amber-400"
            )}
            title={language === "ru" ? "Пометить как архивную" : "Mark as archive column"}
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

function TaskColumn({
  column,
  tasks,
  onTaskClick,
  onViewMember,
  isEditMode,
  onUpdateColumn,
  onDeleteColumn,
}: {
  column: ProjectColumn;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onViewMember: (member: TeamMember) => void;
  isEditMode: boolean;
  onUpdateColumn: (updates: Partial<ProjectColumn>) => void;
  onDeleteColumn: () => void;
}) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: column.id });
  
  // Sortable for column reordering in edit mode
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `column-${column.id}`,
    data: { type: "column", column },
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setSortableRef}
      style={style}
      className={cn(
        "flex flex-col min-w-[300px] max-w-[300px]",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        {isEditMode && (
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 text-slate-500 hover:text-white"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <EditableColumnHeader
          column={column}
          tasksCount={tasks.length}
          isEditMode={isEditMode}
          onUpdate={onUpdateColumn}
          onDelete={onDeleteColumn}
        />
      </div>
      <div
        ref={setDroppableRef}
        className={cn(
          "flex-1 space-y-3 min-h-[100px] rounded-xl transition-colors",
          isOver && "bg-indigo-500/10 border-2 border-dashed border-indigo-500/30"
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onViewMember={onViewMember} />
            ))}
          </AnimatePresence>
        </SortableContext>
      </div>
    </div>
  );
}


export default function TasksPage() {
  const {
    language,
    tasks,
    teamMembers,
    isAdmin,
    projects,
    currentProjectId,
    currentUser,
  } = useStore();

  // API actions for database operations
  const api = useApiActions();

  const currentProject = projects.find((p) => p.id === currentProjectId) || projects[0];
  const columns = currentProject?.columns.sort((a, b) => a.order - b.order) || [];

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<ProjectColumn | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isTaskEditing, setIsTaskEditing] = useState(false);
  const [editTask, setEditTask] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState("");
  const [mounted, setMounted] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [projectNameValue, setProjectNameValue] = useState("");
  const [columnsBackup, setColumnsBackup] = useState<ProjectColumn[] | null>(null);
  const [projectNameBackup, setProjectNameBackup] = useState<string | null>(null);
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newTaskCoverRef = useRef<HTMLInputElement>(null);
  const [newTaskCover, setNewTaskCover] = useState<string>("");
  const [editTaskCover, setEditTaskCover] = useState<string>("");
  const [viewMember, setViewMember] = useState<TeamMember | null>(null);
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    address: "",
    phone: "",
    priority: "" as Task["priority"] | "",
    status: "",
    assigneeIds: [] as string[],
    tags: "",
    deadline: "",
  });

  const handleTaskClick = (task: Task) => {
    if (!isEditMode) {
      setSelectedTask(task);
      // Load comments from database
      api.loadTaskComments(task.id);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Poll for new comments every 5 seconds when task is open
  useEffect(() => {
    if (!selectedTask) return;
    
    const interval = setInterval(async () => {
      // Reload comments from server and update selectedTask
      const comments = await api.loadTaskComments(selectedTask.id);
      if (comments && Array.isArray(comments)) {
        setSelectedTask(prev => prev ? { ...prev, comments } : null);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [selectedTask?.id]);

  useEffect(() => {
    if (selectedTask && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTask, selectedTask?.comments?.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    
    // Check if dragging a column
    if (activeId.startsWith("column-")) {
      const columnId = activeId.replace("column-", "");
      const column = columns.find((c) => c.id === columnId);
      if (column) setActiveColumn(column);
      return;
    }
    
    // Otherwise it's a task
    const task = tasks.find((t) => t.id === activeId);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumn(null);
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) return;
    
    // Handle column reordering
    if (activeId.startsWith("column-") && overId.startsWith("column-")) {
      const activeColumnId = activeId.replace("column-", "");
      const overColumnId = overId.replace("column-", "");
      
      // Calculate new order
      const oldIndex = columns.findIndex(c => c.id === activeColumnId);
      const newIndex = columns.findIndex(c => c.id === overColumnId);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newColumns = [...columns];
        const [removed] = newColumns.splice(oldIndex, 1);
        newColumns.splice(newIndex, 0, removed);
        const columnIds = newColumns.map(c => c.id);
        api.reorderColumns(currentProjectId, columnIds);
      }
      return;
    }
    
    // Handle task operations (only if not dragging columns)
    if (!activeId.startsWith("column-")) {
      const taskId = activeId;
      const activeTask = tasks.find(t => t.id === taskId);
      if (!activeTask) return;
      
      // Check if dropped on a column
      const targetColumn = columns.find((col) => col.id === overId);
      if (targetColumn) {
        // Moving to a different column (drop on column header/empty area)
        const targetTasks = getTasksByStatus(targetColumn.id);
        const newTaskIds = [...targetTasks.map(t => t.id), taskId];
        api.reorderTasks(newTaskIds, targetColumn.id);
        return;
      }
      
      // Check if dropped on another task
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        const activeColumnId = activeTask.status;
        const overColumnId = overTask.status;
        
        if (activeColumnId === overColumnId) {
          // Same column - reorder within column
          const columnTasks = getTasksByStatus(activeColumnId);
          const oldIndex = columnTasks.findIndex(t => t.id === taskId);
          const newIndex = columnTasks.findIndex(t => t.id === overId);
          
          if (oldIndex !== -1 && newIndex !== -1) {
            const newTasks = [...columnTasks];
            const [removed] = newTasks.splice(oldIndex, 1);
            newTasks.splice(newIndex, 0, removed);
            const taskIds = newTasks.map(t => t.id);
            api.reorderTasks(taskIds, activeColumnId);
          }
        } else {
          // Different column - move to new column at specific position
          const targetTasks = getTasksByStatus(overColumnId);
          const newIndex = targetTasks.findIndex(t => t.id === overId);
          const newTaskIds = [...targetTasks.map(t => t.id)];
          newTaskIds.splice(newIndex, 0, taskId);
          api.reorderTasks(newTaskIds, overColumnId);
        }
      }
    }
  };

  const handleAddTask = () => {
    api.createTask({
      title: newTask.title || newTask.address || (language === "ru" ? "Без названия" : "Untitled"),
      description: newTask.description || undefined,
      address: newTask.address || undefined,
      phone: newTask.phone || undefined,
      coverImage: newTaskCover || undefined,
      priority: newTask.priority || undefined,
      status: newTask.status || columns[0]?.id || "todo",
      assigneeIds: newTask.assigneeIds.length > 0 ? newTask.assigneeIds : undefined,
      tags: newTask.tags ? newTask.tags.split(",").map((t) => t.trim()) : [],
      deadline: newTask.deadline || undefined,
      projectId: currentProjectId,
    });
    setNewTask({ title: "", description: "", address: "", phone: "", priority: "", status: "", assigneeIds: [], tags: "", deadline: "" });
    setNewTaskCover("");
    setShowAddDialog(false);
  };

  const handleAddColumn = () => {
    api.createColumn(currentProjectId, {
      name: { ru: "Новая колонка", en: "New Column" },
      color: "from-slate-500 to-slate-600",
    });
  };

  const handleSaveProjectName = () => {
    if (projectNameValue.trim() && currentProject) {
      api.updateProject(currentProject.id, { name: projectNameValue.trim() });
    }
    setEditingProjectName(false);
  };

  const enterEditMode = () => {
    // Save backup before editing
    if (currentProject) {
      setColumnsBackup([...currentProject.columns]);
      setProjectNameBackup(currentProject.name);
    }
    setIsEditMode(true);
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setColumnsBackup(null);
    setProjectNameBackup(null);
  };

  const cancelEditMode = () => {
    // Restore from backup
    if (currentProject && columnsBackup && projectNameBackup) {
      api.updateProject(currentProject.id, { 
        name: projectNameBackup,
      });
      // Restore columns via API
      columnsBackup.forEach(col => {
        api.updateColumn(col.id, col);
      });
    }
    setIsEditMode(false);
    setColumnsBackup(null);
    setProjectNameBackup(null);
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;
    try {
      await api.deleteProject(currentProject.id);
      setShowDeleteProjectDialog(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const getTasksByStatus = (status: string) =>
    tasks
      .filter((task) => task.status === status && task.projectId === currentProjectId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!mounted) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-slate-400">{language === "ru" ? "Загрузка..." : "Loading..."}</div>
      </div>
    );
  }

  const totalTasks = tasks.filter((t) => t.projectId === currentProjectId).length;


  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            {editingProjectName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={projectNameValue}
                  onChange={(e) => setProjectNameValue(e.target.value)}
                  className="h-9 text-xl font-bold bg-slate-800/50 border-white/10 text-white"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveProjectName();
                    if (e.key === "Escape") setEditingProjectName(false);
                  }}
                />
                <Button size="sm" onClick={handleSaveProjectName} className="bg-emerald-500 hover:bg-emerald-600">
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingProjectName(false)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">
                  {currentProject?.name || t("tasks.title", language)}
                </h1>
                {isAdmin() && isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setProjectNameValue(currentProject?.name || "");
                      setEditingProjectName(true);
                    }}
                    className="p-1.5 h-auto text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
          <p className="text-slate-400 text-sm">
            {totalTasks} {language === "ru" ? "задач" : "tasks"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin() && (
            <>
              {isEditMode && (
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-sm font-medium text-indigo-400">
                    {language === "ru" ? "Режим редактирования" : "Edit Mode"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {language === "ru" ? "• перетаскивайте колонки, меняйте названия и цвета" : "• drag columns, edit names and colors"}
                  </span>
                </div>
              )}
              {isEditMode ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteProjectDialog(true)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === "ru" ? "Удалить проект" : "Delete Project"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={cancelEditMode}
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {language === "ru" ? "Отмена" : "Cancel"}
                  </Button>
                  <Button
                    onClick={exitEditMode}
                    className="bg-indigo-500 hover:bg-indigo-600"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {language === "ru" ? "Готово" : "Done"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={enterEditMode}
                    className="border-white/10 hover:bg-white/5 text-slate-300"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    {language === "ru" ? "Редактировать" : "Edit"}
                  </Button>
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    className="btn-theme-gradient"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t("tasks.addTask", language)}
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <motion.div 
          key={currentProjectId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex gap-6 overflow-x-auto pb-4"
        >
          <SortableContext 
            items={columns.map(c => `column-${c.id}`)} 
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column, index) => (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
              >
                <TaskColumn
                  column={column}
                  tasks={getTasksByStatus(column.id)}
                  onTaskClick={handleTaskClick}
                  onViewMember={setViewMember}
                  isEditMode={isEditMode}
                  onUpdateColumn={(updates) => api.updateColumn(column.id, updates)}
                  onDeleteColumn={() => api.deleteColumn(column.id)}
                />
              </motion.div>
            ))}
          </SortableContext>
          
          {/* Add Column Button */}
          {isEditMode && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              onClick={handleAddColumn}
              className="flex flex-col items-center justify-center min-w-[300px] max-w-[300px] min-h-[200px] rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
            >
              <div className="p-3 rounded-full bg-white/5 group-hover:bg-indigo-500/20 transition-colors mb-3">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-400" />
              </div>
              <span className="text-sm text-slate-400 group-hover:text-indigo-400">
                {language === "ru" ? "Добавить колонку" : "Add Column"}
              </span>
            </motion.button>
          )}
        </motion.div>
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} overlay />}
        </DragOverlay>
      </DndContext>

      {/* Delete Project Confirmation Dialog */}
      <Modal open={showDeleteProjectDialog} onClose={() => setShowDeleteProjectDialog(false)}>
        <ModalHeader onClose={() => setShowDeleteProjectDialog(false)}>
          <ModalTitle>{language === "ru" ? "Удалить проект?" : "Delete Project?"}</ModalTitle>
        </ModalHeader>
        <div className="space-y-4">
          <p className="text-slate-400">
            {language === "ru" 
              ? `Вы уверены, что хотите удалить проект "${currentProject?.name}"? Все задачи в этом проекте будут удалены. Это действие нельзя отменить.`
              : `Are you sure you want to delete project "${currentProject?.name}"? All tasks in this project will be deleted. This action cannot be undone.`
            }
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteProjectDialog(false)}>
              {language === "ru" ? "Отмена" : "Cancel"}
            </Button>
            <Button 
              onClick={handleDeleteProject}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {language === "ru" ? "Удалить" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Task Dialog */}
      <Modal open={showAddDialog} onClose={() => setShowAddDialog(false)}>
        <ModalHeader onClose={() => setShowAddDialog(false)}>
          <ModalTitle>{t("tasks.addTask", language)}</ModalTitle>
        </ModalHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {newTaskCover && (
            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10">
              <img src={newTaskCover} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setNewTaskCover("")} className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div>
            <Label className="text-slate-300">{language === "ru" ? "Название" : "Title"}</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="flex-1 bg-slate-800/50 text-white"
                style={{ borderColor: 'transparent' }}
                placeholder={language === "ru" ? "Введите название задачи" : "Enter task title"}
              />
              <input
                ref={newTaskCoverRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => setNewTaskCover(event.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                  e.target.value = "";
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => newTaskCoverRef.current?.click()}
                className="border-white/10 hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-slate-300">{language === "ru" ? "Описание" : "Description"}</Label>
            <Textarea
              value={newTask.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTask({ ...newTask, description: e.target.value })}
              className="mt-1.5 bg-slate-800/50 text-white min-h-[80px] resize-none"
              style={{ borderColor: 'transparent' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{language === "ru" ? "Адрес" : "Address"}</Label>
              <Input value={newTask.address} onChange={(e) => setNewTask({ ...newTask, address: e.target.value })} className="mt-1.5 bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }} />
            </div>
            <div>
              <Label className="text-slate-300 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{language === "ru" ? "Телефон" : "Phone"}</Label>
              <Input value={newTask.phone} onChange={(e) => setNewTask({ ...newTask, phone: e.target.value })} className="mt-1.5 bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">{t("tasks.priority", language)}</Label>
              <Select value={newTask.priority || "none"} onValueChange={(v) => setNewTask({ ...newTask, priority: v === "none" ? "" : v as Task["priority"] })}>
                <SelectTrigger className="mt-1.5 bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }}><SelectValue /></SelectTrigger>
                <SelectContent className="glass-dropdown text-white">
                  <SelectItem value="none">{language === "ru" ? "Без приоритета" : "No priority"}</SelectItem>
                  <SelectItem value="high">{t("tasks.high", language)}</SelectItem>
                  <SelectItem value="medium">{t("tasks.medium", language)}</SelectItem>
                  <SelectItem value="low">{t("tasks.low", language)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">{t("tasks.assignee", language)}</Label>
              <div className="mt-1.5 p-2 rounded-md bg-slate-800/50 max-h-32 overflow-y-auto" style={{ borderColor: 'transparent' }}>
                {teamMembers.map((member) => (
                  <label key={member.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTask.assigneeIds.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewTask({ ...newTask, assigneeIds: [...newTask.assigneeIds, member.id] });
                        } else {
                          setNewTask({ ...newTask, assigneeIds: newTask.assigneeIds.filter(id => id !== member.id) });
                        }
                      }}
                      className="rounded border-white/20 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
                    />
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-[8px]">{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white">{member.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">{t("tasks.deadline", language)}</Label>
              <Input type="date" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} className="mt-1.5 bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }} />
            </div>
            <div>
              <Label className="text-slate-300">{t("tasks.tags", language)}</Label>
              <Input value={newTask.tags} onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })} className="mt-1.5 bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }} placeholder={language === "ru" ? "через запятую" : "comma separated"} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1 border-white/10 hover:bg-white/5">{t("common.cancel", language)}</Button>
            <Button onClick={handleAddTask} className="flex-1 btn-theme-gradient">{t("common.save", language)}</Button>
          </div>
        </div>
      </Modal>


      {/* Task Detail Modal */}
      {selectedTask && !isTaskEditing && (
        <Modal open={!!selectedTask && !showDeleteConfirm && !viewImage} onClose={() => setSelectedTask(null)}>
          {selectedTask.coverImage && (
            <div className="-mx-6 -mt-6 mb-4 h-40 overflow-hidden rounded-t-2xl">
              <img src={selectedTask.coverImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <ModalHeader
            onClose={() => setSelectedTask(null)}
            actions={isAdmin() ? (
              <>
                <button
                  onClick={() => setShowArchiveConfirm(true)}
                  className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/30 text-amber-400"
                  title={language === "ru" ? "Архивировать" : "Archive"}
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditTask({
                      title: selectedTask.title,
                      description: selectedTask.description || "",
                      address: selectedTask.address || "",
                      phone: selectedTask.phone || "",
                      priority: selectedTask.priority,
                      assigneeIds: selectedTask.assigneeIds || (selectedTask.assigneeId ? [selectedTask.assigneeId] : []),
                      deadline: selectedTask.deadline || "",
                      tags: selectedTask.tags,
                      coverImage: selectedTask.coverImage || "",
                    });
                    setEditTaskCover(selectedTask.coverImage || "");
                    setIsTaskEditing(true);
                  }}
                  className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/30 text-indigo-400"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : undefined}
          >
            <ModalTitle>{selectedTask.title}</ModalTitle>
          </ModalHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex items-center gap-3">
              {selectedTask.priority && (
                <Badge variant="outline" className={cn("text-xs", priorityConfig[selectedTask.priority].color)}>
                  {(() => { const Icon = priorityConfig[selectedTask.priority].icon; return <Icon className="w-3 h-3 mr-1" />; })()}
                  {t(`tasks.${selectedTask.priority}` as any, language)}
                </Badge>
              )}
            </div>
            {selectedTask.description && (
              <div>
                <Label className="text-slate-400 text-xs">{language === "ru" ? "Описание" : "Description"}</Label>
                <p className="text-sm text-white mt-1">{selectedTask.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {selectedTask.address && (
                <div className="p-3 rounded-lg bg-slate-800/50 border border-white/10">
                  <div className="flex items-center gap-2 text-indigo-400 mb-1"><MapPin className="w-4 h-4" /><span className="text-xs">{language === "ru" ? "Адрес" : "Address"}</span></div>
                  <p className="text-sm text-white">{selectedTask.address}</p>
                </div>
              )}
              {selectedTask.phone && (
                <div className="p-3 rounded-lg bg-slate-800/50 border border-white/10">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1"><Phone className="w-4 h-4" /><span className="text-xs">{language === "ru" ? "Телефон" : "Phone"}</span></div>
                  <p className="text-sm text-white">{selectedTask.phone}</p>
                </div>
              )}
            </div>
            {/* Photos Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-400 text-xs">{language === "ru" ? "Фото работ" : "Work Photos"}</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      for (const file of Array.from(files)) {
                        const url = await api.uploadAttachment(selectedTask.id, file);
                        if (url) {
                          setSelectedTask(prev => prev ? {
                            ...prev,
                            attachments: [...(prev.attachments || []), url]
                          } : null);
                        }
                      }
                    }
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 px-2 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                >
                  <ImageIcon className="w-3.5 h-3.5 mr-1" />
                  {language === "ru" ? "Добавить" : "Add"}
                </Button>
              </div>
              {selectedTask.attachments && selectedTask.attachments.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {selectedTask.attachments.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-indigo-500/50">
                      <img src={img} alt="" className="w-full h-full object-cover" onClick={() => setViewImage(img)} />
                      {isAdmin() && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await api.removeAttachment(selectedTask.id, img);
                            setSelectedTask(prev => prev ? {
                              ...prev,
                              attachments: (prev.attachments || []).filter(a => a !== img)
                            } : null);
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-lg border-2 border-dashed border-white/10 hover:border-indigo-500/30 cursor-pointer text-center transition-colors"
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                  <p className="text-xs text-slate-500">{language === "ru" ? "Нажмите чтобы добавить фото" : "Click to add photos"}</p>
                </div>
              )}
            </div>
            {selectedTask.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTask.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}
            {/* Comments */}
            <div className="border-t border-white/10 pt-4">
              <Label className="text-slate-400 text-xs mb-3 block">{language === "ru" ? "Комментарии" : "Comments"} ({selectedTask.comments?.length || 0})</Label>
              <div className="space-y-3 max-h-[200px] overflow-y-auto mb-3">
                {selectedTask.comments?.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg bg-slate-800/30 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-indigo-400">{comment.authorName}</span>
                      <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString(language === "ru" ? "ru-RU" : "en-US")}</span>
                    </div>
                    <p className="text-sm text-white">{comment.text}</p>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={language === "ru" ? "Написать комментарий..." : "Write a comment..."}
                  className="flex-1 bg-slate-800/50 border-white/10 text-white"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && newComment.trim() && currentUser) {
                      const comment = await api.addComment(selectedTask.id, newComment.trim(), currentUser.id);
                      if (comment) {
                        setSelectedTask({
                          ...selectedTask,
                          comments: [...(selectedTask.comments || []), comment].slice(-10)
                        });
                      }
                      setNewComment("");
                    }
                  }}
                />
                <Button
                  onClick={async () => {
                    if (newComment.trim() && currentUser) {
                      const comment = await api.addComment(selectedTask.id, newComment.trim(), currentUser.id);
                      if (comment) {
                        setSelectedTask({
                          ...selectedTask,
                          comments: [...(selectedTask.comments || []), comment].slice(-10)
                        });
                      }
                      setNewComment("");
                    }
                  }}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  {language === "ru" ? "Отправить" : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}


      {/* Edit Task Modal */}
      {selectedTask && isTaskEditing && (
        <Modal open={isTaskEditing} onClose={() => setIsTaskEditing(false)}>
          <ModalHeader onClose={() => setIsTaskEditing(false)}>
            <ModalTitle>{language === "ru" ? "Редактировать задачу" : "Edit Task"}</ModalTitle>
          </ModalHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label className="text-slate-300">{language === "ru" ? "Название" : "Title"}</Label>
              <Input
                value={editTask.title || ""}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                className="mt-1.5 bg-slate-800/50 text-white"
                style={{ borderColor: 'transparent' }}
              />
            </div>
            <div>
              <Label className="text-slate-300">{language === "ru" ? "Описание" : "Description"}</Label>
              <Textarea
                value={editTask.description || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditTask({ ...editTask, description: e.target.value })}
                className="mt-1.5 bg-slate-800/50 text-white min-h-[80px] resize-none"
                style={{ borderColor: 'transparent' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">{language === "ru" ? "Адрес" : "Address"}</Label>
                <Input value={editTask.address || ""} onChange={(e) => setEditTask({ ...editTask, address: e.target.value })} className="mt-1.5 bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }} />
              </div>
              <div>
                <Label className="text-slate-300">{language === "ru" ? "Телефон" : "Phone"}</Label>
                <Input value={editTask.phone || ""} onChange={(e) => setEditTask({ ...editTask, phone: e.target.value })} className="mt-1.5 bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">{t("tasks.priority", language)}</Label>
                <Select value={editTask.priority || "none"} onValueChange={(v) => setEditTask({ ...editTask, priority: v === "none" ? undefined : v as Task["priority"] })}>
                  <SelectTrigger className="mt-1.5 bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }}><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-dropdown text-white">
                    <SelectItem value="none">{language === "ru" ? "Без приоритета" : "No priority"}</SelectItem>
                    <SelectItem value="high">{t("tasks.high", language)}</SelectItem>
                    <SelectItem value="medium">{t("tasks.medium", language)}</SelectItem>
                    <SelectItem value="low">{t("tasks.low", language)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">{t("tasks.assignee", language)}</Label>
                <div className="mt-1.5 p-2 rounded-md bg-slate-800/50 max-h-32 overflow-y-auto" style={{ borderColor: 'transparent' }}>
                  {teamMembers.map((member) => (
                    <label key={member.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(editTask.assigneeIds || []).includes(member.id)}
                        onChange={(e) => {
                          const currentIds = editTask.assigneeIds || [];
                          if (e.target.checked) {
                            setEditTask({ ...editTask, assigneeIds: [...currentIds, member.id] });
                          } else {
                            setEditTask({ ...editTask, assigneeIds: currentIds.filter(id => id !== member.id) });
                          }
                        }}
                        className="rounded border-white/20 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
                      />
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-[8px]">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsTaskEditing(false)} className="flex-1 border-white/10 hover:bg-white/5">{t("common.cancel", language)}</Button>
              <Button
                onClick={() => {
                  api.updateTask(selectedTask.id, editTask);
                  setSelectedTask({ ...selectedTask, ...editTask } as Task);
                  setIsTaskEditing(false);
                }}
                className="flex-1 btn-theme-gradient"
              >
                {t("common.save", language)}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl glass-theme p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-500/20"><Trash2 className="w-5 h-5 text-red-400" /></div>
                <h3 className="text-lg font-semibold text-white">{language === "ru" ? "Удалить задачу?" : "Delete task?"}</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">{language === "ru" ? "Это действие нельзя отменить." : "This action cannot be undone."}</p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 text-slate-400" onClick={() => setShowDeleteConfirm(false)}>{language === "ru" ? "Отмена" : "Cancel"}</Button>
                <Button
                  className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                  onClick={() => {
                    api.deleteTask(selectedTask.id);
                    setShowDeleteConfirm(false);
                    setSelectedTask(null);
                  }}
                >
                  {language === "ru" ? "Удалить" : "Delete"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archive Confirmation */}
      <AnimatePresence>
        {showArchiveConfirm && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowArchiveConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl glass-theme p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-amber-500/20"><Archive className="w-5 h-5 text-amber-400" /></div>
                <h3 className="text-lg font-semibold text-white">{language === "ru" ? "Архивировать задачу?" : "Archive task?"}</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                {language === "ru" 
                  ? "Задача будет перемещена в архив текущего месяца. Вы сможете просмотреть и скачать её в Админ-панели." 
                  : "The task will be moved to the current month's archive. You can view and download it in the Admin Panel."}
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 text-slate-400" onClick={() => setShowArchiveConfirm(false)}>{language === "ru" ? "Отмена" : "Cancel"}</Button>
                <Button
                  className="flex-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
                  onClick={() => {
                    api.archiveTask(selectedTask.id);
                    setShowArchiveConfirm(false);
                    setSelectedTask(null);
                  }}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {language === "ru" ? "Архивировать" : "Archive"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer */}
      <AnimatePresence>
        {viewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setViewImage(null)}
          >
            <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20" onClick={() => setViewImage(null)}>
              <X className="w-6 h-6" />
            </button>
            <img src={viewImage} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Profile Modal */}
      <Modal open={!!viewMember} onClose={() => setViewMember(null)}>
        <ModalHeader onClose={() => setViewMember(null)}>
          <ModalTitle>{viewMember?.name}</ModalTitle>
        </ModalHeader>
        {viewMember && (
          <div className="space-y-4">
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
                <div className="flex items-center gap-2 text-slate-400 mb-1"><MessageSquare className="w-4 h-4" /><span className="text-xs">Email</span></div>
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
    </div>
  );
}
