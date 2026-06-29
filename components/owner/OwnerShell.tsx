"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { Sidebar } from "@/components/layout/Sidebar"
import { ThemeToggle } from "@/components/landing/ThemeToggle"
import { useLanguage } from "@/providers/LanguageProvider"
import {
  Buildings,
  Users,
  ChartLineUp,
  Handshake,
  Package,
  ShieldCheck,
  Briefcase,
} from "@phosphor-icons/react"

export function OwnerShell({ children }: { children: React.ReactNode }) {
  const { user, activeOrg, isLoading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    if (isLoading) return
    if (!user || !activeOrg) {
      router.push("/login")
      return
    }
    if (activeOrg.role !== "owner") {
      if (activeOrg.role === "manager") router.push("/manager/dashboard")
      else router.push("/operator/select-station")
    }
  }, [user, activeOrg, isLoading, router])

  if (isLoading || !user || !activeOrg || activeOrg.role !== "owner") {
    return null
  }

  const navLinks = [
    { href: "/owner/dashboard", label: t("nav_live_monitor") || "Dashboard", icon: Briefcase },
    { href: "/owner/agencies", label: "Mes agences", icon: Buildings },
    { href: "/owner/employees", label: "Mes employés", icon: Users },
    { href: "/owner/statistics", label: "Statistiques", icon: ChartLineUp },
    { href: "/owner/third-parties", label: "Mes tiers", icon: Handshake },
    { href: "/owner/products", label: "Mes produits", icon: Package },
    { href: "/owner/roles", label: "Rôles", icon: ShieldCheck },
  ]

  const toggleOnly = <ThemeToggle />

  return (
    <div className="min-h-[100dvh] flex bg-background">
      <Sidebar
        navLinks={navLinks}
        role="Chef d'entreprise"
        orgId={activeOrg.org.id}
        profileHref="/owner/profile"
        onSwitchOrg={() => router.push("/org-selector")}
        themeToggle={toggleOnly}
        userName={user.name}
      />
      <main className="flex-1 min-h-[100dvh] overflow-y-auto">
        <div className="max-w-[1400px] mx-auto w-full p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
