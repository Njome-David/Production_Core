"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { Sidebar, NavItem } from "@/components/layout/Sidebar"
import { ThemeToggle } from "@/components/landing/ThemeToggle"
import { useMockData } from "@/providers/MockFeedProductionProvider"

export function OperatorShell({ children }: { children: React.ReactNode }) {
  const { user, activeOrg, isLoading } = useAuth()
  const { currentAgency } = useMockData()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user || !activeOrg) {
      router.push("/login")
      return
    }
    if (activeOrg.role !== "operator") {
      if (activeOrg.role === "owner") router.push("/owner/dashboard")
      else router.push("/manager/dashboard")
    }
  }, [user, activeOrg, isLoading, router])

  if (isLoading || !user || !activeOrg || activeOrg.role !== "operator") {
    return null
  }

  const navLinks: NavItem[] = []

  const toggleOnly = <ThemeToggle />

  return (
    <div className="min-h-[100dvh] flex bg-background">
      <Sidebar
        navLinks={navLinks}
        role="Opérateur"
        orgId={currentAgency?.name ?? activeOrg.org.name}
        profileHref="/operator/profile"
        onSwitchOrg={() => router.push("/org-selector")}
        themeToggle={toggleOnly}
        userName={user.name}
      />
      <main className="flex-1 min-h-[100dvh] overflow-y-auto relative">
        {children}
      </main>
    </div>
  )
}
