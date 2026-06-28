"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { Monitor, ChartLineUp, Archive, Gear } from "@phosphor-icons/react"

import { Sidebar } from "@/components/layout/Sidebar"
import { ThemeToggle } from "@/components/landing/ThemeToggle"
import { useLanguage } from "@/providers/LanguageProvider"

export function ManagerShell({ children }: { children: React.ReactNode }) {
  const { activeSession } = useMockData()
  const router = useRouter()

  useEffect(() => {
    if (!activeSession) {
      router.push("/login")
    } else if (activeSession.role !== "Manager") {
      router.push("/operator/select-station")
    }
  }, [activeSession, router])

  if (!activeSession || activeSession.role !== "Manager") {
    return null
  }

  const { t } = useLanguage()

  const navLinks = [
    { href: "/manager/dashboard", label: t("nav_live_monitor"), icon: Monitor },
    { href: "/manager/insights", label: t("nav_financial_insights"), icon: ChartLineUp },
    { href: "/manager/inventory", label: t("nav_inventory_ledger"), icon: Archive },
    { href: "/manager/settings", label: t("nav_config_studio"), icon: Gear },
  ]

  // Only show the toggle inside sidebar, not as a standalone widget
  const toggleOnly = <ThemeToggle />

  return (
    <div className="min-h-[100dvh] flex bg-background">
      <Sidebar
        navLinks={navLinks}
        role="Manager"
        orgId={activeSession.org_id}
        profileHref="/manager/profile"
        onSwitchOrg={() => router.push("/org-selector")}
        themeToggle={toggleOnly}
        userName="David Vance"
      />
      <main className="flex-1 min-h-[100dvh] overflow-y-auto">
        <div className="max-w-[1400px] mx-auto w-full p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
