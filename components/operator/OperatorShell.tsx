"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { Sidebar, NavItem } from "@/components/layout/Sidebar"
import { ThemeToggle } from "@/components/landing/ThemeToggle"

export function OperatorShell({ children }: { children: React.ReactNode }) {
  const { activeSession } = useMockData()
  const router = useRouter()

  useEffect(() => {
    if (!activeSession) {
      router.push("/login")
    } else if (activeSession.role !== "Operator") {
      router.push("/manager/dashboard")
    }
  }, [activeSession, router])

  if (!activeSession || activeSession.role !== "Operator") {
    return null
  }

  const navLinks: NavItem[] = []

  const toggleOnly = <ThemeToggle />

  return (
    <div className="min-h-[100dvh] flex bg-background">
      <Sidebar
        navLinks={navLinks}
        role="Operator"
        orgId={activeSession.org_id}
        profileHref="/operator/profile"
        onSwitchOrg={() => router.push("/org-selector")}
        themeToggle={toggleOnly}
        userName="Operator"
      />
      <main className="flex-1 min-h-[100dvh] overflow-y-auto relative">
        {children}
      </main>
    </div>
  )
}
