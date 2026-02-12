"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/store";
import { chatAPI, uploadAPI, usersAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  MessageSquare,
  Send,
  Paperclip,
  X,
  Maximize2,
  Minimize2,
  Smile,
  Trash2,
  Settings,
  Check,
  FileIcon,
  Download,
  ArrowUp,
} from "lucide-react";

// 50 popular emojis
const EMOJIS = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂",
  "😉", "😍", "🥰", "😘", "😋", "😎", "🤩", "🥳", "😏", "😒",
  "😔", "😢", "😭", "😤", "😠", "🤔", "🤫", "🤭", "🤗", "😱",
  "👍", "👎", "👏", "🙌", "🤝", "💪", "✌️", "🤞", "👌", "🙏",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💯", "🔥",
];

interface ChatMessage {
  id: string;
  text: string;
  attachments: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
}

interface ChatUser {
  userId: string;
  name: string;
  email: string;
  avatar: string;
}

export function ChatWidget() {
  const { language, currentUser, isAdmin } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [hasAccess, setHasAccess] = useState(true);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [accessList, setAccessList] = useState<ChatUser[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const result = await chatAPI.getMessages(currentUser.id, 100);
      const newMessages = result.messages || [];
      setMessages(newMessages);
      setHasAccess(result.hasAccess !== false);
      
      // Check for unread messages (only when chat is closed)
      if (!isOpen && newMessages.length > lastSeenCount) {
        setHasUnread(true);
      }
    } catch (error: any) {
      if (error.message?.includes("No access") || error.message?.includes("403")) {
        setHasAccess(false);
        setMessages([]);
      }
      console.error("Chat load error:", error);
    }
  }, [currentUser?.id, isOpen, lastSeenCount]);

  // Load blocked list (admin only) - now shows who is BLOCKED
  const loadAccessList = useCallback(async () => {
    if (!isAdmin()) return;
    try {
      const list = await chatAPI.getAccessList();
      setAccessList(list); // This is now the BLOCKED list
    } catch (error) {
      console.error("Failed to load blocked list:", error);
    }
  }, [isAdmin]);

  // Load all users (admin only)
  const loadAllUsers = useCallback(async () => {
    if (!isAdmin()) return;
    try {
      const users = await usersAPI.getAll();
      setAllUsers(users.filter((u: any) => u.role !== "admin"));
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, [isAdmin]);

  // Initial load
  useEffect(() => {
    if (isOpen && currentUser?.id) {
      loadMessages();
      if (isAdmin()) {
        loadAccessList();
        loadAllUsers();
      }
      // Mark as read when chat is opened
      setHasUnread(false);
      setLastSeenCount(messages.length);
    }
  }, [isOpen, currentUser?.id, loadMessages, loadAccessList, loadAllUsers, isAdmin]);

  // Update lastSeenCount when chat is open and messages change
  useEffect(() => {
    if (isOpen) {
      setLastSeenCount(messages.length);
      setHasUnread(false);
    }
  }, [isOpen, messages.length]);

  // Poll for new messages (also when closed to show notification)
  useEffect(() => {
    if (!currentUser?.id) return;
    
    // Load initially
    loadMessages();
    
    // Poll every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser?.id, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if ((!newMessage.trim() && pendingFiles.length === 0) || !currentUser?.id) return;
    
    try {
      const message = await chatAPI.sendMessage({
        text: newMessage.trim(),
        attachments: pendingFiles,
        authorId: currentUser.id,
      });
      setMessages([...messages, message]);
      setNewMessage("");
      setPendingFiles([]);
      setShowEmojis(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadAPI.uploadFile(file);
        urls.push(result.url);
      }
      setPendingFiles([...pendingFiles, ...urls]);
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Clear chat (admin only)
  const handleClearChat = async () => {
    if (!isAdmin() || !currentUser?.id) return;
    
    try {
      await chatAPI.clearChat(currentUser.id);
      setMessages([]);
      setShowClearConfirm(false);
    } catch (error) {
      console.error("Failed to clear chat:", error);
    }
  };

  // Toggle user access (block/unblock)
  const toggleUserAccess = async (userId: string, isBlocked: boolean) => {
    if (!isAdmin() || !currentUser?.id) return;
    
    console.log("Toggle access:", { userId, isBlocked, adminId: currentUser.id });
    
    try {
      if (isBlocked) {
        // User is blocked, unblock them
        console.log("Unblocking user...");
        await chatAPI.revokeAccess(userId, currentUser.id); // DELETE = unblock
        setAccessList(accessList.filter(a => a.userId !== userId));
      } else {
        // User has access, block them
        console.log("Blocking user...");
        await chatAPI.grantAccess(userId, currentUser.id); // POST = block
        const user = allUsers.find(u => u.id === userId);
        console.log("Found user:", user);
        if (user) {
          setAccessList([...accessList, { userId: user.id, name: user.name, email: user.email, avatar: user.avatar }]);
        }
      }
      console.log("Access toggled successfully");
    } catch (error) {
      console.error("Failed to toggle access:", error);
    }
  };

  // Check if URL is an image
  const isImage = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
  };

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(language === "ru" ? "ru-RU" : "en-US", { hour: "2-digit", minute: "2-digit" });
  };

  // No access message for non-admin users
  const noAccessContent = (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <MessageCircle className="w-12 h-12 text-slate-500 mb-3" />
      <h3 className="text-lg font-medium text-white mb-2">
        {language === "ru" ? "Нет доступа к чату" : "No chat access"}
      </h3>
      <p className="text-sm text-slate-400">
        {language === "ru" 
          ? "Администратор ещё не предоставил вам доступ к общему чату" 
          : "Administrator has not granted you access to the chat yet"}
      </p>
    </div>
  );

  const chatContent = (
    <div className={cn(
      "flex flex-col bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden",
      isExpanded ? "fixed inset-4 z-50" : "w-80 h-[500px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-400" />
          <span className="font-medium text-white">{language === "ru" ? "Чат" : "Chat"}</span>
          <span className="text-xs text-slate-500">({messages.length})</span>
        </div>
        <div className="flex items-center gap-1">
          {isAdmin() && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-slate-400 hover:text-white"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-slate-400 hover:text-red-400"
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-slate-400 hover:text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-slate-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel (Admin) */}
      <AnimatePresence>
        {showSettings && isAdmin() && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 overflow-hidden"
          >
            <div className="p-3 bg-slate-800/30">
              <h4 className="text-xs font-medium text-slate-400 mb-2">
                {language === "ru" ? "Управление доступом" : "Access Control"}
              </h4>
              <p className="text-[10px] text-slate-500 mb-2">
                {language === "ru" ? "✓ = доступ разрешён, ✕ = заблокирован" : "✓ = access allowed, ✕ = blocked"}
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {allUsers.map((user) => {
                  const isBlocked = accessList.some(a => a.userId === user.id);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-[10px]">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className={cn("text-sm", isBlocked ? "text-slate-500 line-through" : "text-white")}>{user.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-6 px-2",
                          isBlocked ? "text-red-400" : "text-emerald-400"
                        )}
                        onClick={() => toggleUserAccess(user.id, isBlocked)}
                        title={isBlocked ? (language === "ru" ? "Разблокировать" : "Unblock") : (language === "ru" ? "Заблокировать" : "Block")}
                      >
                        {isBlocked ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {!hasAccess && !isAdmin() ? (
          noAccessContent
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            {language === "ru" ? "Нет сообщений" : "No messages"}
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.authorId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={cn("flex gap-2", isOwn && "flex-row-reverse")}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={msg.authorAvatar} />
                  <AvatarFallback className="text-xs bg-slate-700">
                    {msg.authorName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("max-w-[70%]", isOwn && "text-right")}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">{msg.authorName}</span>
                    <span className="text-[10px] text-slate-500">{formatTime(msg.createdAt)}</span>
                  </div>
                  {msg.text && (
                    <div className={cn(
                      "px-3 py-2 rounded-2xl text-sm",
                      isOwn 
                        ? "bg-indigo-500/30 text-white rounded-tr-sm" 
                        : "bg-slate-800/50 text-white rounded-tl-sm"
                    )}>
                      {msg.text}
                    </div>
                  )}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {msg.attachments.map((url, i) => (
                        <div key={i}>
                          {isImage(url) ? (
                            <img
                              src={url}
                              alt=""
                              className="max-w-full max-h-40 rounded-lg cursor-pointer hover:opacity-80"
                              onClick={() => window.open(url, "_blank")}
                            />
                          ) : (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-sm text-white"
                            >
                              <FileIcon className="w-4 h-4 text-slate-400" />
                              <span className="truncate">{url.split("/").pop()}</span>
                              <Download className="w-4 h-4 text-slate-400" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pending Files - only show if has access */}
      {(hasAccess || isAdmin()) && pendingFiles.length > 0 && (
        <div className="px-3 py-2 border-t border-white/10 bg-slate-800/30">
          <div className="flex flex-wrap gap-2">
            {pendingFiles.map((url, i) => (
              <div key={i} className="relative group">
                {isImage(url) ? (
                  <img src={url} alt="" className="w-12 h-12 rounded object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded bg-slate-700 flex items-center justify-center">
                    <FileIcon className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <button
                  onClick={() => setPendingFiles(pendingFiles.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Picker - only show if has access */}
      <AnimatePresence>
        {showEmojis && (hasAccess || isAdmin()) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 overflow-hidden"
          >
            <div className="p-2 bg-slate-800/30 grid grid-cols-10 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewMessage(newMessage + emoji)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input - only show if has access */}
      {(hasAccess || isAdmin()) && (
        <div className="p-3 border-t border-white/10 bg-slate-800/30">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-slate-400 hover:text-white"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("w-8 h-8", showEmojis ? "text-indigo-400" : "text-slate-400 hover:text-white")}
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={language === "ru" ? "Сообщение..." : "Message..."}
              className="flex-1 bg-slate-900/50 border-white/10 text-white h-9"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-slate-400 hover:text-white"
              onClick={handleSend}
              disabled={!newMessage.trim() && pendingFiles.length === 0}
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Chat Toggle Button - Glassmorphism style */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl border border-white/20 shadow-xl hover:border-white/30 transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)",
              boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-white" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-sm font-medium text-white">
              {language === "ru" ? "Чат" : "Chat"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50"
                onClick={() => setIsExpanded(false)}
              />
            )}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={cn(
                "z-50",
                isExpanded ? "fixed inset-4" : "fixed bottom-6 right-6"
              )}
            >
              {chatContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clear Chat Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-500/20">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {language === "ru" ? "Очистить чат?" : "Clear chat?"}
                </h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                {language === "ru" 
                  ? "Все сообщения будут удалены. Это действие нельзя отменить." 
                  : "All messages will be deleted. This action cannot be undone."}
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  className="flex-1 text-slate-400 hover:text-white hover:bg-white/10" 
                  onClick={() => setShowClearConfirm(false)}
                >
                  {language === "ru" ? "Отмена" : "Cancel"}
                </Button>
                <Button
                  className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                  onClick={handleClearChat}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {language === "ru" ? "Очистить" : "Clear"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
