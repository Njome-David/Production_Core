"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/providers/AuthProvider"
import { ALL_PERMISSIONS, DEFAULT_ROLES, roleHasPermission } from "@/lib/permissions"
import { INITIAL_CUSTOM_ROLES } from "@/lib/mock-db"
import { useLanguage } from "@/providers/LanguageProvider"
import type { Permission } from "@/lib/mock-db"
import {
  ShieldCheck,
  Plus,
  X,
  Check,
  Lock,
  PencilSimple,
} from "@phosphor-icons/react"

export default function OwnerRoles() {
  const { activeOrg } = useAuth()
  const { t } = useLanguage()
  const [customRoles, setCustomRoles] = useState(INITIAL_CUSTOM_ROLES)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [roleName, setRoleName] = useState("")
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())

  const orgId = activeOrg?.org.id ?? ""

  const defaultRoles = DEFAULT_ROLES.map((d, i) => ({
    id: `default_${i}`,
    orgId,
    ...d,
  }))

  const allRoles = [...defaultRoles, ...customRoles.filter(r => r.orgId === orgId)]

  const categories = useMemo(() => {
    const map: Record<string, Permission[]> = {}
    for (const p of ALL_PERMISSIONS) {
      if (!map[p.category]) map[p.category] = []
      map[p.category].push(p)
    }
    return map
  }, [])

  const togglePerm = (key: string) => {
    setSelectedPerms(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const openCreate = () => {
    setRoleName(""); setSelectedPerms(new Set()); setEditingId(null); setShowCreate(true)
  }

  const openEdit = (role: typeof allRoles[number]) => {
    setRoleName(role.name); setSelectedPerms(new Set(role.permissions)); setEditingId(role.id); setShowCreate(true)
  }

  const handleSave = () => {
    if (!roleName.trim()) return
    if (editingId) {
      setCustomRoles(prev => prev.map(r =>
        r.id === editingId ? { ...r, name: roleName.trim(), permissions: [...selectedPerms] } : r
      ))
    } else {
      setCustomRoles(prev => [...prev, {
        id: `role_custom_${Date.now()}`,
        orgId,
        name: roleName.trim(),
        permissions: [...selectedPerms],
        isDefault: false,
      }])
    }
    setShowCreate(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">{t("owner_roles_title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{allRoles.length} {t(allRoles.length > 1 ? "owner_roles_count_plural" : "owner_roles_count_singular")}</p>
        </div>
        <button onClick={openCreate}
          className="h-10 px-4 bg-foreground text-background text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-foreground/90 transition-colors">
          <Plus className="w-4 h-4" /> {t("owner_roles_new_role")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allRoles.map(role => {
          const isDefault = role.isDefault
          return (
            <div key={role.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDefault ? "bg-muted" : "bg-primary/10"
                  }`}>
                    {isDefault
                      ? <Lock className="w-5 h-5 text-muted-foreground" />
                      : <ShieldCheck weight="duotone" className="w-5 h-5 text-primary" />
                    }
                  </div>
                  <div>
                    <h3 className="text-base font-display font-bold text-foreground">{role.name}</h3>
                    {isDefault && <span className="text-[10px] font-mono text-muted-foreground">{t("owner_roles_default_role")}</span>}
                  </div>
                </div>
                {!isDefault && (
                  <button onClick={() => openEdit(role)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <PencilSimple className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.slice(0, 6).map(pk => (
                  <span key={pk} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {pk}
                  </span>
                ))}
                {role.permissions.length > 6 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    +{role.permissions.length - 6}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowCreate(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-2xl pointer-events-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {editingId ? t("owner_roles_edit_role") : t("owner_roles_new_role")}
                  </h2>
                  <button onClick={() => setShowCreate(false)}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-4 mb-6">
                  <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("owner_roles_role_name")}</label>
                  <input value={roleName} onChange={e => setRoleName(e.target.value)}
                    placeholder={t("owner_roles_placeholder")}
                    className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                <div className="flex flex-col gap-6">
                  {Object.entries(categories).map(([cat, perms]) => (
                    <div key={cat}>
                      <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">{cat}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map(p => (
                          <label key={p.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedPerms.has(p.key)
                                ? "border-foreground bg-muted"
                                : "border-border hover:border-muted-foreground/30"
                            }`}>
                            <input type="checkbox" checked={selectedPerms.has(p.key)}
                              onChange={() => togglePerm(p.key)}
                              className="w-4 h-4 mt-0.5 rounded border-border accent-foreground" />
                            <div>
                              <span className="text-sm font-medium text-foreground">{p.label}</span>
                              <p className="text-xs text-muted-foreground">{p.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handleSave} disabled={!roleName.trim()}
                  className="w-full mt-8 h-11 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  {editingId ? t("owner_roles_save") : t("owner_roles_create_role")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
