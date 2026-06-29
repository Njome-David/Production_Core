"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authenticate, getUserById, type AuthResult } from "@/lib/auth"
import { INITIAL_ORGANIZATIONS, INITIAL_AGENCIES, INITIAL_EMPLOYEES } from "@/lib/mock-db"
import type { User, Organization, Agency, AppRole } from "@/lib/types"

export interface OrgContext {
  org: Organization
  role: AppRole
  agencies: Agency[]
}

interface AuthContextType {
  user: User | null
  orgs: OrgContext[]
  activeOrg: OrgContext | null
  isLoading: boolean
  loginError: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  selectOrg: (orgId: string, agencyId?: string) => void
  selectAgency: (agencyId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "prod_core_session"

interface PersistedSession {
  userId: string
  activeOrgId: string | null
  activeAgencyId: string | null
}

function persistSession(data: PersistedSession) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

function loadSession(): PersistedSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(() => {
    const saved = loadSession()
    if (!saved) return null
    return getUserById(saved.userId) ?? null
  })
  const [orgs, setOrgs] = useState<OrgContext[]>(() => {
    const saved = loadSession()
    if (!saved) return []
    const u = getUserById(saved.userId)
    return u ? buildOrgContexts(u.id) : []
  })
  const [activeOrg, setActiveOrg] = useState<OrgContext | null>(() => {
    const saved = loadSession()
    if (!saved?.activeOrgId) return null
    const u = getUserById(saved.userId)
    if (!u) return null
    const ctx = buildOrgContexts(u.id)
    return ctx.find((o) => o.org.id === saved.activeOrgId) ?? null
  })
  const [isLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoginError(null)
    const result = authenticate(email, password)
    if ("error" in result) {
      setLoginError(result.error)
      return false
    }
    const { user: u, orgs: raw } = result as AuthResult
    setUser(u)

    const ctx: OrgContext[] = raw.map((r) => ({
      org: r.org,
      role: r.role,
      agencies: r.agencies,
    }))
    setOrgs(ctx)

    // If only one org, auto-select it
    if (ctx.length === 1) {
      const first = ctx[0]
      setActiveOrg(first)
      persistSession({ userId: u.id, activeOrgId: first.org.id, activeAgencyId: null })
    } else {
      persistSession({ userId: u.id, activeOrgId: null, activeAgencyId: null })
    }
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setOrgs([])
    setActiveOrg(null)
    clearSession()
    router.push("/login")
  }, [router])

  const selectOrg = useCallback((orgId: string, agencyId?: string) => {
    const matched = orgs.find((o) => o.org.id === orgId)
    if (!matched) return
    setActiveOrg(matched)
    persistSession({ userId: user!.id, activeOrgId: orgId, activeAgencyId: agencyId ?? null })

    if (agencyId) {
      redirectByRole(matched.role, matched.org.id, agencyId, router)
    } else {
      redirectByRole(matched.role, matched.org.id, undefined, router)
    }
  }, [orgs, user, router])

  const selectAgency = useCallback((agencyId: string) => {
    if (!activeOrg) return
    persistSession({ userId: user!.id, activeOrgId: activeOrg.org.id, activeAgencyId: agencyId })
    const agency = activeOrg.agencies.find((a) => a.id === agencyId)
    if (agency) {
      setActiveOrg({ ...activeOrg, agencies: [agency] })
    }
    redirectByRole(activeOrg.role, activeOrg.org.id, agencyId, router)
  }, [activeOrg, user, router])

  return (
    <AuthContext.Provider value={{
      user,
      orgs,
      activeOrg,
      isLoading,
      loginError,
      login,
      logout,
      selectOrg,
      selectAgency,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

// ── Helpers ──────────────────────────────────────

function buildOrgContexts(userId: string): OrgContext[] {
  const result: OrgContext[] = []

  // Owner of orgs
  const owned = INITIAL_ORGANIZATIONS.filter((o) => o.ownerId === userId)
  for (const org of owned) {
    const agencies = INITIAL_AGENCIES.filter((a) => a.orgId === org.id && a.status === "active")
    if (!result.some((r) => r.org.id === org.id)) {
      result.push({ org, role: "owner", agencies })
    }
  }

  // Employee
  const emps = INITIAL_EMPLOYEES.filter((e) => e.userId === userId)
  for (const emp of emps) {
    const org = INITIAL_ORGANIZATIONS.find((o) => o.id === emp.orgId)
    if (!org || result.some((r) => r.org.id === org.id)) continue
    const agencies = INITIAL_AGENCIES.filter((a) => a.id === emp.agencyId && a.status === "active")
    result.push({ org, role: emp.role as AppRole, agencies })
  }

  return result
}

function redirectByRole(role: AppRole, orgId: string, agencyId?: string, router?: ReturnType<typeof useRouter>) {
  if (!router) return
  switch (role) {
    case "owner":
      router.push("/owner/dashboard")
      break
    case "manager":
      router.push("/manager/dashboard")
      break
    case "operator":
      if (agencyId) {
        router.push("/operator/select-station")
      } else {
        router.push("/operator/select-station")
      }
      break
  }
}
