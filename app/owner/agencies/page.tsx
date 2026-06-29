"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/providers/AuthProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { INITIAL_ORGANIZATIONS, INITIAL_AGENCIES, INITIAL_EMPLOYEES, INITIAL_USERS } from "@/lib/mock-db"
import type { Agency } from "@/lib/mock-db"
import {
  Buildings,
  Plus,
  X,
  Check,
  PencilSimple,
  MapPin,
  Phone,
  Users,
  Package,
  ToggleLeft,
  ToggleRight,
} from "@phosphor-icons/react"

export default function OwnerAgencies() {
  const { activeOrg } = useAuth()
  const { agencies, employees, createAgency, updateAgency } = useMockData()
  const { t } = useLanguage()
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formAddress, setFormAddress] = useState("")
  const [formCity, setFormCity] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formIsFabrication, setIsFabrication] = useState(true)
  const [formIsSales, setIsSales] = useState(true)
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active")

  const orgId = activeOrg?.org.id ?? ""

  const openCreate = () => {
    setFormName(""); setFormAddress(""); setFormCity(""); setFormPhone("")
    setIsFabrication(true); setIsSales(true); setFormStatus("active")
    setEditingId(null); setShowCreate(true)
  }

  const openEdit = (a: Agency) => {
    setFormName(a.name); setFormAddress(a.address ?? ""); setFormCity(a.city ?? "")
    setFormPhone(a.phone ?? ""); setIsFabrication(a.isFabricationPoint)
    setIsSales(a.isSalesPoint); setFormStatus(a.status)
    setEditingId(a.id); setShowCreate(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return
    if (editingId) {
      updateAgency(editingId, {
        name: formName.trim(),
        address: formAddress,
        city: formCity,
        phone: formPhone,
        isFabricationPoint: formIsFabrication,
        isSalesPoint: formIsSales,
        status: formStatus,
      })
    } else {
      createAgency({
        orgId,
        name: formName.trim(),
        managerId: undefined,
        isFabricationPoint: formIsFabrication,
        isSalesPoint: formIsSales,
        address: formAddress,
        city: formCity,
        phone: formPhone,
        status: "active",
        createdAt: new Date().toISOString(),
      })
    }
    setShowCreate(false)
    setEditingId(null)
  }

  const empCount = (agencyId: string) => employees.filter(e => e.agencyId === agencyId).length
  const prodCount = (agencyId: string) => 0 // simplified

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">Mes agences</h1>
          <p className="text-sm text-muted-foreground mt-1">{agencies.length} agence{agencies.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openCreate}
          className="h-10 px-4 bg-foreground text-background text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nouvelle agence
        </button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
         {agencies.length === 0 ? (
           <div className="col-span-full text-center py-12">
             <p className="text-muted-foreground">{t("owner_agencies_empty")}</p>
           </div>
         ) : (
           agencies.map((a) => (
             <div key={a.id} className="bg-card border border-border rounded-xl p-5 relative group">
               <button
                 onClick={() => openEdit(a)}
                 className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all"
               >
                 <PencilSimple className="w-4 h-4" />
               </button>
               <div className="flex items-start gap-3 mb-4">
                 <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                   <Buildings weight="duotone" className="w-5 h-5 text-primary" />
                 </div>
                 <div className="min-w-0">
                   <h3 className="text-base font-display font-bold text-foreground truncate">{a.name}</h3>
                   <div className="flex items-center gap-2 mt-1">
                     {a.isFabricationPoint && (
                       <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">FAB</span>
                     )}
                     {a.isSalesPoint && (
                       <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">VENTE</span>
                     )}
                     {a.status === "inactive" && (
                       <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-600">INACTIF</span>
                     )}
                   </div>
                 </div>
               </div>
               <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                 {a.city && (
                   <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{a.city}</span>
                 )}
                 {a.phone && (
                   <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{a.phone}</span>
                 )}
               </div>
               <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                 <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                   <Users className="w-3 h-3" />{empCount(a.id)} employés
                 </span>
               </div>
             </div>
           ))
         )}
        </div>
       <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => { setShowCreate(false); setEditingId(null) }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-md pointer-events-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {editingId ? "Modifier l'agence" : "Nouvelle agence"}
                  </h2>
                  <button onClick={() => { setShowCreate(false); setEditingId(null) }}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Field label="Nom">
                    <input required value={formName} onChange={e => setFormName(e.target.value)}
                      className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </Field>
                  <Field label="Adresse">
                    <input value={formAddress} onChange={e => setFormAddress(e.target.value)}
                      className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Ville">
                      <input value={formCity} onChange={e => setFormCity(e.target.value)}
                        className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </Field>
                    <Field label="Téléphone">
                      <input value={formPhone} onChange={e => setFormPhone(e.target.value)}
                        className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </Field>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input type="checkbox" checked={formIsFabrication}
                          onChange={e => setIsFabrication(e.target.checked)}
                          className="w-4 h-4 rounded border-border accent-foreground" />
                        Fabrication
                      </label>
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input type="checkbox" checked={formIsSales}
                          onChange={e => setIsSales(e.target.checked)}
                          className="w-4 h-4 rounded border-border accent-foreground" />
                        Vente
                      </label>
                    </div>
                  </div>
                  {editingId && (
                    <Field label="Statut">
                      <button type="button" onClick={() => setFormStatus(s => s === "active" ? "inactive" : "active")}
                        className={`flex items-center gap-2 h-11 px-4 rounded-lg border text-sm transition-colors ${
                          formStatus === "active"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                            : "border-red-500/30 bg-red-500/10 text-red-600"
                        }`}>
                        {formStatus === "active" ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        {formStatus === "active" ? "Active" : "Inactive"}
                      </button>
                    </Field>
                  )}
                  <button type="submit" disabled={!formName.trim()}
                    className="w-full mt-2 h-11 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    {editingId ? "Enregistrer" : "Créer l'agence"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}
