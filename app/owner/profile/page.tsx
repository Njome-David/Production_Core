"use client"

import React, { useState } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { INITIAL_SUBSCRIPTIONS } from "@/lib/mock-db"
import {
  UserCircle,
  CreditCard,
  Globe,
  Check,
  Eye,
  EyeSlash,
  ArrowRight,
  CurrencyDollar,
} from "@phosphor-icons/react"

const PLANS = [
  { id: "starter", label: "Starter", price: "49 000 FCFA/mois" },
  { id: "professional", label: "Professional", price: "149 000 FCFA/mois" },
  { id: "enterprise", label: "Enterprise", price: "499 000 FCFA/mois" },
] as const

export default function OwnerProfile() {
  const { user, activeOrg, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)

  const org = activeOrg?.org
  const subscription = org ? INITIAL_SUBSCRIPTIONS.find(s => s.orgId === org.id) : null

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">Profil</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg font-medium text-sm transition-colors"
        >
          Se déconnecter
        </button>
      </div>

      {/* Personal info */}
      <section className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserCircle weight="duotone" className="w-6 h-6 text-primary" />
          <h2 className="text-sm font-display font-bold text-foreground">{t("owner_profile_personal_info")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("owner_profile_name")}</label>
            <p className="text-sm text-foreground mt-1">{user?.name}</p>
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("owner_profile_email")}</label>
            <p className="text-sm text-foreground mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("owner_profile_phone")}</label>
            <p className="text-sm text-foreground mt-1">{user?.phone ?? "—"}</p>
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("owner_profile_job_title")}</label>
            <p className="text-sm text-foreground mt-1">{user?.jobTitle ?? "—"}</p>
          </div>
        </div>
      </section>

      {/* Password section */}
      <section className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-display font-bold text-foreground mb-4">{t("owner_profile_password")}</h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <input type={showPassword ? "text" : "password"} value="password" readOnly
              className="w-full h-11 px-4 pr-11 bg-background border border-border rounded-lg text-sm text-foreground" />
            <button onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-xs text-muted-foreground">{t("owner_profile_demo_account")}</span>
        </div>
      </section>

      {/* Language */}
      <section className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-display font-bold text-foreground">{t("owner_profile_preferences")}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("owner_profile_language")}</span>
          <div className="flex bg-muted rounded-lg p-0.5">
            {(["fr", "en", "es"] as const).map(l => (
              <button key={l} onClick={() => setLanguage(l)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  language === l ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}>
                {l === "fr" ? t("owner_profile_french") : l === "en" ? t("owner_profile_english") : t("owner_profile_spanish")}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription */}
      {subscription && (
        <section className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard weight="duotone" className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-sm font-display font-bold text-foreground">{t("owner_profile_subscription")}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {PLANS.map(p => {
              const isActive = subscription.plan === p.id
              return (
                <div key={p.id} className={`relative rounded-xl border-2 p-4 ${
                  isActive ? "border-foreground bg-muted" : "border-border"
                }`}>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                      <Check weight="bold" className="w-3 h-3 text-background" />
                    </div>
                  )}
                  <h3 className="text-sm font-display font-bold text-foreground capitalize">{p.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{p.price}</p>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("owner_profile_status")}</span>
              <span className="text-emerald-500 font-medium">{subscription.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("owner_profile_billing")}</span>
              <span className="text-foreground">{subscription.billing === "annual" ? t("owner_profile_annual") : t("owner_profile_monthly")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("owner_profile_due_date")}</span>
              <span className="text-foreground">{new Date(subscription.endDate).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("owner_profile_payment")}</span>
              <span className="text-foreground font-mono">{subscription.paymentMethod ?? "—"}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
