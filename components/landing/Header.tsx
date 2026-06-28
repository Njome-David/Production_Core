"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Buildings, CaretDown, Globe, List, X, PresentationChart, FolderOpen, DeviceTablet, ShieldCheck, Article, BookOpenText, Headset, Info, Envelope } from "@phosphor-icons/react"
import Link from "next/link"

import { useLanguage } from "@/providers/LanguageProvider"

type Language = "en" | "fr" | "es"

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
]

const SOLUTIONS = [
  { icon: PresentationChart, label: "Executive Dashboard", href: "#showcase", desc: "Live financials & KPIs" },
  { icon: FolderOpen, label: "Inventory & BOM", href: "#features", desc: "Materials & routing" },
  { icon: DeviceTablet, label: "Operator Tablet", href: "#features", desc: "Factory floor interface" },
  { icon: ShieldCheck, label: "Quality Gates", href: "#products", desc: "QC checkpoints" },
]

const RESOURCES = [
  { icon: Article, label: "Blog", href: "#", desc: "Articles & updates" },
  { icon: BookOpenText, label: "Documentation", href: "#", desc: "Guides & API" },
  { icon: Headset, label: "Support", href: "#", desc: "Help center" },
]

const COMPANY = [
  { icon: Info, label: "About", href: "#", desc: "Our mission" },
  { icon: Envelope, label: "Contact", href: "#", desc: "Get in touch" },
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

  return (
    <div className="relative">
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 h-20 border-b border-white/10 bg-[#0B0E11]/80 backdrop-blur-2xl z-50 px-6 md:px-12 flex items-center justify-between shadow-sm"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group shrink-0">
        {!imageError ? (
          <div className="flex items-center gap-3 group-hover:scale-105 transition-transform origin-left">
            <img
              src="/android-chrome-512x512.png"
              alt="PROD_CORE Logo"
              className="h-10 w-auto"
              onError={() => setImageError(true)}
            />
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block text-white">PROD_CORE</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-[#0B0E11] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Buildings weight="duotone" className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block text-white">PROD_CORE</span>
          </div>
        )}
      </Link>

      {/* Desktop Nav Tabs ─ center (shifted left for i18n room) */}
      <nav className="hidden lg:flex items-center gap-0 absolute left-[calc(50%-2rem)] -translate-x-1/2">
        <Link
          href="/#showcase"
          className="h-10 px-3 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center"
        >
          {t("header_why")}
        </Link>

        {/* Solutions dropdown */}
        <div ref={solutionsRef} className="relative">
          <button
            onClick={() => { setSolutionsOpen(o => !o); setResourcesOpen(false); setCompanyOpen(false) }}
            className="h-10 px-3 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
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
                className="absolute left-0 top-full mt-2 w-72 bg-[#14181C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2"
              >
                {SOLUTIONS.map((s, i) => (
                  <Link
                    key={i}
                    href={"/" + s.href}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left hover:bg-white/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                      <s.icon weight="duotone" className="w-5 h-5 text-white/40 group-hover:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{s.label}</div>
                      <div className="text-xs text-white/40">{s.desc}</div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link
          href="/#features"
          className="h-10 px-3 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center"
        >
          {t("header_features")}
        </Link>

        <Link
          href="/pricing"
          className="h-10 px-3 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center"
        >
          {t("header_pricing")}
        </Link>

        {/* Resources dropdown */}
        <div ref={resourcesRef} className="relative">
          <button
            onClick={() => { setResourcesOpen(o => !o); setSolutionsOpen(false); setCompanyOpen(false) }}
            className="h-10 px-4 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
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
                className="absolute left-0 top-full mt-2 w-64 bg-[#14181C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2"
              >
                {RESOURCES.map((r, i) => (
                  <Link
                    key={i}
                    href={r.href}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left hover:bg-white/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all">
                      <r.icon weight="duotone" className="w-5 h-5 text-white/40 group-hover:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{r.label}</div>
                      <div className="text-xs text-white/40">{r.desc}</div>
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
            className="h-10 px-4 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
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
                className="absolute left-0 top-full mt-2 w-56 bg-[#14181C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2"
              >
                {COMPANY.map((c, i) => (
                  <Link
                    key={i}
                    href={c.href}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left hover:bg-white/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-all">
                      <c.icon weight="duotone" className="w-5 h-5 text-white/40 group-hover:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{c.label}</div>
                      <div className="text-xs text-white/40">{c.desc}</div>
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
            className="flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-mono tracking-widest font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all"
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
                className="absolute right-0 top-[calc(100%+8px)] w-44 bg-[#14181C] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-[60] p-1"
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setLangOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      language === lang.code
                        ? "bg-white/10 text-white font-semibold"
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {language === lang.code && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href="/login" className="hidden sm:block">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 px-5 bg-white text-[#0B0E11] text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            {t("header_signIn")}
          </motion.button>
        </Link>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="lg:hidden h-10 w-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all"
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
          className="fixed top-20 left-0 right-0 bottom-0 bg-[#0B0E11] border-t border-white/10 lg:hidden z-50 overflow-y-auto"
        >
          <div className="p-6 flex flex-col gap-1">
            <Link href="/#showcase" onClick={() => setMobileOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all font-medium block">{t("header_why")}</Link>
            <div className="px-4 py-3 text-white/40 text-xs font-mono tracking-widest uppercase">{t("header_solutions")}</div>
            {SOLUTIONS.map((s, i) => (
              <Link key={i} href={"/" + s.href} onClick={() => setMobileOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-3 text-sm">
                <s.icon weight="duotone" className="w-4 h-4 text-white/40" /> {s.label}
              </Link>
            ))}
            <Link href="/#features" onClick={() => setMobileOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all font-medium mt-2 block">{t("header_features")}</Link>
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="w-full text-left px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all font-medium block">{t("header_pricing")}</Link>
            <div className="px-4 py-3 text-white/40 text-xs font-mono tracking-widest uppercase mt-2">{t("header_resources")}</div>
            {RESOURCES.map((r, i) => (
              <Link key={i} href={r.href} className="w-full text-left px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-3 text-sm"
              onClick={() => setMobileOpen(false)}>
                <r.icon weight="duotone" className="w-4 h-4 text-white/40" /> {r.label}
              </Link>
            ))}
            <div className="px-4 py-3 text-white/40 text-xs font-mono tracking-widest uppercase mt-2">{t("header_company")}</div>
            {COMPANY.map((c, i) => (
              <Link key={i} href={c.href} className="w-full text-left px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-3 text-sm"
              onClick={() => setMobileOpen(false)}>
                <c.icon weight="duotone" className="w-4 h-4 text-white/40" /> {c.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3 px-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full h-12 bg-white text-[#0B0E11] font-semibold rounded-full">{t("header_signIn")}</button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)
}
