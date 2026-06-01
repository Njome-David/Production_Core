"use client"

import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { t, languages, type Language } from "@/lib/i18n"
import { ChartLineUp, Monitor, Archive, Gear, UserSwitchIcon, BuildingOfficeIcon, CaretDown } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"

export function ManagerShell({ children }: { children: React.ReactNode }) {
  const { activeSession, setActiveSession } = useMockData()
  const { language, setLanguage } = useLanguage()
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
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
    { href: "/manager/dashboard", key: "live-monitor", label: "Live Monitor", icon: Monitor },
    { href: "/manager/insights", key: "financial-insights", label: "Financial Insights", icon: ChartLineUp },
    { href: "/manager/inventory", key: "inventory-ledger", label: "Inventory Ledger", icon: Archive },
    { href: "/manager/settings", key: "config-studio", label: "Config Studio", icon: Gear },
  ]

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
              <BuildingOfficeIcon weight="duotone" className="w-6 h-6 text-primary" />
              <span className="text-muted-foreground font-normal text-sm">PROD_CORE</span>
              <span className="text-foreground ml-2 text-sm border-l border-border/50 pl-2">
                {activeSession.org_id.toUpperCase()}
              </span>
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
                    {t(language, link.key)}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              {t(language, 'manager-mode')}
            </div>

            {/* Language Dropdown in Header */}
            <div className="relative">
              <motion.button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="h-9 px-3 bg-background text-foreground border border-border/55 rounded-md text-xs font-medium flex items-center gap-1.5 hover:bg-muted transition-colors"
                whileTap={{ scale: 0.97 }}
              >
                {languages[language]}
                <CaretDown weight="bold" className={`w-3.5 h-3.5 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-11 right-0 bg-background border border-border rounded-md shadow-lg overflow-hidden w-36 z-50"
                  >
                    {(Object.keys(languages) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang)
                          setShowLanguageMenu(false)
                        }}
                        className={`w-full px-3 py-2 text-xs text-left transition-colors ${
                          language === lang
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {languages[lang]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => {
                router.push("/org-selector")
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted"
            >
              <UserSwitchIcon className="w-4 h-4" />
              {t(language, 'switch')}
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
