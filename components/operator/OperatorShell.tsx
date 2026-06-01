"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { t, languages, type Language } from "@/lib/i18n"
import { UserSwitchIcon, FactoryIcon, CaretDown } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"

export function OperatorShell({ children }: { children: React.ReactNode }) {
  const { activeSession, setActiveSession } = useMockData()
  const { language, setLanguage } = useLanguage()
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
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
              {t(language, 'operator-mode')}
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
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  )
}
