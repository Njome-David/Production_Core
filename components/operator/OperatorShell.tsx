"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { UserSwitchIcon, FactoryIcon, House } from "@phosphor-icons/react"

import { ThemeToggle } from "@/components/landing/ThemeToggle"

export function OperatorShell({ children }: { children: React.ReactNode }) {
  const { activeSession, setActiveSession } = useMockData()
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

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back to Landing */}
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
            >
              <House weight="duotone" className="w-4 h-4" />
              <span className="hidden md:inline font-medium">Landing</span>
            </Link>

            <div className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
              <FactoryIcon weight="duotone" className="w-6 h-6 text-primary" />
              <span className="text-muted-foreground font-normal text-sm">PROD_CORE FLOOR</span>
              <span className="text-foreground ml-2 text-sm border-l border-border/50 pl-2">
                {activeSession.org_id.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
              Operator Mode
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
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  )
}
