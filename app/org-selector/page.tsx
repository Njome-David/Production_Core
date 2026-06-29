"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth, type OrgContext } from "@/providers/AuthProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { createOrganization } from "@/lib/auth"
import { INITIAL_USERS, INITIAL_ORGANIZATIONS, INITIAL_AGENCIES, INITIAL_SUBSCRIPTIONS } from "@/lib/mock-db"
import {
  StorefrontIcon,
  Briefcase,
  DeviceTabletSpeakerIcon,
  ArrowRight,
  Plus,
  Buildings,
  X,
  SignOut,
  Crown,
} from "@phosphor-icons/react"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ease: [0.32, 0.72, 0, 1] as const, duration: 0.5 } },
}

export default function OrgSelectorPage() {
  const router = useRouter()
  const { user, orgs, selectOrg, selectAgency, logout } = useAuth()
  const { t } = useLanguage()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [newOrgSector, setNewOrgSector] = useState("manufacturing")
  const [newOrgCountry, setNewOrgCountry] = useState("Cameroun")
  const [newOrgCurrency, setNewOrgCurrency] = useState("XAF")
  const [newOrgPhone, setNewOrgPhone] = useState("")

  // Auto-redirect if single org
  useEffect(() => {
    if (!user || !orgs.length) return
    if (orgs.length === 1) {
      const { role, org, agencies } = orgs[0]
      if (role === "manager" && agencies.length === 1) {
        selectOrg(org.id, agencies[0].id)
      } else if (role === "operator" && agencies.length === 1) {
        selectOrg(org.id, agencies[0].id)
      } else if (role === "owner") {
        selectOrg(org.id)
      }
    }
  }, [user, orgs, selectOrg])

  const handleSelectOrg = (ctx: OrgContext) => {
    const { role, org, agencies } = ctx
    if (role === "manager" && agencies.length > 1) {
      // Stay on this page — show agency picker later
      selectOrg(org.id)
      return
    }
    selectOrg(org.id, agencies[0]?.id)
  }

  const handleSelectAgency = (orgId: string, agencyId: string) => {
    selectAgency(agencyId)
  }

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim() || !user) return

    const result = createOrganization(user.id, {
      name: newOrgName.trim(),
      industry: newOrgSector,
      country: newOrgCountry,
      currency: newOrgCurrency,
      phone: newOrgPhone,
      plan: "starter",
      billing: "monthly",
    })

    // Push to seed arrays (prototype mutation)
    ;(INITIAL_ORGANIZATIONS as any[]).push(result.org)
    ;(INITIAL_AGENCIES as any[]).push(result.agency)
    ;(INITIAL_SUBSCRIPTIONS as any[]).push(result.subscription)

    setShowCreateModal(false)
    setNewOrgName("")
    // Refresh by reloading the page to pick up the new org
    router.refresh()
    window.location.reload()
  }

  if (!user) return null

  const isMultiOrg = orgs.length > 1
  const isMultiAgency = orgs.some(o => o.agencies.length > 1)

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-6 relative">
      <button
        onClick={logout}
        className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors flex items-center gap-2"
      >
        <span className="text-sm font-medium">{t("org_signout")}</span>
        <SignOut className="w-5 h-5" />
      </button>

      <motion.div
        className="w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-primary/10">
            <StorefrontIcon weight="duotone" className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl text-foreground font-display font-bold tracking-tight mb-2">
            {isMultiOrg ? t("org_title_multi") : `${t("org_title_single")} ${user?.name || ""}`}
          </h1>
          <p className="text-muted-foreground">
{isMultiOrg
  ? t("org_desc_multi")
  : isMultiAgency
   ? t("org_desc_agency")
  : t("org_desc_single")}
          </p>
        </motion.div>

        {/* Org cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgs.map((ctx) => {
            const isOwner = ctx.role === "owner"
            const isManager = ctx.role === "manager"
            return (
              <motion.div key={ctx.org.id} variants={itemVariants}>
                <button
                  onClick={() => handleSelectOrg(ctx)}
                  className="h-full w-full flex flex-col group text-left bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out ${
                    isOwner ? "bg-emerald-500" : isManager ? "bg-blue-500" : "bg-amber-500"
                  }`} />

                  <div className="flex items-start justify-between mb-6 w-full">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isOwner ? "bg-emerald-500/10" : isManager ? "bg-blue-500/10" : "bg-amber-500/10"
                    }`}>
                      {isOwner ? (
                        <Crown weight="duotone" className="w-5 h-5 text-emerald-600" />
                      ) : isManager ? (
                        <Briefcase weight="duotone" className="w-5 h-5 text-blue-600" />
                      ) : (
                        <DeviceTabletSpeakerIcon weight="duotone" className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-display text-foreground font-bold tracking-tight mb-1">{ctx.org.name}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      isOwner
                        ? "bg-emerald-500/10 text-emerald-600"
                        : isManager
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {isOwner ? t("org_role_owner") : isManager ? t("org_role_manager") : t("org_role_operator")}
                    </span>
                  </div>

                  <div className="w-full flex flex-col gap-1.5 border-t border-border/50 pt-4 mt-4">
                    <span className="text-xs text-muted-foreground">
                      {ctx.org.industry} &middot; {ctx.org.country}
                    </span>
                    {isManager && ctx.agencies.length > 1 && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {ctx.agencies.length} {t("org_agencies")}
                      </span>
                    )}
                  </div>
                </button>

                {/* Agency sub-selector for multi-agency managers */}
                {isManager && ctx.agencies.length > 1 && (
                  <div className="mt-2 flex flex-col gap-1 pl-4 border-l-2 border-muted">
                    {ctx.agencies.map((agency) => (
                      <button
                        key={agency.id}
                        onClick={() => handleSelectAgency(ctx.org.id, agency.id)}
                        className="text-left text-sm py-1.5 px-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        <Buildings weight="duotone" className="w-3.5 h-3.5 shrink-0" />
                        {agency.name}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}

          {/* Create new org card — for owners */}
          {orgs.some(o => o.role === "owner") && (
            <motion.div variants={itemVariants}>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full h-full group text-left bg-transparent border border-dashed border-border rounded-xl p-6 hover:border-primary hover:bg-card transition-all duration-300 flex flex-col items-center justify-center text-center"
              >
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-4 group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
                  <Plus className="w-6 h-6 text-primary group-hover:text-background transition-colors" />
                </div>
                <h3 className="text-lg font-display font-bold tracking-tight mb-3 text-foreground">
                  {t("org_card_create")}
                </h3>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("org_card_create")}
                </p>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Create Org Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-md pointer-events-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-8 overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Buildings className="w-6 h-6 text-primary" weight="duotone" />
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
                  {t("org_modal_title")}
                </h2>
                 <p className="text-muted-foreground text-sm mb-8">
                   {t("org_modal_desc_create")}
                 </p>

                <form onSubmit={handleCreateOrg} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="orgName" className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                      {t("org_modal_label_name")}
                    </label>
                    <input
                      id="orgName"
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="e.g. Ma Société SARL"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                      {t("org_modal_label_sector")}
                    </label>
                    <select
                      value={newOrgSector}
                      onChange={(e) => setNewOrgSector(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none"
                    >
                      <option value="manufacturing">Fabrication & Industrie</option>
                      <option value="agroalimentaire">Agroalimentaire</option>
                      <option value="chimie">Chimie & Pharmacie</option>
                      <option value="textile">Textile & Habillement</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                        {t("org_modal_label_country")}
                      </label>
                      <input
                        type="text"
                        value={newOrgCountry}
                        onChange={(e) => setNewOrgCountry(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                        {t("org_modal_label_currency")}
                      </label>
                      <select
                        value={newOrgCurrency}
                        onChange={(e) => setNewOrgCurrency(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none"
                      >
                        <option value="XAF">XAF (FCFA)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                      {t("org_modal_label_phone")}
                    </label>
                    <input
                      type="tel"
                      value={newOrgPhone}
                      onChange={(e) => setNewOrgPhone(e.target.value)}
                      placeholder="+237 6XX XXX XXX"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newOrgName.trim()}
                    className="w-full mt-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t("org_modal_btn_create")}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
