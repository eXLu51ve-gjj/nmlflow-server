"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderKanban,
  ScrollText,
  Shield,
  Plus,
  GripVertical,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createProject, saveNavOrder } from "@/lib/api-actions";
import { authAPI } from "@/lib/api";

const NAV_ITEMS_CONFIG: Record<string, { href: string; icon: any; labelKey: "nav.dashboard" | "nav.notifications" | "nav.crm" | "nav.tasks" | "admin.title" | "nav.settings" | "nav.salary"; hasSubmenu?: boolean; adminOnly?: boolean; userOnly?: boolean }> = {
  dashboard: { href: "/", icon: LayoutDashboard, labelKey: "nav.dashboard", adminOnly: true },
  notifications: { href: "/notifications", icon: ScrollText, labelKey: "nav.notifications", adminOnly: true },
  crm: { href: "/crm", icon: Users, labelKey: "nav.crm" },
  tasks: { href: "/tasks", icon: CheckSquare, labelKey: "nav.tasks", hasSubmenu: true },
  salary: { href: "/salary", icon: Wallet, labelKey: "nav.salary", userOnly: true },
  admin: { href: "/admin", icon: Shield, labelKey: "admin.title", adminOnly: true },
  settings: { href: "/settings", icon: Settings, labelKey: "nav.settings" },
};

type NavItemId = string;

interface SortableNavItemProps {
  id: string;
  isActive: boolean;
  sidebarCollapsed: boolean;
  language: "ru" | "en";
  projectsExpanded: boolean;
  setProjectsExpanded: (v: boolean) => void;
  projects: any[];
  currentProjectId: string;
  setCurrentProject: (id: string) => void;
  onAddProject: () => void;
  isAdmin: () => boolean;
}

