"use client"

import React, { useState } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { INITIAL_ORGANIZATIONS } from "@/lib/mock-db"
import {
  Gear,
  Check,
  Globe,
  CurrencyDollar,
  Bell,
} from "@phosphor-icons/react"

const INDUSTRIES = [
  "Agroalimentaire & Transformation",
  "Fabrication Métallique",
  "Textile & Habillement",
  "Chimie & Pharmacie",
  "Bois & Ameublement",
  "Matériaux de Construction",
  "Électronique",
  "Autre",
]

export default function OwnerSettings() {
  const { activeOrg } = useAuth()
  const { t } = useLanguage()
  const org = activeOrg?.org

  const [name, setName] = useState(org?.name ?? "")
  const [industry, setIndustry] = useState(org?.industry ?? "")
  const [country, setCountry] = useState(org?.country ?? "")
  const [currency, setCurrency] = useState(org?.currency ?? "XAF")
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!org) return
    const idx = INITIAL_ORGANIZATIONS.findIndex(o => o.id === org.id)
    if (idx >= 0) {
      INITIAL_ORGANIZATIONS[idx] = {
        ...INITIAL_ORGANIZATIONS[idx],
        name: name.trim(),
        industry,
        country,
        currency,
      }
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!org) return null

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">{t("owner_settings_title")}</h1>

      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Gear className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-display font-bold text-foreground">{t("owner_settings_organization")}</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("owner_settings_name")}</label>
            <input required value={name} onChange={e => setName(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("owner_settings_industry")}</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none appearance-none">
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("owner_settings_country")}</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input required value={country} onChange={e => setCountry(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("owner_settings_currency")}</label>
              <div className="relative">
                <CurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select value={currency} onChange={e => setCurrency(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none appearance-none">
                  <option value="XAF">XAF (FCFA)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <button type="submit"
          className={`mt-6 h-11 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            saved
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
              : "bg-foreground text-background hover:bg-foreground/90"
          }`}>
          {saved ? <><Check className="w-4 h-4" /> {t("owner_settings_saved")}</> : t("owner_settings_save")}
        </button>
      </form>
    </div>
  )
}
