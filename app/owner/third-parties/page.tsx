"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/providers/AuthProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import {
  Handshake,
  Plus,
  X,
  Check,
  UsersThree,
  Storefront,
  Truck,
} from "@phosphor-icons/react"

export default function OwnerThirdParties() {
  const { activeOrg } = useAuth()
  const { t } = useLanguage()
  const { thirdParties, createThirdParty, updateThirdParty } = useMockData()
  const [tab, setTab] = useState<"supplier" | "client">("supplier")
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState<"supplier" | "client">("supplier")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formAddress, setFormAddress] = useState("")
  const [formWebsite, setFormWebsite] = useState("")

  const orgId = activeOrg?.org.id ?? ""

  const filtered = thirdParties.filter(tp => tp.type === tab)

  const openCreate = () => {
    setFormName(""); setFormType(tab); setFormEmail(""); setFormPhone(""); setFormAddress(""); setFormWebsite("")
    setEditingId(null); setShowCreate(true)
  }

  const openEdit = (tp: typeof thirdParties[number]) => {
    setFormName(tp.name); setFormType(tp.type); setFormEmail(tp.email ?? ""); setFormPhone(tp.phone ?? "")
    setFormAddress(tp.address ?? ""); setFormWebsite(tp.website ?? "")
    setEditingId(tp.id); setShowCreate(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return
    if (editingId) {
      updateThirdParty(editingId, {
        name: formName.trim(), type: formType, email: formEmail, phone: formPhone,
        address: formAddress, website: formWebsite,
      })
    } else {
      createThirdParty({
        orgId, name: formName.trim(), type: formType, email: formEmail, phone: formPhone,
        address: formAddress, website: formWebsite,
        associatedMaterials: [], associatedProducts: [],
      })
    }
    setShowCreate(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">{t("owner_third_parties_title")}</h1>
        <button onClick={openCreate}
          className="h-10 px-4 bg-foreground text-background text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-foreground/90 transition-colors">
          <Plus className="w-4 h-4" /> {t("owner_third_parties_add")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted p-1 rounded-xl w-fit">
        <button onClick={() => setTab("supplier")}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "supplier" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}>
          <Truck className="w-4 h-4" /> {t("owner_third_parties_suppliers")}
        </button>
        <button onClick={() => setTab("client")}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "client" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}>
          <Storefront className="w-4 h-4" /> {t("owner_third_parties_clients")}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(tp => (
          <div key={tp.id} className="bg-card border border-border rounded-xl p-5 group cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => openEdit(tp)}>
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                tp.type === "supplier" ? "bg-blue-500/10" : "bg-emerald-500/10"
              }`}>
                {tp.type === "supplier"
                  ? <Truck weight="duotone" className="w-5 h-5 text-blue-600" />
                  : <Storefront weight="duotone" className="w-5 h-5 text-emerald-600" />
                }
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-foreground">{tp.name}</h3>
                {tp.email && <p className="text-xs text-muted-foreground">{tp.email}</p>}
              </div>
            </div>
            {(tp.phone || tp.address) && (
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {tp.phone && <span>{tp.phone}</span>}
                {tp.address && <span>{tp.address}</span>}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-1.5">
              {tp.associatedMaterials?.map(m => (
                <span key={m} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{m}</span>
              ))}
              {tp.associatedProducts?.map(p => (
                <span key={p} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p}</span>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UsersThree className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{tab === "supplier" ? t("owner_third_parties_empty_supplier") : t("owner_third_parties_empty_client")}</p>
          </div>
        )}
      </div>

      {/* Modal */}
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
                    {editingId ? t("owner_third_parties_edit") : t("owner_third_parties_new")}
                  </h2>
                  <button onClick={() => { setShowCreate(false); setEditingId(null) }}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Field label={t("owner_third_parties_type")}>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setFormType("supplier")}
                        className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                          formType === "supplier"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-600"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}>{t("owner_third_parties_type_supplier")}</button>
                      <button type="button" onClick={() => setFormType("client")}
                        className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                          formType === "client"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}>{t("owner_third_parties_type_client")}</button>
                    </div>
                  </Field>
                  <Field label={t("owner_third_parties_name")}>
                    <input required value={formName} onChange={e => setFormName(e.target.value)}
                      className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </Field>
                  <Field label={t("owner_third_parties_email")}>
                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)}
                      className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t("owner_third_parties_phone")}>
                      <input value={formPhone} onChange={e => setFormPhone(e.target.value)}
                        className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none" />
                    </Field>
                    <Field label={t("owner_third_parties_website")}>
                      <input value={formWebsite} onChange={e => setFormWebsite(e.target.value)}
                        className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none" />
                    </Field>
                  </div>
                  <Field label={t("owner_third_parties_address")}>
                    <input value={formAddress} onChange={e => setFormAddress(e.target.value)}
                      className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none" />
                  </Field>
                  <button type="submit" disabled={!formName.trim()}
                    className="w-full mt-2 h-11 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    {editingId ? t("owner_third_parties_save") : t("owner_third_parties_add")}
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
