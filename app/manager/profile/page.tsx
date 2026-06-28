"use client"

import React from "react"
import { motion } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useTheme } from "next-themes"
import { useLanguage } from "@/providers/LanguageProvider"
import { UserCircle, Sun, Moon, Globe, CreditCard, Bell, Shield } from "@phosphor-icons/react"

export default function ProfilePage() {
  const { activeSession } = useMockData()
  const { theme, setTheme } = useTheme()
  const { t, language, setLanguage } = useLanguage()

  const userInfo = {
    name: activeSession?.user_id === "usr_dvd_99" ? "David Vance" : "Operator User",
    email: activeSession?.user_id === "usr_dvd_99" ? "david@alpha-feed.com" : "operator@beta-mills.com",
    role: activeSession?.role || "Manager",
    org: activeSession?.org_id || "org_alpha_feed",
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6 }}
      >
        <h1 className="text-4xl font-display text-foreground font-bold tracking-tight mb-2">{t("profile_title")}</h1>
        <p className="text-muted-foreground text-lg">{t("profile_manager_desc")}</p>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.05 }}
        className="bg-card border border-border/50 rounded-2xl p-8 flex items-center gap-6"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <UserCircle weight="duotone" className="w-12 h-12 text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-display font-bold text-foreground">{userInfo.name}</h2>
          <p className="text-muted-foreground text-sm">{userInfo.email}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary uppercase tracking-wider">{userInfo.role}</span>
            <span className="text-xs font-mono text-muted-foreground">{userInfo.org.toUpperCase()}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.1 }}
          className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-amber-600" weight="duotone" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg">{t("profile_section_theme")}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{t("profile_theme_desc")}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                theme === "light"
                  ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30"
                  : "bg-muted text-muted-foreground ring-1 ring-border/40 hover:bg-muted/80 hover:text-foreground hover:ring-border/70"
              }`}
            >
              <Sun className="w-4 h-4" />
              {t("profile_theme_light")}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                theme === "dark"
                  ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30"
                  : "bg-muted text-muted-foreground ring-1 ring-border/40 hover:bg-muted/80 hover:text-foreground hover:ring-border/70"
              }`}
            >
              <Moon className="w-4 h-4" />
              {t("profile_theme_dark")}
            </button>
          </div>
        </motion.div>

        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.15 }}
          className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-sky-600" weight="duotone" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg">{t("profile_section_language")}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{t("profile_language_desc")}</p>
          <div className="flex items-center gap-3">
            {(["en", "fr", "es"] as const).map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ring-1 ${language === lang ? "bg-foreground text-background shadow-sm ring-foreground/30" : "bg-muted text-muted-foreground ring-border/40 hover:bg-muted/80 hover:text-foreground"}`}>
                {lang === "en" ? "English" : lang === "fr" ? "Français" : "Español"}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono italic">{t("profile_language_note")}</span>
        </motion.div>

        {/* Subscription Plan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.2 }}
          className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-4 md:col-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" weight="duotone" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg">{t("profile_section_plan")}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {/* Current Plan */}
            <div className="md:col-span-1 p-6 rounded-xl bg-primary/5 border border-primary/20 flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">{t("profile_plan_current")}</span>
              <span className="text-2xl font-display font-bold text-foreground">{t("profile_plan")}</span>
              <span className="text-lg font-mono text-foreground">{t("profile_plan_price")}</span>
              <span className="text-xs text-muted-foreground">{t("profile_plan_monthly")}</span>
            </div>

            {/* Features */}
            <div className="md:col-span-2 flex flex-col gap-2 justify-center">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("profile_plan_included")}</span>
              {[t("profile_plan_feature_lines"), t("profile_plan_feature_users"), t("profile_plan_feature_analytics"), t("profile_plan_feature_support")].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {feature}
                </div>
              ))}
              <button className="self-start mt-3 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors">
                {t("profile_btn_change_plan")}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.25 }}
          className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-indigo-600" weight="duotone" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg">{t("profile_section_notifications")}</h3>
          </div>
          <div className="flex flex-col gap-3 mt-2">
            {[
              { label: t("profile_notif_stock_alerts"), enabled: true },
              { label: t("profile_notif_orders_completed"), enabled: true },
              { label: t("profile_notif_weekly_reports"), enabled: false },
              { label: t("profile_notif_machine_maintenance"), enabled: true },
            ].map((item, idx) => (
              <label key={idx} className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-foreground">{item.label}</span>
                <div className={`w-10 h-6 rounded-full transition-colors relative ${item.enabled ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </div>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.3 }}
          className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-600" weight="duotone" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg">{t("profile_section_security")}</h3>
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <button className="w-full flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors text-left">
              <div>
                <span className="text-sm font-medium text-foreground block">{t("profile_security_password")}</span>
                <span className="text-xs text-muted-foreground">{t("profile_security_password_updated")}</span>
              </div>
              <span className="text-xs text-primary font-bold">{t("profile_security_password_change")}</span>
            </button>
            <button className="w-full flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors text-left">
              <div>
                <span className="text-sm font-medium text-foreground block">{t("profile_security_2fa")}</span>
                <span className="text-xs text-muted-foreground">{t("profile_security_2fa_desc")}</span>
              </div>
              <span className="text-xs text-primary font-bold">{t("profile_security_2fa_enable")}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
