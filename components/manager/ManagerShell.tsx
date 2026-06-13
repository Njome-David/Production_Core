"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { ChartLineUp, Monitor, Archive, Gear, UserSwitchIcon, BuildingOfficeIcon, House } from "@phosphor-icons/react"

import { ThemeToggle } from "@/components/landing/ThemeToggle"

export function ManagerShell({ children }: { children: React.ReactNode }) {
  const { activeSession, setActiveSession } = useMockData()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!activeSession) {
      router.push("/login")
    } else if (activeSession.role !== "Manager") {
      router.push("/operator/select-station")
    }
  }, [activeSession, router])

  if (!activeSession || activeSession.role !== "Manager") {
    return null // or a skeleton loader
  }

  const navLinks = [
    { href: "/manager/dashboard", label: "Live Monitor", icon: Monitor },
    { href: "/manager/insights", label: "Financial Insights", icon: ChartLineUp },
    { href: "/manager/inventory", label: "Inventory Ledger", icon: Archive },
    { href: "/manager/settings", label: "Config Studio", icon: Gear },
  ]

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
            {/* Back to Landing */}
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
            >
              <House weight="duotone" className="w-4 h-4" />
              <span className="hidden md:inline font-medium">Landing</span>
            </Link>

            <div className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
              <BuildingOfficeIcon weight="duotone" className="w-6 h-6 text-primary" />
              <span className="text-muted-foreground font-normal text-sm">PROD_CORE</span>
              <span className="text-foreground ml-2 text-sm border-l border-border/50 pl-2">
                {activeSession.org_id.toUpperCase()}
              </span>
            </div>
          </div>
            
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <link.icon weight={isActive ? "fill" : "regular"} className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              Manager Mode
            </div>
            <ThemeToggle />
            <button 
              onClick={() => {
                router.push("/org-selector")
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted"
            >
              <UserSwitchIcon className="w-4 h-4" />
              Switch
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-[1400px] mx-auto w-full p-6">
        {children}
      </main>
    </div>
  )
}
