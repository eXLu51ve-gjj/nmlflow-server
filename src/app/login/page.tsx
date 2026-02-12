"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store";
import { authAPI, settingsAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Key,
} from "lucide-react";

type AuthMode = "login" | "register";

interface FormErrors {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  inviteCode?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { language, isAuthenticated, backgroundPreset, customBackgroundUrl, setAuthenticated, setCurrentUser, systemSettings, updateSystemSettings } = useStore();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  // Load system settings from API
  useEffect(() => {
    settingsAPI.get().then((settings) => {
      updateSystemSettings(settings);
    }).catch(() => {});
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!email) {
      newErrors.email = language === "ru" ? "Введите email" : "Enter email";
    } else if (!validateEmail(email)) {
      newErrors.email = language === "ru" ? "Некорректный email" : "Invalid email";
    }
    
    if (!password) {
      newErrors.password = language === "ru" ? "Введите пароль" : "Enter password";
    } else if (password.length < 6) {
      newErrors.password = language === "ru" ? "Минимум 6 символов" : "Minimum 6 characters";
    }
    
    if (mode === "register") {
      if (!name) {
        newErrors.name = language === "ru" ? "Введите имя" : "Enter name";
      }
      if (!surname) {
        newErrors.surname = language === "ru" ? "Введите фамилию" : "Enter surname";
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = language === "ru" ? "Подтвердите пароль" : "Confirm password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = language === "ru" ? "Пароли не совпадают" : "Passwords don't match";
      }
      // Check invite code if required
      if (systemSettings.registrationMode === "invite" && !inviteCode) {
        newErrors.inviteCode = language === "ru" ? "Введите код приглашения" : "Enter invite code";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (mode === "login") {
        const result = await authAPI.login(email, password);
        if (result.success && result.user) {
          setCurrentUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone || "",
            role: result.user.role,
            avatar: result.user.avatar,
            city: result.user.city,
            citizenship: result.user.citizenship,
          });
          setAuthenticated(true);
          setSuccessMessage(language === "ru" ? "Вход выполнен!" : "Login successful!");
          setTimeout(() => router.push("/"), 500);
        }
      } else {
        // Check if registration is allowed
        if (systemSettings.registrationMode === "closed") {
          setErrorMessage(language === "ru" ? "Регистрация закрыта" : "Registration is closed");
          setIsLoading(false);
          return;
        }
        
        const result = await authAPI.register({
          name: `${name} ${surname}`.trim(),
          email,
          phone,
          password,
          inviteCode: systemSettings.registrationMode === "invite" ? inviteCode : undefined,
        });
        
        if (result.success && result.user) {
          setCurrentUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone || "",
            role: result.user.role,
            avatar: result.user.avatar,
          });
          setAuthenticated(true);
          setSuccessMessage(language === "ru" ? "Регистрация успешна!" : "Registration successful!");
          setTimeout(() => router.push("/"), 500);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || (language === "ru" ? "Произошла ошибка" : "An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Get background URL
  const getBackgroundUrl = () => {
    if (customBackgroundUrl) return customBackgroundUrl;
    if (backgroundPreset === "none") return "/backgrounds/bg-1.jpg"; // Default for login
    return `/backgrounds/${backgroundPreset === "bg1" ? "bg-1" : backgroundPreset === "bg2" ? "bg-2" : backgroundPreset === "bg3" ? "bg-3" : backgroundPreset === "bg4" ? "bf-4" : backgroundPreset === "bg5" ? "bg-5" : backgroundPreset === "bg6" ? "bg-6" : backgroundPreset === "bg7" ? "bg-7" : "bg-1"}.jpg`;
  };

  const bgUrl = getBackgroundUrl();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      {bgUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-2">
            <Image src="/logo.png" alt="nmL Flow" width={48} height={48} className="rounded-xl" />
            <span className="text-3xl font-light tracking-wide bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-500 bg-clip-text text-transparent">nmL Flow</span>
          </div>
          <p className="text-slate-400 text-sm">
            {language === "ru" ? "CRM и управление проектами" : "CRM & Project Management"}
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-8 rounded-2xl glass-theme shadow-2xl"
        >
          {/* Maintenance Mode Banner */}
          {systemSettings.maintenanceMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 border border-orange-500/30 relative overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent animate-pulse" />
              
              <div className="relative flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-orange-300">
                    {language === "ru" ? "Режим обслуживания" : "Maintenance Mode"}
                  </h3>
                  <p className="text-xs text-orange-400/80 mt-0.5">
                    {language === "ru" 
                      ? "Система временно недоступна. Вход только для администраторов." 
                      : "System temporarily unavailable. Admin access only."}
                  </p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-500/10 rounded-full blur-xl" />
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex mb-6 p-1 rounded-xl bg-slate-900/50">
            <button
              onClick={() => switchMode("login")}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                mode === "login"
                  ? "btn-theme-gradient text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {language === "ru" ? "Вход" : "Login"}
            </button>
            <button
              onClick={() => switchMode("register")}
              disabled={systemSettings.registrationMode === "closed" || systemSettings.maintenanceMode}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                mode === "register"
                  ? "btn-theme-gradient text-white"
                  : "text-slate-400 hover:text-white",
                (systemSettings.registrationMode === "closed" || systemSettings.maintenanceMode) && "opacity-50 cursor-not-allowed"
              )}
            >
              {language === "ru" ? "Регистрация" : "Register"}
              {(systemSettings.registrationMode === "closed" || systemSettings.maintenanceMode) && " 🔒"}
            </button>
          </div>

          {/* Registration Mode Info */}
          {mode === "register" && systemSettings.registrationMode === "invite" && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-xs text-amber-400">
                {language === "ru" ? "Для регистрации требуется код приглашения" : "Invite code required for registration"}
              </span>
            </div>
          )}

          {/* Messages */}
          <AnimatePresence mode="wait">
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">{successMessage}</span>
              </motion.div>
            )}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Name & Surname */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-300 text-sm">{language === "ru" ? "Имя" : "First Name"}</Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 bg-slate-900/50 text-white"
                          style={{ borderColor: errors.name ? '#ef4444' : 'transparent' }}
                          placeholder={language === "ru" ? "Иван" : "John"}
                        />
                      </div>
                      {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label className="text-slate-300 text-sm">{language === "ru" ? "Фамилия" : "Last Name"}</Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          value={surname}
                          onChange={(e) => setSurname(e.target.value)}
                          className="pl-10 bg-slate-900/50 text-white"
                          style={{ borderColor: errors.surname ? '#ef4444' : 'transparent' }}
                          placeholder={language === "ru" ? "Иванов" : "Doe"}
                        />
                      </div>
                      {errors.surname && <p className="text-xs text-red-400 mt-1">{errors.surname}</p>}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <Label className="text-slate-300 text-sm">{language === "ru" ? "Телефон" : "Phone"}</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 bg-slate-900/50 text-white"
                        style={{ borderColor: 'transparent' }}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Invite Code (if required) - outside animation block */}
            {mode === "register" && systemSettings.registrationMode === "invite" && (
              <div>
                <Label className="text-slate-300 text-sm">{language === "ru" ? "Код приглашения" : "Invite Code"}</Label>
                <div className="relative mt-1.5">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <Input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="pl-10 bg-amber-500/10 text-white font-mono uppercase border border-amber-500/30"
                    style={{ borderColor: errors.inviteCode ? '#ef4444' : 'rgba(245, 158, 11, 0.3)' }}
                    placeholder="XXXXXX"
                    maxLength={6}
                  />
                </div>
                {errors.inviteCode && <p className="text-xs text-red-400 mt-1">{errors.inviteCode}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <Label className="text-slate-300 text-sm">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-900/50 text-white"
                  style={{ borderColor: errors.email ? '#ef4444' : 'transparent' }}
                  placeholder="email@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <Label className="text-slate-300 text-sm">{language === "ru" ? "Пароль" : "Password"}</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-900/50 text-white"
                  style={{ borderColor: errors.password ? '#ef4444' : 'transparent' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password (Register only) */}
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="confirm-password"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Label className="text-slate-300 text-sm">{language === "ru" ? "Подтвердите пароль" : "Confirm Password"}</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-slate-900/50 text-white"
                      style={{ borderColor: errors.confirmPassword ? '#ef4444' : 'transparent' }}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password (Login only) */}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--color-primary-light)' }}
                >
                  {language === "ru" ? "Забыли пароль?" : "Forgot password?"}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-theme-gradient text-white py-2.5"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" 
                    ? (language === "ru" ? "Войти" : "Login")
                    : (language === "ru" ? "Зарегистрироваться" : "Register")
                  }
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Switch Mode Link */}
          <p className="text-center text-sm text-slate-400 mt-6">
            {mode === "login" ? (
              <>
                {language === "ru" ? "Нет аккаунта?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => switchMode("register")}
                  className="font-medium"
                  style={{ color: 'var(--color-primary-light)' }}
                >
                  {language === "ru" ? "Зарегистрироваться" : "Register"}
                </button>
              </>
            ) : (
              <>
                {language === "ru" ? "Уже есть аккаунт?" : "Already have an account?"}{" "}
                <button
                  onClick={() => switchMode("login")}
                  className="font-medium"
                  style={{ color: 'var(--color-primary-light)' }}
                >
                  {language === "ru" ? "Войти" : "Login"}
                </button>
              </>
            )}
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-xs text-slate-500 mt-6"
        >
          © 2025 nmL Flow. {language === "ru" ? "Все права защищены" : "All rights reserved"}.
        </motion.p>
      </motion.div>
    </div>
  );
}
