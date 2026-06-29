"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { Sidebar } from "@/components/layout/Sidebar"
import { ThemeToggle } from "@/components/landing/ThemeToggle"
import { useLanguage } from "@/providers/LanguageProvider"
import { useNotifications } from "@/lib/notifications-store"
import { Monitor, ChartLineUp, Archive, Gear, Bell, Users } from "@phosphor-icons/react"

export function ManagerShell({ children }: { children: React.ReactNode }) {
  const { user, activeOrg, isLoading } = useAuth()
  const { currentAgency } = useMockData()
  const { unreadCount } = useNotifications()
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    if (isLoading) return
    if (!user || !activeOrg) {
      router.push("/login")
      return
    }
    if (activeOrg.role !== "manager") {
      if (activeOrg.role === "owner") router.push("/owner/dashboard")
      else router.push("/operator/select-station")
    }
  }, [user, activeOrg, isLoading, router])

  if (isLoading || !user || !activeOrg || activeOrg.role !== "manager") {
    return null
  }

  const agencyLabel = currentAgency ? currentAgency.name : activeOrg.org.name

  const navLinks = [
    { href: "/manager/dashboard", label: t("nav_live_monitor"), icon: Monitor },
    { href: "/manager/insights", label: t("nav_financial_insights"), icon: ChartLineUp },
    { href: "/manager/inventory", label: t("nav_inventory_ledger"), icon: Archive },
    { href: "/manager/subordinates", label: "Mes subordonnés", icon: Users },
    { href: "/manager/settings", label: t("nav_config_studio"), icon: Gear },
    { href: "/manager/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
  ]

  const toggleOnly = <ThemeToggle />

  return (
    <div className="min-h-[100dvh] flex bg-background">
      <Sidebar
        navLinks={navLinks}
        role="Responsable d'agence"
        orgId={agencyLabel}
        profileHref="/manager/profile"
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
