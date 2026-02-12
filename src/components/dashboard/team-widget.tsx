"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, TeamMember } from "@/store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Modal, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";

export function TeamWidget() {
  const { language, teamMembers, isAdmin } = useStore();
  const onlineMembers = teamMembers.filter((m) => m.isOnline);
  const offlineMembers = teamMembers.filter((m) => !m.isOnline);
  const [viewMember, setViewMember] = useState<TeamMember | null>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "glass-theme",
          "p-4"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-white">
            {t("team.title", language)}
          </h3>
          {isAdmin() && (
            <Link
              href="/admin"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {language === "ru" ? "Управление" : "Manage"} →
            </Link>
          )}
        </div>

        {/* Team List - Compact */}
        <div className="space-y-1.5">
          {/* Online members first */}
          {onlineMembers.slice(0, 4).map((member) => (
            <div
              key={member.id}
              onClick={() => setViewMember(member)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="relative">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{member.name}</p>
              </div>
              <span className="text-[10px] text-emerald-400">●</span>
            </div>
          ))}
          
          {/* Offline members */}
          {offlineMembers.slice(0, Math.max(0, 4 - onlineMembers.length)).map((member) => (
            <div
              key={member.id}
              onClick={() => setViewMember(member)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors opacity-60"
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-400 truncate">{member.name}</p>
              </div>
              <span className="text-[10px] text-slate-500">●</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
          <span>{teamMembers.length} {language === "ru" ? "участников" : "members"}</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {onlineMembers.length} {language === "ru" ? "онлайн" : "online"}
          </span>
        </div>
      </motion.div>

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
    </>
  );
}