function SortableNavItem({
  id,
  isActive,
  sidebarCollapsed,
  language,
  projectsExpanded,
  setProjectsExpanded,
  projects,
  currentProjectId,
  setCurrentProject,
  onAddProject,
  isAdmin,
}: SortableNavItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const item = NAV_ITEMS_CONFIG[id];
  const Icon = item.icon;
  const label = t(item.labelKey, language);

  const linkContent = (
    <div className="flex items-center w-full">
      {!sidebarCollapsed && (
        <div
          {...attributes}
          {...listeners}
          className="p-1 mr-1 cursor-grab hover:bg-white/10 rounded text-slate-500 hover:text-slate-300"
        >
          <GripVertical className="w-3 h-3" />
        </div>
      )}
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 flex-1",
          "hover:bg-white/10",
          isActive && "border"
        )}
        style={isActive ? {
          background: 'linear-gradient(to right, rgba(var(--color-glass-rgb), 0.3), rgba(var(--color-glass-rgb), 0.1))',
          borderColor: 'var(--color-primary)',
          borderWidth: '1px',
        } : undefined}
      >
        <Icon
          className={cn(
            "w-5 h-5 flex-shrink-0 transition-colors",
            !isActive && "text-app-text-muted"
          )}
          style={isActive ? { color: 'var(--color-primary-light)' } : undefined}
        />
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={cn(
                "text-sm font-medium transition-colors flex-1",
                isActive ? "text-white" : "text-app-text-muted"
              )}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {item.hasSubmenu && !sidebarCollapsed && (
          <div className="flex items-center gap-1">
            {isAdmin() && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddProject();
                }}
                className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-indigo-400"
                title={language === "ru" ? "Добавить проект" : "Add project"}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setProjectsExpanded(!projectsExpanded);
              }}
              className="p-1 hover:bg-white/10 rounded-md"
            >
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", projectsExpanded && "rotate-180")} />
            </button>
          </div>
        )}
      </Link>
    </div>
  );

  return (
    <div ref={setNodeRef} style={style}>
      {sidebarCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">{linkContent}</div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-800 border-slate-700">{label}</TooltipContent>
        </Tooltip>
      ) : (
        <>
          {linkContent}
          {item.hasSubmenu && !sidebarCollapsed && (
            <AnimatePresence>
              {projectsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-8 mt-1 space-y-1 overflow-hidden"
                >
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href="/tasks"
                      onClick={() => setCurrentProject(project.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm hover:bg-white/5",
                        project.id === currentProjectId ? "bg-indigo-500/10 text-indigo-400" : "text-slate-400"
                      )}
                    >
                      <FolderKanban className="w-4 h-4" />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
}

export function Sidebar() {
  const { 
    language, 
    sidebarCollapsed, 
    toggleSidebar,
    projects,
    currentProjectId,
    setCurrentProject,
    currentUser,
    isAdmin,
    navOrder,
    setNavOrder,
    logout,
  } = useStore();
  const pathname = usePathname();
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const handleAddProject = async () => {
    try {
      await createProject({
        name: language === "ru" ? "Новый проект" : "New Project",
        columns: [
          { id: "todo", name: { ru: "К выполнению", en: "To Do" }, color: "from-slate-500 to-slate-600", order: 0 },
          { id: "inProgress", name: { ru: "В работе", en: "In Progress" }, color: "from-blue-500 to-indigo-500", order: 1 },
          { id: "done", name: { ru: "Готово", en: "Done" }, color: "from-emerald-500 to-green-500", order: 2, isArchiveColumn: true },
        ],
        archiveSettings: { enabled: false, sourceColumnId: "done", archiveDay: 1 },
      });
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const initials = currentUser.name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);

  const filteredNavOrder = useMemo(() => {
    // Ensure all nav items are in navOrder (for new items added after user registered)
    const allNavIds = Object.keys(NAV_ITEMS_CONFIG);
    const currentOrder = [...navOrder];
    
    // Add missing items before settings
    allNavIds.forEach((id) => {
      if (!currentOrder.includes(id)) {
        const settingsIndex = currentOrder.indexOf("settings");
        if (settingsIndex !== -1) {
          currentOrder.splice(settingsIndex, 0, id);
        } else {
          currentOrder.push(id);
        }
      }
    });

    return currentOrder.filter((id) => {
      const item = NAV_ITEMS_CONFIG[id as NavItemId];
      if (!item) return false;
      if (item.adminOnly && !isAdmin()) return false;
      if (item.userOnly && isAdmin()) return false;
      return true;
    }) as NavItemId[];
  }, [navOrder, isAdmin]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = navOrder.indexOf(active.id as string);
      const newIndex = navOrder.indexOf(over.id as string);
      const newOrder = arrayMove(navOrder, oldIndex, newIndex);
      setNavOrder(newOrder);
      // Save to database
      saveNavOrder(currentUser.id, newOrder);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen",
          "glass-sidebar",
          "flex flex-col"
        )}
      >
        {/* Logo + User */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="nmL Flow" className="w-10 h-10 rounded-xl object-contain" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-light tracking-wide bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-500 bg-clip-text text-transparent"
                >
                  nmL Flow
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-lg hover:bg-white/10 p-0.5">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback className="text-white text-xs" style={{ background: 'linear-gradient(to bottom right, var(--gradient-from), var(--gradient-to))' }}>{initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-dropdown text-white min-w-[180px]">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-sm font-medium text-white">{currentUser.name}</p>
                      <p className="text-xs text-slate-400">{currentUser.email}</p>
                    </div>
                    <Link href="/settings"><DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">{t("settings.profile", language)}</DropdownMenuItem></Link>
                    <DropdownMenuItem 
                      onClick={async () => {
                        try {
                          await authAPI.logout(currentUser.email);
                        } catch (e) {}
                        logout();
                      }}
                      className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                    >
                      {language === "ru" ? "Выйти" : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredNavOrder} strategy={verticalListSortingStrategy}>
              {filteredNavOrder.map((id) => (
                <SortableNavItem
                  key={id}
                  id={id}
                  isActive={pathname === NAV_ITEMS_CONFIG[id].href}
                  sidebarCollapsed={sidebarCollapsed}
                  language={language}
                  projectsExpanded={projectsExpanded}
                  setProjectsExpanded={setProjectsExpanded}
                  projects={projects}
                  currentProjectId={currentProjectId}
                  setCurrentProject={setCurrentProject}
                  onAddProject={handleAddProject}
                  isAdmin={isAdmin}
                />
              ))}
            </SortableContext>
          </DndContext>
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="w-full justify-center hover:bg-white/10">
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5 text-app-text-muted" /> : <ChevronLeft className="w-5 h-5 text-app-text-muted" />}
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
