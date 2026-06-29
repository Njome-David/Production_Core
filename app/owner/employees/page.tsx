"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/providers/AuthProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { createEmployeeAccount } from "@/lib/auth"
import { INITIAL_USERS } from "@/lib/mock-db"
import type { Employee } from "@/lib/mock-db"
import {
  Users,
  Plus,
  X,
  Check,
  MagnifyingGlass,
  FunnelSimple,
} from "@phosphor-icons/react"

export default function OwnerEmployees() {
  const { activeOrg } = useAuth()
  const { t } = useLanguage()
  const { agencies, employees, createEmployee, updateEmployee } = useMockData()
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState("")
  const [filterAgency, setFilterAgency] = useState("all")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null)

  // Form
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formJobTitle, setFormJobTitle] = useState("")
  const [formRole, setFormRole] = useState("operator")
  const [formAgencyId, setFormAgencyId] = useState("")

  const orgId = activeOrg?.org.id ?? ""

  const openCreate = () => {
    setFormName(""); setFormEmail(""); setFormPhone(""); setFormJobTitle("")
    setFormRole("operator"); setFormAgencyId(agencies[0]?.id ?? "")
    setGeneratedCredentials(null); setShowCreate(true)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formEmail.trim() || !formAgencyId) return

    const result = createEmployeeAccount(orgId, {
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone,
      jobTitle: formJobTitle,
      role: formRole,
      agencyId: formAgencyId,
    })

    // Push user and employee
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(INITIAL_USERS as any[]).push(result.user)
    createEmployee({
      userId: result.user.id,
      orgId,
      agencyId: formAgencyId,
      role: formRole,
      jobTitle: formJobTitle || "",
      phone: formPhone || undefined,
      status: "active",
      startedAt: new Date().toISOString(),
    })

    setGeneratedCredentials({ email: formEmail, password: result.password })
  }

  const filtered = useMemo(() => {
    return employees.filter(e => {
      if (search && !e.jobTitle?.toLowerCase().includes(search.toLowerCase()) && !e.phone?.includes(search)) return false
      if (filterAgency !== "all" && e.agencyId !== filterAgency) return false
      if (filterRole !== "all" && e.role !== filterRole) return false
      if (filterStatus !== "all" && e.status !== filterStatus) return false
      return true
    })
  }, [employees, search, filterAgency, filterRole, filterStatus])

  const stats = useMemo(() => {
    return {
      total: employees.length,
      byAgency: agencies.map(a => ({ name: a.name, count: employees.filter(e => e.agencyId === a.id).length })),
      byRole: [
        { role: "manager", count: employees.filter(e => e.role === "manager").length },
        { role: "operator", count: employees.filter(e => e.role === "operator").length },
      ],
    }
  }, [employees, agencies])

  const users = INITIAL_USERS

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">{t("owner_employees_title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.total} {stats.total > 1 ? t("owner_employees_count_plural") : t("owner_employees_count_singular")}</p>
        </div>
        <button onClick={openCreate}
          className="h-10 px-4 bg-foreground text-background text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-foreground/90 transition-colors">
          <Plus className="w-4 h-4" /> {t("owner_employees_add")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">{t("owner_employees_by_agency")}</h3>
          <div className="flex flex-col gap-1.5">
            {stats.byAgency.map(a => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{a.name}</span>
                <span className="text-muted-foreground font-mono">{a.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">{t("owner_employees_by_role")}</h3>
          <div className="flex flex-col gap-1.5">
            {stats.byRole.map(r => (
              <div key={r.role} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{r.role === "manager" ? t("owner_employees_managers") : t("owner_employees_operators")}</span>
                <span className="text-muted-foreground font-mono">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("owner_employees_search")}
            className="w-full h-10 pl-9 pr-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <select value={filterAgency} onChange={e => setFilterAgency(e.target.value)}
          className="h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none">
          <option value="all">{t("owner_employees_all_agencies")}</option>
          {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none">
          <option value="all">{t("owner_employees_all_roles")}</option>
          <option value="manager">{t("owner_employees_manager")}</option>
          <option value="operator">{t("owner_employees_operator")}</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none">
          <option value="all">{t("owner_employees_all_statuses")}</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Employé</th>
                <th className="p-4">Poste</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Agence</th>
                <th className="p-4">{t("owner_employees_status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const u = users.find(u => u.id === e.userId)
                const agency = agencies.find(a => a.id === e.agencyId)
                return (
                  <tr key={e.id} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {u?.name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{u?.name ?? "—"}</span>
                          <span className="block text-xs text-muted-foreground">{u?.email ?? ""}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{e.jobTitle ?? "—"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        e.role === "manager" ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {e.role === "manager" ? t("owner_employees_manager") : t("owner_employees_operator")}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{agency?.name ?? "—"}</td>
                    <td className="p-4">
                      <span className={`text-xs font-mono font-bold ${e.status === "active" ? "text-emerald-500" : "text-red-500"}`}>
                        {e.status === "active" ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">{t("owner_employees_no_employees_found")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => { setShowCreate(false); setGeneratedCredentials(null) }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-md pointer-events-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-foreground">{t("owner_employees_new_employee")}</h2>
                  <button onClick={() => { setShowCreate(false); setGeneratedCredentials(null) }}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {generatedCredentials ? (
                  <div className="flex flex-col gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                      <Check className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">{t("owner_employees_employee_created_success")}</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Email</span>
                        <span className="text-foreground font-mono">{generatedCredentials.email}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("owner_employees_password")}</span>
                        <span className="text-foreground font-mono">{generatedCredentials.password}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {t("owner_employees_share_credentials")}
                    </p>
                    <button onClick={() => { setShowCreate(false); setGeneratedCredentials(null) }}
                      className="w-full h-11 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors">
                      {t("owner_employees_close")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreate} className="flex flex-col gap-4">
                    <Field label={t("owner_employees_full_name")}>
                      <input required value={formName} onChange={e => setFormName(e.target.value)}
                        className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </Field>
                    <Field label="Email">
                      <input type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)}
                        className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={t("owner_employees_phone")}>
                        <input value={formPhone} onChange={e => setFormPhone(e.target.value)}
                          className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </Field>
                      <Field label="Poste">
                        <input value={formJobTitle} onChange={e => setFormJobTitle(e.target.value)}
                          className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </Field>
                    </div>
                    <Field label="Rôle">
                      <select value={formRole} onChange={e => setFormRole(e.target.value)}
                        className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none">
                        <option value="operator">{t("owner_employees_operator")}</option>
                        <option value="manager">{t("owner_employees_manager")} d&rsquo;agence</option>
                      </select>
                    </Field>
                    <Field label="Agence">
                      <select value={formAgencyId} onChange={e => setFormAgencyId(e.target.value)}
                        className="w-full h-11 px-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none">
                        {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </Field>
                    <button type="submit" disabled={!formName.trim() || !formEmail.trim() || !formAgencyId}
                      className="w-full mt-2 h-11 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> {t("owner_employees_create_employee")}
                    </button>
                  </form>
                )}
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
