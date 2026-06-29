// lib/auth.ts

import {
  INITIAL_USERS,
  INITIAL_ORGANIZATIONS,
  INITIAL_AGENCIES,
  INITIAL_EMPLOYEES,
  INITIAL_SUBSCRIPTIONS,
} from "./mock-db"
import type { User, Organization, Agency, AppRole } from "./types"

export interface AuthResult {
  user: User
  orgs: { org: Organization; role: AppRole; agencies: Agency[] }[]
}

function findUser(email: string, password: string): User | null {
  return INITIAL_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  ) ?? null
}

function getOrgsForUser(userId: string): { org: Organization; role: AppRole; agencies: Agency[] }[] {
  const results: { org: Organization; role: AppRole; agencies: Agency[] }[] = []

  // Check if user is owner of any orgs
  const ownedOrgs = INITIAL_ORGANIZATIONS.filter((o) => o.ownerId === userId)
  for (const org of ownedOrgs) {
    const agencies = INITIAL_AGENCIES.filter((a) => a.orgId === org.id)
    results.push({ org, role: "owner", agencies })
  }

  // Check if user is an employee (manager/operator) in any org
  const employees = INITIAL_EMPLOYEES.filter((e) => e.userId === userId)
  for (const emp of employees) {
    const org = INITIAL_ORGANIZATIONS.find((o) => o.id === emp.orgId)
    if (!org) continue
    // Only add if not already added as owner of this org
    if (results.some((r) => r.org.id === org.id)) continue
    const agencies = INITIAL_AGENCIES.filter((a) => a.orgId === org.id && emp.agencyId === a.id)
    results.push({ org, role: emp.role as AppRole, agencies })
  }

  return results
}

export function authenticate(email: string, password: string): AuthResult | { error: string } {
  const user = findUser(email, password)
  if (!user) {
    return { error: "Email ou mot de passe incorrect" }
  }
  const orgs = getOrgsForUser(user.id)
  return { user, orgs }
}

export function getUserById(id: string): User | undefined {
  return INITIAL_USERS.find((u) => u.id === id)
}

export function createOrganization(
  ownerId: string,
  data: {
    name: string
    industry: string
    country: string
    currency?: string
    phone?: string
    address?: string
    plan: "starter" | "professional" | "enterprise"
    billing: "monthly" | "annual"
  }
): { org: Organization; agency: Agency; subscription: (typeof INITIAL_SUBSCRIPTIONS)[number] } {
  const orgId = `org_${data.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`
  const agencyId = `agence_${data.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_default`

  const org: Organization = {
    id: orgId,
    name: data.name,
    industry: data.industry,
    country: data.country,
    currency: data.currency || "XAF",
    ownerId,
    subscriptionPlan: data.plan,
    subscriptionStatus: "active",
    createdAt: new Date().toISOString(),
  }

  const agency: Agency = {
    id: agencyId,
    orgId,
    name: `Agence Principale`,
    managerId: undefined,
    isFabricationPoint: true,
    isSalesPoint: true,
    address: data.address,
    city: data.country,
    status: "active",
    createdAt: new Date().toISOString(),
  }

  const now = new Date()
  const endDate = new Date(now)
  if (data.billing === "annual") {
    endDate.setFullYear(endDate.getFullYear() + 1)
  } else {
    endDate.setMonth(endDate.getMonth() + 1)
  }

  const subscription = {
    id: `sub_${orgId}`,
    orgId,
    plan: data.plan,
    billing: data.billing,
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    status: "active" as const,
    paymentMethod: "•••• 4242",
  }

  return { org, agency, subscription }
}

export function createEmployeeAccount(
  orgId: string,
  data: {
    name: string
    email: string
    phone: string
    jobTitle: string
    role: string
    agencyId: string
  }
): { user: User; password: string } {
  const tempPassword = Math.random().toString(36).slice(2, 10)
  const userId = `usr_${data.email.split("@")[0].toLowerCase()}_${Date.now()}`

  const user: User = {
    id: userId,
    name: data.name,
    email: data.email,
    password: tempPassword,
    phone: data.phone,
    jobTitle: data.jobTitle,
    status: "active",
  }

  return { user, password: tempPassword }
}
