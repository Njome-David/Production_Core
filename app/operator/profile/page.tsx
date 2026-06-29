"use client"

import React from "react"
import { motion } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useAuth } from "@/providers/AuthProvider"
import { useTheme } from "next-themes"
import { useLanguage } from "@/providers/LanguageProvider"
import { UserCircle, Sun, Moon, Globe, Bell, Shield, CaretLeft } from "@phosphor-icons/react"
import Link from "next/link"

export default function OperatorProfilePage() {
  const { activeSession } = useMockData()
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { t, language, setLanguage } = useLanguage()

  const userInfo = {
    name: "Operator",
    email: "operator@beta-mills.com",
    role: "Operator",
    org: activeSession?.org_id || "org_beta_mills",
    stationName: activeSession?.active_station
      ? `Station: ${activeSession.active_station}`
      : t("operator_profile_no_station_selected"),
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-12 p-6">
      <Link 
        href="/operator/select-station" 
        className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors font-medium text-sm w-max"
      >
        <CaretLeft className="w-4 h-4" />
        {t("tablet_back")}
      </Link>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-display text-foreground font-bold tracking-tight mb-2">{t("profile_title")}</h1>
          <p className="text-muted-foreground">{t("profile_operator_desc")}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg font-medium text-sm transition-colors h-fit"
        >
          Se déconnecter
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.05 }}
        className="bg-card border border-border/50 rounded-2xl p-6 flex items-center gap-5"
      >
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
          <UserCircle weight="duotone" className="w-10 h-10 text-amber-600" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-display font-bold text-foreground">{userInfo.name}</h2>
          <p className="text-muted-foreground text-sm">{userInfo.email}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 uppercase tracking-wider">{userInfo.role}</span>
            <span className="text-xs font-mono text-muted-foreground">{userInfo.org.toUpperCase()}</span>
            <span className="text-xs font-mono text-muted-foreground">• {userInfo.stationName}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <button onClick={() => setTheme("light")} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${theme === "light" ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30" : "bg-muted text-muted-foreground ring-1 ring-border/40 hover:bg-muted/80 hover:text-foreground hover:ring-border/70"}`}>
              <Sun className="w-4 h-4" />
              {t("profile_theme_light")}
            </button>
            <button onClick={() => setTheme("dark")} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${theme === "dark" ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30" : "bg-muted text-muted-foreground ring-1 ring-border/40 hover:bg-muted/80 hover:text-foreground hover:ring-border/70"}`}>
              <Moon className="w-4 h-4" />
              {t("profile_theme_dark")}
            </button>
          </div>
        </motion.div>

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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.2 }}
          className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-indigo-600" weight="duotone" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg">{t("profile_section_notifications")}</h3>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: t("profile_notif_stock_alerts"), enabled: true },
              { label: t("profile_notif_orders_assigned"), enabled: true },
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.25 }}
          className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-rose-600" weight="duotone" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg">{t("profile_section_security")}</h3>
          </div>
          <button className="w-full flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors text-left">
            <div>
              <span className="text-sm font-medium text-foreground block">{t("profile_security_password")}</span>
              <span className="text-xs text-muted-foreground">{t("profile_security_password_change_operator")}</span>
            </div>
            <span className="text-xs text-primary font-bold">{t("profile_security_password_change")}</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
