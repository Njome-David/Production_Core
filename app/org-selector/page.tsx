"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { StorefrontIcon, Briefcase, DeviceTabletSpeakerIcon, ArrowRight, Plus, Building, X, SignOut, SignIn } from "@phosphor-icons/react"

export default function OrgSelectorPage() {
  const router = useRouter()
  const { setActiveSession } = useMockData()
  const { t } = useLanguage()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "join">("create")
  const [newOrgName, setNewOrgName] = useState("")
  const [newOrgSector, setNewOrgSector] = useState("manufacturing")
  const [joinOrgId, setJoinOrgId] = useState("")

  const handleSelectRole = (role: "Manager" | "Operator", org_id: string, user_id: string) => {
    setActiveSession({
      user_id,
      role,
      org_id,
    })
    
    if (role === "Manager") {
      router.push("/manager/dashboard")
    } else {
      router.push("/operator/select-station")
    }
  }

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === "create") {
      if (!newOrgName.trim()) return
      const generatedOrgId = `org_${newOrgName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      handleSelectRole("Manager", generatedOrgId, "usr_admin_01")
    } else {
      if (!joinOrgId.trim()) return
      handleSelectRole("Operator", joinOrgId, "usr_opr_01")
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { ease: [0.32, 0.72, 0, 1] as const, duration: 0.5 } }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-6 relative">
      <button 
        onClick={() => router.push("/login")}
        className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors flex items-center gap-2"
      >
        <span className="text-sm font-medium">{t("org_signout")}</span>
        <SignOut className="w-5 h-5" />
      </button>

      <motion.div 
        className="w-full max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-48 h-16 mb-5 overflow-hidden relative rounded-2xl shadow-sm">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('fallback-icon'); }} />
            <div className="hidden fallback-icon-svg flex-col items-center justify-center absolute inset-0 gap-2">
              <StorefrontIcon weight="duotone" className="w-12 h-12 text-primary" />
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            .fallback-icon-svg { display: none !important; }
            .fallback-icon .fallback-icon-svg { display: flex !important; }
          `}} />
          <h1 className="text-3xl text-foreground font-display font-bold tracking-tight mb-2">{t("org_title")}</h1>
          <p className="text-muted-foreground">{t("org_desc")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manager Option */}
          <motion.div variants={itemVariants}>
            <button 
              onClick={() => handleSelectRole("Manager", "org_alpha_feed", "usr_dvd_99")}
              className="h-full w-full flex flex-col group text-left bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bg-emerald-500 w-1 h-full origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out"></div>
              
              <div className="flex items-start justify-between mb-8 w-full">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Briefcase weight="duotone" className="w-5 h-5 text-emerald-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-display text-foreground font-bold tracking-tight mb-1">{t("org_card_manager")}</h3>
                <p className="text-sm font-medium text-foreground mb-4">Alpha Feed Co.</p>
              </div>
              
              <div className="w-full flex flex-col gap-2 border-t border-border/50 pt-4 mt-auto">
                <span className="text-xs text-muted-foreground font-mono">{t("org_role_manager")}</span>
                <span className="text-xs text-muted-foreground font-mono">{t("org_access_full")}</span>
              </div>
            </button>
          </motion.div>

          {/* Operator Option */}
          <motion.div variants={itemVariants}>
            <button 
              onClick={() => handleSelectRole("Operator", "org_beta_mills", "usr_opr_01")}
              className="h-full w-full flex flex-col group text-left bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out"></div>
              
              <div className="flex items-start justify-between mb-8 w-full">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <DeviceTabletSpeakerIcon weight="duotone" className="w-5 h-5 text-amber-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-display text-foreground font-bold tracking-tight mb-1">{t("org_card_operator")}</h3>
                <p className="text-sm font-medium text-foreground mb-4">Beta Milling Partners</p>
              </div>
              
              <div className="w-full flex flex-col gap-2 border-t border-border/50 pt-4 mt-auto">
                <span className="text-xs text-muted-foreground font-mono">{t("org_role_operator")}</span>
                <span className="text-xs text-muted-foreground font-mono">{t("org_access_execution")}</span>
              </div>
            </button>
          </motion.div>

          {/* Create New Org */}
          <motion.div variants={itemVariants}>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full h-full group text-left bg-transparent border border-dashed border-border rounded-xl p-6 hover:border-primary hover:bg-card transition-all duration-300 flex flex-col items-center justify-center text-center"
            >
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-4 group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
                <Plus className="w-6 h-6 text-primary group-hover:text-background transition-colors" />
              </div>
              <h3 className="text-lg font-display font-bold tracking-tight mb-3 text-foreground">{t("org_card_create")}</h3>
              <p className="text-sm font-medium text-muted-foreground">{t("org_card_create_desc")}</p>
            </button>
          </motion.div>
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
                    <Building className="w-6 h-6 text-primary" weight="duotone" />
                  </div>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-display font-bold tracking-tight mb-2">{t("org_modal_title")}</h2>
                
                <div className="flex bg-muted p-1 rounded-xl mb-6 relative">
                  <div 
                    className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-sm transition-transform duration-300 ease-in-out"
                    style={{ transform: modalMode === "create" ? "translateX(0)" : "translateX(100%)" }}
                  />
                  <button 
                    type="button"
                    onClick={() => setModalMode("create")}
                    className={`flex-1 relative z-10 py-2 text-sm font-medium transition-colors ${modalMode === "create" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t("org_tab_create")}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setModalMode("join")}
                    className={`flex-1 relative z-10 py-2 text-sm font-medium transition-colors ${modalMode === "join" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t("org_tab_join")}
                  </button>
                </div>
                
                <p className="text-muted-foreground text-sm mb-8">
                  {modalMode === "create" ? t("org_modal_desc_create") : t("org_modal_desc_join")}
                </p>

                <form onSubmit={handleCreateOrg} className="flex flex-col gap-5">
                  {modalMode === "create" ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="orgName" className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("org_label_name")}</label>
                        <input 
                          id="orgName"
                          type="text" 
                          value={newOrgName}
                          onChange={(e) => setNewOrgName(e.target.value)}
                          placeholder={t("org_placeholder_name")}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                          autoFocus
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="orgSector" className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("org_label_sector")}</label>
                        <select 
                          id="orgSector"
                          value={newOrgSector}
                          onChange={(e) => setNewOrgSector(e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none"
                        >
                          <option value="manufacturing">{t("org_option_manufacturing")}</option>
                          <option value="feed">{t("org_option_livestock")}</option>
                          <option value="chemicals">{t("org_option_chemicals")}</option>
                          <option value="textiles">{t("org_option_textile")}</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="joinOrgId" className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("org_label_code")}</label>
                      <input 
                        id="joinOrgId"
                        type="text" 
                        value={joinOrgId}
                        onChange={(e) => setJoinOrgId(e.target.value)}
                        placeholder={t("org_placeholder_code")}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                        autoFocus
                        required
                      />
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={modalMode === "create" ? !newOrgName.trim() : !joinOrgId.trim()}
                    className="w-full mt-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {modalMode === "create" ? (
                      <>
                        <Plus className="w-5 h-5" />
                        {t("org_btn_provision")}
                      </>
                    ) : (
                      <>
                        <SignIn className="w-5 h-5" />
                        {t("org_btn_join")}
                      </>
                    )}
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
