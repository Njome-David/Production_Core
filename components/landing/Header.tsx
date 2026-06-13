"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Buildings, CaretDown, Globe } from "@phosphor-icons/react"
import Link from "next/link"
import { ThemeToggle } from "./ThemeToggle"
import { useLanguage } from "./LanguageProvider"

type Language = "en" | "fr" | "es"

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
]

export function Header() {
  const [imageError, setImageError] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const currentLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0]

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 h-20 border-b border-border/30 bg-background/75 backdrop-blur-2xl z-50 px-6 md:px-12 flex items-center justify-between shadow-sm"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        {!imageError ? (
          <div className="h-10 w-auto flex items-center justify-start group-hover:scale-105 transition-transform origin-left">
            <img 
              src="/android-chrome-512x512.png" 
              alt="PROD_CORE Logo" 
              className="h-full w-auto object-contain rounded-xl"
              onError={() => setImageError(true)}
            />
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block ml-3">PROD_CORE</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Buildings weight="duotone" className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block">PROD_CORE</span>
          </div>
        )}
      </Link>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* Language Dropdown */}
        <div ref={langRef} className="relative">
          <button
            id="lang-switcher"
            onClick={() => setLangOpen(o => !o)}
            className="flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-mono tracking-widest font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase hidden sm:inline">{currentLang.code}</span>
            <motion.span
              animate={{ rotate: langOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <CaretDown className="w-3 h-3" />
            </motion.span>
          </button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-[calc(100%+8px)] w-44 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-[60] p-1"
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setLangOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      language === lang.code
                        ? "bg-foreground/10 text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {language === lang.code && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ThemeToggle />

        <Link href="/login">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 px-5 bg-foreground text-background text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            {t("header_signIn")}
          </motion.button>
        </Link>
      </div>
    </motion.header>
  )
}
