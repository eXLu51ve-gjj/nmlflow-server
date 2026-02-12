"use client";

import { useState, useEffect, useRef } from "react";
import { useStore, Lead } from "@/store";
import { useApiActions } from "@/hooks/use-api-actions";
import { t } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Phone, Mail, Building2, DollarSign, Clock, User, Trash2, MapPin, ImageIcon, X, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";

const columns: { id: Lead["status"]; labelKey: string; color: string }[] = [
  { id: "leads", labelKey: "crm.leads", color: "from-blue-500 to-cyan-500" },
  { id: "negotiation", labelKey: "crm.negotiation", color: "from-amber-500 to-orange-500" },
  { id: "proposal", labelKey: "crm.proposal", color: "from-violet-500 to-purple-500" },
  { id: "closed", labelKey: "crm.closed", color: "from-emerald-500 to-green-500" },
];

// Lead Card Component
function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { teamMembers } = useStore();
  const assignee = lead.assigneeId ? teamMembers.find(m => m.id === lead.assigneeId) : null;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onClick}
      className={cn(
        "rounded-xl cursor-grab active:cursor-grabbing overflow-hidden",
        "glass-theme",
        "hover:bg-slate-800/60 hover:border-white/20 transition-all",
        isDragging && "shadow-xl shadow-indigo-500/20"
      )}
    >
      {/* Cover Image */}
      {lead.coverImage && (
        <div className="h-20 w-full">
          <img src={lead.coverImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={lead.avatar} />
            <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{lead.name}</h4>
            <p className="text-xs text-slate-400 truncate">{lead.company}</p>
          </div>
        </div>
        {lead.address && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{lead.address}</span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <Badge variant="secondary" className="bg-white/10 text-emerald-400">
            {new Intl.NumberFormat("ru-RU").format(lead.value)} ₽
          </Badge>
          {assignee && (
            <div className="flex items-center gap-1.5">
              <Avatar className="w-5 h-5">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className="text-[8px]">{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-[10px] text-slate-400 truncate max-w-[60px]">{assignee.name.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Column Component
function Column({
  column,
  leads,
  onLeadClick,
}: {
  column: (typeof columns)[0];
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}) {
  const { language } = useStore();
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex-1 min-w-[280px]">
      {/* Column Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("w-3 h-3 rounded-full bg-gradient-to-r", column.color)} />
        <h3 className="text-sm font-semibold text-white">
          {t(column.labelKey as any, language)}
        </h3>
        <Badge variant="secondary" className="bg-white/10 text-slate-400">
          {leads.length}
        </Badge>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={cn(
          "p-3 rounded-2xl min-h-[500px] transition-colors",
          "glass-theme",
          isOver && "bg-indigo-500/10 border-2 border-dashed border-indigo-500/30"
        )}
      >
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            <AnimatePresence>
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

// Lead Detail Modal
function LeadDetailModal({
  lead,
  open,
  onClose,
  onDelete,
}: {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const { language, teamMembers, currentUser } = useStore();
  const assignee = lead?.assigneeId ? teamMembers.find(m => m.id === lead.assigneeId) : null;
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  // Load comments when lead changes
  useEffect(() => {
    if (lead && open) {
      setLoadingComments(true);
      import("@/lib/api-actions").then(({ loadLeadComments }) => {
        loadLeadComments(lead.id).then((data) => {
          setComments(data);
          setLoadingComments(false);
        });
      });
    }
  }, [lead?.id, open]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !lead) return;
    setSendingComment(true);
    try {
      const { addLeadComment } = await import("@/lib/api-actions");
      const comment = await addLeadComment(lead.id, newComment.trim(), currentUser.id);
      setComments([...comments, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
    setSendingComment(false);
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("crm.clientDetails", language)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cover Image */}
          {lead.coverImage && (
            <div className="rounded-xl overflow-hidden -mx-6 -mt-2">
              <img src={lead.coverImage} alt="" className="w-full h-40 object-cover" />
            </div>
          )}

          {/* Client Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={lead.avatar} />
              <AvatarFallback className="text-xl">{lead.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white">{lead.name}</h3>
              <p className="text-slate-400">{lead.company}</p>
            </div>
            <button
              onClick={() => onDelete(lead.id)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title={language === "ru" ? "Удалить" : "Delete"}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-white/10">
              <Mail className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs text-slate-400">{t("crm.contact", language)}</p>
                <p className="text-sm text-white">{lead.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-white/10">
              <Phone className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">{language === "ru" ? "Телефон" : "Phone"}</p>
                <p className="text-sm text-white">{lead.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-white/10">
              <Building2 className="w-5 h-5 text-violet-400" />
              <div>
                <p className="text-xs text-slate-400">{t("crm.company", language)}</p>
                <p className="text-sm text-white">{lead.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-white/10">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs text-slate-400">{t("crm.value", language)}</p>
                <p className="text-sm text-white">
                  {new Intl.NumberFormat("ru-RU").format(lead.value)} ₽
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          {lead.address && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-white/10">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-slate-400">{language === "ru" ? "Адрес" : "Address"}</p>
                <p className="text-sm text-white">{lead.address}</p>
              </div>
            </div>
          )}

          {/* Assignee */}
          {assignee && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-white/10">
              <Avatar className="w-10 h-10">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-slate-400">{language === "ru" ? "Исполнитель" : "Assignee"}</p>
                <p className="text-sm text-white">{assignee.name}</p>
                <p className="text-xs text-slate-500">{assignee.role}</p>
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {language === "ru" ? "Комментарии" : "Comments"}
              {comments.length > 0 && <span className="text-xs text-slate-500">({comments.length})</span>}
            </h4>
            
            {/* Comment Input */}
            <div className="flex gap-2 mb-3">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={language === "ru" ? "Написать комментарий..." : "Write a comment..."}
                className="flex-1 bg-slate-800/50 border-white/10"
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
              />
              <Button 
                onClick={handleAddComment} 
                disabled={!newComment.trim() || sendingComment}
                size="sm"
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                {sendingComment ? "..." : language === "ru" ? "Отправить" : "Send"}
              </Button>
            </div>

            {/* Comments List */}
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {loadingComments ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    {language === "ru" ? "Загрузка..." : "Loading..."}
                  </p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    {language === "ru" ? "Нет комментариев" : "No comments"}
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/50 border border-white/5"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={comment.authorAvatar} />
                        <AvatarFallback className="text-[10px]">{comment.authorName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white">{comment.authorName}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(comment.createdAt).toLocaleString("ru-RU", { 
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" 
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* History */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("crm.history", language)}
            </h4>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {lead.history.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-white/5"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <div className="flex-1">
                      <p className="text-sm text-white">{item.action}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.date).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CRMPage() {
  const { language, leads, teamMembers } = useStore();
  
  // API actions for database operations
  const api = useApiActions();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  // New lead form state
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    value: "",
    coverImage: "",
    assigneeId: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = columns.find((col) => col.id === overId);
    if (targetColumn) {
      api.moveLead(leadId, targetColumn.id);
      return;
    }

    // Check if dropped on another lead
    const targetLead = leads.find((l) => l.id === overId);
    if (targetLead) {
      api.moveLead(leadId, targetLead.status);
    }
  };

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const handleAddLead = () => {
    if (!newLead.name || !newLead.email) return;
    
    api.createLead({
      name: newLead.name,
      company: newLead.company || "—",
      email: newLead.email,
      phone: newLead.phone || "—",
      address: newLead.address || undefined,
      coverImage: newLead.coverImage || undefined,
      assigneeId: newLead.assigneeId || undefined,
      value: parseInt(newLead.value) || 0,
      status: "leads",
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${newLead.name.replace(/\s+/g, "")}`,
    });
    
    setNewLead({ name: "", company: "", email: "", phone: "", address: "", value: "", coverImage: "", assigneeId: "" });
    setShowAddLead(false);
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewLead(prev => ({ ...prev, coverImage: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleDeleteLead = (id: string) => {
    api.deleteLead(id);
    setConfirmDelete(null);
    setSelectedLead(null);
  };

  if (!mounted) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{t("crm.title", language)}</h1>
            <p className="text-slate-400 mt-1">
              {language === "ru" ? "Загрузка..." : "Loading..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">{t("crm.title", language)}</h1>
          <p className="text-slate-400 mt-1">
            {language === "ru"
              ? "Управляйте лидами и сделками"
              : "Manage your leads and deals"}
          </p>
        </div>
        <Button 
          onClick={() => setShowAddLead(true)}
          className="btn-theme-gradient"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("crm.addLead", language)}
        </Button>
      </motion.div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex gap-6 overflow-x-auto pb-4"
        >
          {columns.map((column, index) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
            >
              <Column
                column={column}
                leads={leads.filter((l) => l.status === column.id)}
                onLeadClick={setSelectedLead}
              />
            </motion.div>
          ))}
        </motion.div>

        <DragOverlay>
          {activeLead && (
            <div className="p-4 rounded-xl bg-slate-800/90 backdrop-blur-sm border border-indigo-500/50 shadow-xl shadow-indigo-500/20">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activeLead.avatar} />
                  <AvatarFallback>{activeLead.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-medium text-white">{activeLead.name}</h4>
                  <p className="text-xs text-slate-400">{activeLead.company}</p>
                </div>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead && !confirmDelete}
        onClose={() => setSelectedLead(null)}
        onDelete={(id) => {
          setSelectedLead(null);
          setTimeout(() => setConfirmDelete(id), 100);
        }}
      />

      {/* Add Lead Modal */}
      <Modal open={showAddLead} onClose={() => setShowAddLead(false)}>
        <ModalHeader onClose={() => setShowAddLead(false)}>
          <ModalTitle>{language === "ru" ? "Добавить лид" : "Add Lead"}</ModalTitle>
        </ModalHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Cover Image */}
          <div>
            <Label className="text-slate-300 text-sm mb-2 block">
              {language === "ru" ? "Обложка" : "Cover Image"}
            </Label>
            {newLead.coverImage ? (
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={newLead.coverImage} 
                  alt="Cover" 
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => setNewLead(prev => ({ ...prev, coverImage: "" }))}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => coverInputRef.current?.click()}
                className="w-full h-24 rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-500/50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs">{language === "ru" ? "Загрузить изображение" : "Upload image"}</span>
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
              className="hidden"
            />
          </div>

          <div>
            <Label className="text-slate-300 text-sm mb-2 block">
              {language === "ru" ? "Имя клиента" : "Client Name"} *
            </Label>
            <Input
              value={newLead.name}
              onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
              placeholder={language === "ru" ? "Иван Иванов" : "John Doe"}
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm mb-2 block">
              {language === "ru" ? "Компания" : "Company"}
            </Label>
            <Input
              value={newLead.company}
              onChange={(e) => setNewLead(prev => ({ ...prev, company: e.target.value }))}
              placeholder={language === "ru" ? "ООО Компания" : "Company Inc."}
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm mb-2 block">Email *</Label>
            <Input
              type="email"
              value={newLead.email}
              onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com"
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm mb-2 block">
              {language === "ru" ? "Телефон" : "Phone"}
            </Label>
            <Input
              value={newLead.phone}
              onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+7 (999) 123-45-67"
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm mb-2 block">
              {language === "ru" ? "Адрес" : "Address"}
            </Label>
            <Input
              value={newLead.address}
              onChange={(e) => setNewLead(prev => ({ ...prev, address: e.target.value }))}
              placeholder={language === "ru" ? "г. Москва, ул. Примерная, д. 1" : "123 Main St, City"}
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm mb-2 block">
              {language === "ru" ? "Сумма сделки (₽)" : "Deal Value (₽)"}
            </Label>
            <Input
              type="number"
              value={newLead.value}
              onChange={(e) => setNewLead(prev => ({ ...prev, value: e.target.value }))}
              placeholder="100000"
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-slate-300 text-sm mb-2 block">
              {language === "ru" ? "Исполнитель" : "Assignee"}
            </Label>
            <select
              value={newLead.assigneeId}
              onChange={(e) => setNewLead(prev => ({ ...prev, assigneeId: e.target.value }))}
              className="w-full h-10 px-3 rounded-md bg-slate-800/50 border border-white/10 text-white text-sm"
            >
              <option value="">{language === "ru" ? "Не назначен" : "Not assigned"}</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowAddLead(false)}
              className="flex-1 text-slate-400 hover:text-white hover:bg-white/10"
            >
              {language === "ru" ? "Отмена" : "Cancel"}
            </Button>
            <Button
              onClick={handleAddLead}
              disabled={!newLead.name || !newLead.email}
              className="flex-1 btn-theme-gradient disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === "ru" ? "Добавить" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <ModalHeader onClose={() => setConfirmDelete(null)}>
          <ModalTitle>{language === "ru" ? "Удалить лид?" : "Delete lead?"}</ModalTitle>
        </ModalHeader>
        <div className="space-y-4">
          <p className="text-slate-400">
            {language === "ru" 
              ? "Это действие нельзя отменить. Лид будет удалён навсегда." 
              : "This action cannot be undone. The lead will be permanently deleted."}
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(null)}
              className="flex-1 text-slate-400 hover:text-white hover:bg-white/10"
            >
              {language === "ru" ? "Отмена" : "Cancel"}
            </Button>
            <Button
              onClick={() => confirmDelete && handleDeleteLead(confirmDelete)}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {language === "ru" ? "Удалить" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
