"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Buildings, CaretDown, Globe, List, X, PresentationChart, FolderOpen, DeviceTablet, ShieldCheck, Article, BookOpenText, Headset, Info, Envelope } from "@phosphor-icons/react"
import Link from "next/link"

import { useLanguage } from "@/providers/LanguageProvider"
import { ThemeToggle } from "./ThemeToggle"

type Language = "en" | "fr" | "es"

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
]

export function Header() {
  const [imageError, setImageError] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const solutionsRef = useRef<HTMLDivElement>(null)
  const resourcesRef = useRef<HTMLDivElement>(null)
  const companyRef = useRef<HTMLDivElement>(null)
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
      if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) setSolutionsOpen(false)
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) setResourcesOpen(false)
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) setCompanyOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const currentLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0]

  const SOLUTIONS = [
    { icon: PresentationChart, label: t("header_solution_dash"), href: "#showcase", desc: t("header_solution_dash_desc") },
    { icon: FolderOpen, label: t("header_solution_inv"), href: "#features", desc: t("header_solution_inv_desc") },
    { icon: DeviceTablet, label: t("header_solution_tablet"), href: "#features", desc: t("header_solution_tablet_desc") },
    { icon: ShieldCheck, label: t("header_solution_gates"), href: "#products", desc: t("header_solution_gates_desc") },
  ]

  const RESOURCES = [
    { icon: Article, label: t("header_resource_blog"), href: "#", desc: t("header_resource_blog_desc") },
    { icon: BookOpenText, label: t("header_resource_docs"), href: "#", desc: t("header_resource_docs_desc") },
    { icon: Headset, label: t("header_resource_support"), href: "#", desc: t("header_resource_support_desc") },
  ]

  const COMPANY = [
    { icon: Info, label: t("header_company_about"), href: "#", desc: t("header_company_about_desc") },
    { icon: Envelope, label: t("header_company_contact"), href: "#", desc: t("header_company_contact_desc") },
  ]

  return (
    <div className="relative">
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 h-20 border-b border-border bg-background/80 backdrop-blur-2xl z-50 px-6 md:px-12 flex items-center justify-between shadow-sm"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group shrink-0">
        {!imageError ? (
          <div className="flex items-center gap-3 group-hover:scale-105 transition-transform origin-left">
            <img
              src="/android-chrome-512x512.png"
              alt="PROD_CORE Logo"
              className="h-10 w-auto rounded-xl"
              onError={() => setImageError(true)}
            />
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block text-foreground">PROD_CORE</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Buildings weight="duotone" className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block text-foreground">PROD_CORE</span>
          </div>
        )}
      </Link>

      {/* Desktop Nav Tabs ─ center (shifted left for i18n room) */}
      <nav className="hidden lg:flex items-center gap-0 absolute left-[calc(50%-2rem)] -translate-x-1/2">
        <Link
          href="/#showcase"
          className="h-10 px-3 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center"
        >
          {t("header_why")}
        </Link>

        {/* Solutions dropdown */}
        <div ref={solutionsRef} className="relative">
          <button
            onClick={() => { setSolutionsOpen(o => !o); setResourcesOpen(false); setCompanyOpen(false) }}
            className="h-10 px-3 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
          >
            {t("header_solutions")} <CaretDown weight="bold" className={`w-3 h-3 transition-transform ${solutionsOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {solutionsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-2"
              >
                {SOLUTIONS.map((s, i) => (
                  <Link
                    key={i}
                    href={"/" + s.href}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left hover:bg-muted transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                      <s.icon weight="duotone" className="w-5 h-5 text-muted-foreground group-hover:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.desc}</div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link
          href="/#features"
          className="h-10 px-3 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center"
        >
          {t("header_features")}
        </Link>

        <Link
          href="/pricing"
          className="h-10 px-3 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center"
        >
          {t("header_pricing")}
        </Link>

        {/* Resources dropdown */}
        <div ref={resourcesRef} className="relative">
          <button
            onClick={() => { setResourcesOpen(o => !o); setSolutionsOpen(false); setCompanyOpen(false) }}
            className="h-10 px-4 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
          >
            {t("header_resources")} <CaretDown weight="bold" className={`w-3 h-3 transition-transform ${resourcesOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {resourcesOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-2"
              >
                {RESOURCES.map((r, i) => (
                  <Link
                    key={i}
                    href={r.href}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left hover:bg-muted transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center shrink-0 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all">
                      <r.icon weight="duotone" className="w-5 h-5 text-muted-foreground group-hover:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.desc}</div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Company dropdown */}
        <div ref={companyRef} className="relative">
          <button
            onClick={() => { setCompanyOpen(o => !o); setSolutionsOpen(false); setResourcesOpen(false) }}
            className="h-10 px-4 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
          >
            {t("header_company")} <CaretDown weight="bold" className={`w-3 h-3 transition-transform ${companyOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {companyOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-2"
              >
                {COMPANY.map((c, i) => (
                  <Link
                    key={i}
                    href={c.href}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left hover:bg-muted transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center shrink-0 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-all">
                      <c.icon weight="duotone" className="w-5 h-5 text-muted-foreground group-hover:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{c.label}</div>
                      <div className="text-xs text-muted-foreground">{c.desc}</div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Language Dropdown */}
        <div ref={langRef} className="relative hidden sm:block">
          <button
            id="lang-switcher"
            onClick={() => setLangOpen(o => !o)}
            className="flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-mono tracking-widest font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase hidden sm:inline">{currentLang.code}</span>
            <motion.span animate={{ rotate: langOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
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
                        ? "bg-muted text-foreground font-semibold"
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

        <div className="hidden sm:flex items-center text-foreground/70 hover:text-foreground">
          <ThemeToggle />
        </div>

        <Link href="/login" className="hidden sm:block">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 px-5 bg-primary text-primary-foreground text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            {t("header_signIn")}
          </motion.button>
        </Link>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="lg:hidden h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          {mobileOpen ? <X weight="bold" className="w-5 h-5" /> : <List weight="bold" className="w-5 h-5" />}
        </button>
      </div>
    </motion.header>

    {/* Mobile Menu (outside header to avoid transform stacking context breaking position:fixed) */}
    <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-20 left-0 right-0 bottom-0 bg-background border-t border-border lg:hidden z-50 overflow-y-auto"
        >
          <div className="p-6 flex flex-col gap-1">
            <Link href="/#showcase" onClick={() => setMobileOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted transition-all font-medium block">{t("header_why")}</Link>
            <div className="px-4 py-3 text-muted-foreground text-xs font-mono tracking-widest uppercase">{t("header_solutions")}</div>
            {SOLUTIONS.map((s, i) => (
              <Link key={i} href={"/" + s.href} onClick={() => setMobileOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted transition-all flex items-center gap-3 text-sm">
                <s.icon weight="duotone" className="w-4 h-4 text-muted-foreground" /> {s.label}
              </Link>
            ))}
            <Link href="/#features" onClick={() => setMobileOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted transition-all font-medium mt-2 block">{t("header_features")}</Link>
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted transition-all font-medium block">{t("header_pricing")}</Link>
            <div className="px-4 py-3 text-muted-foreground text-xs font-mono tracking-widest uppercase mt-2">{t("header_resources")}</div>
            {RESOURCES.map((r, i) => (
              <Link key={i} href={r.href} className="w-full text-left px-4 py-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted transition-all flex items-center gap-3 text-sm"
              onClick={() => setMobileOpen(false)}>
                <r.icon weight="duotone" className="w-4 h-4 text-muted-foreground" /> {r.label}
              </Link>
            ))}
            <div className="px-4 py-3 text-muted-foreground text-xs font-mono tracking-widest uppercase mt-2">{t("header_company")}</div>
            {COMPANY.map((c, i) => (
              <Link key={i} href={c.href} className="w-full text-left px-4 py-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-muted transition-all flex items-center gap-3 text-sm"
              onClick={() => setMobileOpen(false)}>
                <c.icon weight="duotone" className="w-4 h-4 text-muted-foreground" /> {c.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3 px-2">
              <div className="flex justify-center py-2 text-foreground/70 hover:text-foreground">
                <ThemeToggle />
              </div>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-full">{t("header_signIn")}</button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)
}
