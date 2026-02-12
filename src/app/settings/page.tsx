"use client";

import { useState, useRef, useEffect } from "react";
import { useStore, backgroundPresets, colorSchemes } from "@/store";
import { t, Language } from "@/lib/i18n";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Palette,
  Globe,
  Moon,
  Sun,
  Save,
  Image,
  Check,
  Upload,
  X,
  Shield,
  UserCog,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Key,
  LogOut,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { usersAPI, authAPI } from "@/lib/api";

// Готовые аватары - локальные файлы
const avatarPresets = [
  "/avatars/1.jpg",
  "/avatars/2.jpg", 
  "/avatars/3.jpg",
  "/avatars/4.jpg",
  "/avatars/5.jpg",
  "/avatars/6.jpg",
  "/avatars/7.jpg",
  "/avatars/8.jpg",
  "/avatars/9.jpg",
  "/avatars/10.jpg",
  "/avatars/11.jpg",
  "/avatars/12.jpg",
  "/avatars/13.jpg",
  "/avatars/14.jpg",
  "/avatars/15.jpg",
  "/avatars/16.jpg",
  "/avatars/17.jpg",
  "/avatars/18.jpg",
  "/avatars/19.jpg",
  "/avatars/20.jpg",
];

export default function SettingsPage() {
  const {
    language, 
    setLanguage, 
    backgroundPreset, 
    customBackgroundUrl,
    backgroundDarkness,
    glassOpacity,
    colorScheme,
    setBackgroundPreset,
    setCustomBackgroundUrl,
    setBackgroundDarkness,
    setGlassOpacity,
    setColorScheme,
    currentUser,
    setUserRole,
    updateUserProfile,
    logout,
  } = useStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [customUrl, setCustomUrl] = useState(customBackgroundUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Profile state
  const [firstName, setFirstName] = useState(currentUser.name.split(" ")[0] || "");
  const [lastName, setLastName] = useState(currentUser.name.split(" ")[1] || "");
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [city, setCity] = useState(currentUser.city || "");
  const [citizenship, setCitizenship] = useState(currentUser.citizenship || "");
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const isDark = theme === "dark";

  // Track changes
  useEffect(() => {
    const nameChanged = `${firstName} ${lastName}`.trim() !== currentUser.name;
    const emailChanged = email !== currentUser.email;
    const phoneChanged = phone !== (currentUser.phone || "");
    const cityChanged = city !== (currentUser.city || "");
    const citizenshipChanged = citizenship !== (currentUser.citizenship || "");
    const avatarChanged = selectedAvatar !== currentUser.avatar;
    setHasChanges(nameChanged || emailChanged || phoneChanged || cityChanged || citizenshipChanged || avatarChanged);
  }, [firstName, lastName, email, phone, city, citizenship, selectedAvatar, currentUser]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Save to database
      await usersAPI.updateProfile(currentUser.id, {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        city,
        citizenship,
        avatar: selectedAvatar,
      });
      
      // Update local store
      updateUserProfile({
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        city,
        citizenship,
        avatar: selectedAvatar,
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    setPasswordError("");
    setPasswordSuccess(false);
    
    if (!currentPassword) {
      setPasswordError(language === "ru" ? "Введите текущий пароль" : "Enter current password");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(language === "ru" ? "Новый пароль должен быть минимум 6 символов" : "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(language === "ru" ? "Пароли не совпадают" : "Passwords don't match");
      return;
    }
    
    // Mock password change (в реальном приложении здесь будет API запрос)
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setCustomBackgroundUrl(customUrl.trim());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCustomBackgroundUrl(dataUrl);
        setCustomUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearBackground = () => {
    setBackgroundPreset("none");
    setCustomUrl("");
  };

  // iOS-style toggle component (Apple design with | and O symbols)
  const IOSToggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-[51px] h-[31px] rounded-full transition-all duration-200 ease-in-out",
        "border-2",
        checked 
          ? "bg-gradient-to-b from-green-400 to-green-500 border-green-600/50" 
          : "bg-slate-500/80 border-slate-400/50"
      )}
      style={{
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1)"
      }}
    >
      {/* | symbol (ON) - left side - thin line */}
      <div className={cn(
        "absolute left-[10px] top-1/2 -translate-y-1/2 w-[2px] h-[11px] rounded-full bg-white transition-opacity duration-200",
        checked ? "opacity-100" : "opacity-0"
      )} />
      {/* O symbol (OFF) - right side - white circle outline */}
      <div className={cn(
        "absolute right-[9px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 border-white/90 transition-opacity duration-200",
        !checked ? "opacity-100" : "opacity-0"
      )} />
      {/* Knob */}
      <motion.div
        initial={false}
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-[1px] left-[1px] w-[25px] h-[25px] rounded-full bg-white border border-slate-200/50"
        style={{
          boxShadow: "0 2px 6px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.15)"
        }}
      />
    </button>
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-1">
          {t("settings.title", language)}
        </h1>
        <p className="text-slate-400 text-sm">
          {language === "ru" ? "Управление настройками приложения" : "Manage application settings"}
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 pt-6 rounded-2xl glass-theme relative mt-16"
        >
          {/* Avatar - выпирает наполовину вверх, справа */}
          <div className="absolute -top-14 right-8 flex flex-col items-center z-10">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-slate-950/80 scale-110" />
              <Avatar className="relative w-28 h-28 border border-white/20 shadow-2xl cursor-pointer" onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
                <AvatarImage src={selectedAvatar} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-1 -right-1 p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                style={{ background: 'var(--color-primary)' }}
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            
            {/* Avatar Picker - открывается влево */}
            {showAvatarPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="absolute top-0 right-36 p-4 rounded-xl glass-dropdown w-72 z-20"
              >
                {/* Close button */}
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-slate-400 mb-3">
                  {language === "ru" ? "Выберите аватар" : "Choose avatar"}
                </p>
                <div className="max-h-48 overflow-y-auto pr-1 mb-3">
                  <div className="grid grid-cols-5 gap-2">
                    {avatarPresets.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedAvatar(url);
                        }}
                        className={cn(
                          "w-10 h-10 rounded-full overflow-hidden border-2 transition-all",
                          selectedAvatar === url ? "border-indigo-500 scale-110" : "border-transparent hover:border-white/30"
                        )}
                      >
                        <img 
                          src={url} 
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-full border-white/10 hover:bg-white/5 text-slate-300 text-xs"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  {language === "ru" ? "Загрузить своё" : "Upload custom"}
                </Button>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <User className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {t("settings.profile", language)}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">
                    {language === "ru" ? "Имя" : "First name"}
                  </Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5 bg-slate-800/50 text-white"
                    style={{ borderColor: 'transparent' }}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">
                    {language === "ru" ? "Фамилия" : "Last name"}
                  </Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 bg-slate-800/50 text-white"
                    style={{ borderColor: 'transparent' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 bg-slate-800/50 text-white"
                    style={{ borderColor: 'transparent' }}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">
                    {language === "ru" ? "Телефон" : "Phone"}
                  </Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    className="mt-1.5 bg-slate-800/50 text-white"
                    style={{ borderColor: 'transparent' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">
                    {language === "ru" ? "Город" : "City"}
                  </Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={language === "ru" ? "Москва" : "Moscow"}
                    className="mt-1.5 bg-slate-800/50 text-white"
                    style={{ borderColor: 'transparent' }}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">
                    {language === "ru" ? "Гражданство" : "Citizenship"}
                  </Label>
                  <Input
                    value={citizenship}
                    onChange={(e) => setCitizenship(e.target.value)}
                    placeholder={language === "ru" ? "Россия" : "Russia"}
                    className="mt-1.5 bg-slate-800/50 text-white"
                    style={{ borderColor: 'transparent' }}
                  />
                </div>
              </div>
              
              {/* Save Profile Button */}
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {language === "ru" ? "Сохранить профиль" : "Save profile"}
                  </Button>
                </motion.div>
              )}
              
              {/* Logout Button */}
              <div className="pt-4 border-t border-white/10 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {language === "ru" ? "Выйти из аккаунта" : "Logout"}
                </Button>
              </div>
            </div>
          </div>

          {/* Password Section - внутри карточки профиля */}
          <Separator className="bg-white/10 my-6" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-rose-500/20">
              <Key className="w-5 h-5 text-rose-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {language === "ru" ? "Смена пароля" : "Change Password"}
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">
                {language === "ru" ? "Текущий пароль" : "Current password"}
              </Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-800/50 text-white"
                  style={{ borderColor: 'transparent' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">
                  {language === "ru" ? "Новый пароль" : "New password"}
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 bg-slate-800/50 text-white"
                    style={{ borderColor: 'transparent' }}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">
                  {language === "ru" ? "Подтвердите пароль" : "Confirm password"}
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-slate-800/50 text-white"
                    style={{ borderColor: 'transparent' }}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
            
            {passwordError && (
              <p className="text-sm text-red-400">{passwordError}</p>
            )}
            
            {passwordSuccess && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-emerald-400 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {language === "ru" ? "Пароль успешно изменён" : "Password changed successfully"}
              </motion.p>
            )}
            
            <Button
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50"
            >
              <Key className="w-4 h-4 mr-2" />
              {language === "ru" ? "Сменить пароль" : "Change password"}
            </Button>
          </div>
        </motion.div>

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLogoutConfirm(false)}
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
                    <LogOut className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {language === "ru" ? "Выйти из аккаунта?" : "Logout?"}
                  </h3>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  {language === "ru" 
                    ? "Вы уверены, что хотите выйти из аккаунта?" 
                    : "Are you sure you want to logout?"}
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    className="flex-1 text-slate-400 hover:text-white" 
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    {language === "ru" ? "Отмена" : "Cancel"}
                  </Button>
                  <Button
                    className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    onClick={async () => {
                      try {
                        await authAPI.logout(currentUser.email);
                      } catch (e) {}
                      logout();
                      router.push("/login");
                    }}
                  >
                    {language === "ru" ? "Выйти" : "Logout"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 rounded-2xl glass-theme"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Image className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {t("settings.background", language)}
            </h2>
          </div>

          {/* Presets */}
          <div className="mb-6">
            <Label className="text-slate-300 mb-3 block">
              {t("settings.backgroundPresets", language)}
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {backgroundPresets.map((preset) => {
                const isSelected = backgroundPreset === preset.id && !customBackgroundUrl;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setBackgroundPreset(preset.id)}
                    className={cn(
                      "relative aspect-video rounded-xl overflow-hidden border-2 transition-all",
                      "hover:scale-105 hover:border-indigo-500/50",
                      isSelected ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-white/10"
                    )}
                  >
                    {preset.thumbnail ? (
                      <img
                        src={preset.thumbnail}
                        alt={preset.name[language]}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-950" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                      <span className="text-xs text-white font-medium">
                        {preset.name[language]}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom URL */}
          <div className="space-y-4">
            <Label className="text-slate-300 block">
              {t("settings.customUrl", language)}
            </Label>
            
            {/* File Upload */}
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-white/10 hover:bg-white/5 text-slate-300"
              >
                <Upload className="w-4 h-4 mr-2" />
                {language === "ru" ? "Загрузить файл" : "Upload file"}
              </Button>
              {customBackgroundUrl && (
                <Button
                  variant="outline"
                  onClick={handleClearBackground}
                  className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                >
                  <X className="w-4 h-4 mr-2" />
                  {language === "ru" ? "Сбросить" : "Clear"}
                </Button>
              )}
            </div>

            {/* URL Input */}
            <div className="flex gap-3">
              <Input
                value={customUrl.startsWith("data:") ? "" : customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder={t("settings.customUrlPlaceholder", language)}
                className="flex-1 bg-slate-800/50 text-white"
                style={{ borderColor: 'transparent' }}
              />
              <Button
                onClick={handleApplyCustomUrl}
                disabled={!customUrl.trim() || customUrl.startsWith("data:")}
                className="btn-theme-gradient disabled:opacity-50"
              >
                {language === "ru" ? "Применить" : "Apply"}
              </Button>
            </div>

            {customBackgroundUrl && (
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <Check className="w-3 h-3" />
                {customBackgroundUrl.startsWith("data:") 
                  ? (language === "ru" ? "Загружен локальный файл" : "Local file uploaded")
                  : (language === "ru" ? "Используется свой фон" : "Custom background active")
                }
              </div>
            )}
          </div>

          {/* Darkness Slider */}
          <div className="space-y-4 pt-6 mt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">
                {language === "ru" ? "Затемнение фона" : "Background darkness"}
              </Label>
              <span className="text-sm text-indigo-400 font-medium">{backgroundDarkness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={backgroundDarkness}
              onChange={(e) => setBackgroundDarkness(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${backgroundDarkness / 0.9}%, #334155 ${backgroundDarkness / 0.9}%, #334155 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{language === "ru" ? "Светлее" : "Lighter"}</span>
              <span>{language === "ru" ? "Темнее" : "Darker"}</span>
            </div>
          </div>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-6 rounded-2xl glass-theme"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Palette className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {t("settings.appearance", language)}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Color Scheme Picker */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-theme-light" style={{ color: 'var(--color-primary-light)' }} />
                <div>
                  <p className="text-white font-medium">{language === "ru" ? "Цветовая схема" : "Color scheme"}</p>
                  <p className="text-sm text-slate-400">
                    {language === "ru" ? "Выберите акцентный цвет" : "Choose accent color"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => setColorScheme(scheme.id)}
                    className={cn(
                      "relative w-11 h-11 rounded-2xl transition-all duration-200",
                      colorScheme === scheme.id 
                        ? "ring-2 ring-white/80 ring-offset-2 ring-offset-slate-900 scale-110" 
                        : "hover:scale-105 hover:ring-1 hover:ring-white/30"
                    )}
                    style={{
                      background: scheme.colors.primary,
                      boxShadow: colorScheme === scheme.id 
                        ? `0 0 20px ${scheme.colors.primary}50` 
                        : 'none'
                    }}
                    title={scheme.name[language]}
                  >
                    {colorScheme === scheme.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Glass Opacity Slider */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-white/20 backdrop-blur" />
                  <div>
                    <p className="text-white font-medium">{language === "ru" ? "Прозрачность стекла" : "Glass opacity"}</p>
                    <p className="text-sm text-slate-400">
                      {language === "ru" ? "Уровень прозрачности панелей" : "Panel transparency level"}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-primary-light)' }}>{glassOpacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={glassOpacity}
                onChange={(e) => setGlassOpacity(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(glassOpacity - 10) / 0.7}%, #334155 ${(glassOpacity - 10) / 0.7}%, #334155 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>{language === "ru" ? "Прозрачнее" : "More transparent"}</span>
                <span>{language === "ru" ? "Плотнее" : "More solid"}</span>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Light Borders Toggle - iOS Style */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5" style={{ color: 'var(--color-primary-light)' }} />
                )}
                <div>
                  <p className="text-white font-medium">{language === "ru" ? "Светлые контуры" : "Light borders"}</p>
                  <p className="text-sm text-slate-400">
                    {isDark 
                      ? (language === "ru" ? "Контуры включены" : "Borders enabled") 
                      : (language === "ru" ? "Контуры выключены" : "Borders disabled")}
                  </p>
                </div>
              </div>
              <IOSToggle
                checked={isDark}
                onChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

            <Separator className="bg-white/10" />

            {/* Language Select */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-white font-medium">{t("settings.language", language)}</p>
                  <p className="text-sm text-slate-400">
                    {language === "ru" ? "Выберите язык интерфейса" : "Select interface language"}
                  </p>
                </div>
              </div>
              <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger className="w-40 bg-slate-800/50 text-white" style={{ borderColor: 'transparent' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-dropdown text-white">
                  <SelectItem value="ru" className="text-white hover:bg-white/10">🇷🇺 Русский</SelectItem>
                  <SelectItem value="en" className="text-white hover:bg-white/10">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
