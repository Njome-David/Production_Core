"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, LockOpen, UserCircle, ArrowsLeftRight } from "@phosphor-icons/react"
import { useLanguage } from "@/providers/LanguageProvider"

export interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
}

interface SidebarProps {
  navLinks: NavItem[]
  role: string
  orgId: string
  profileHref: string
  onSwitchOrg: () => void
  themeToggle: React.ReactNode
  userName?: string
}

const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 64

export function Sidebar({
  navLinks,
  role,
  orgId,
  profileHref,
  onSwitchOrg,
  themeToggle,
  userName = "User",
}: SidebarProps) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar_collapsed")
      return stored !== null ? stored === "true" : true
    }
    return true
  })
  const [isHovered, setIsHovered] = useState(false)

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem("sidebar_collapsed", String(next))
  }

  const effectiveWidth = isCollapsed && !isHovered ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  return (
    <>
      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ width: effectiveWidth }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-[100dvh] z-40 flex flex-col bg-card border-r border-border/50 shadow-sm"
      >
        {/* Org identity */}
        <div className={`flex items-center h-16 shrink-0 border-b border-border/50 ${effectiveWidth > SIDEBAR_COLLAPSED + 20 ? 'gap-3 px-4' : 'justify-center'}`}>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-mono font-bold text-primary uppercase">
              {orgId.substring(4, 6)}
            </span>
          </div>
          <AnimatePresence initial={false}>
            {effectiveWidth > SIDEBAR_COLLAPSED + 20 && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xs font-mono font-bold text-foreground truncate whitespace-nowrap overflow-hidden"
              >
                {orgId.toUpperCase()}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center py-2.5 rounded-xl transition-all duration-200 group relative ${effectiveWidth > SIDEBAR_COLLAPSED + 20 ? 'gap-3 px-3' : 'justify-center px-0'} ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="relative shrink-0">
                  <link.icon
                    weight={isActive ? "fill" : "regular"}
                    className="w-5 h-5"
                  />
                  {link.badge && link.badge > 0 && effectiveWidth <= SIDEBAR_COLLAPSED + 20 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-card" />
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {effectiveWidth > SIDEBAR_COLLAPSED + 20 && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-2"
                    >
                      {link.label}
                      {link.badge && link.badge > 0 && (
                        <span className="w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center shrink-0">
                          {link.badge > 9 ? "9+" : link.badge}
                        </span>
                      )}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        {/* Switch org button */}
        <div className="px-3 mb-1">
          <button
            onClick={onSwitchOrg}
            className={`w-full flex items-center py-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 text-sm ${effectiveWidth > SIDEBAR_COLLAPSED + 20 ? 'gap-3 px-3' : 'justify-center px-0'}`}
          >
            <ArrowsLeftRight className="w-5 h-5 shrink-0" />
            <AnimatePresence initial={false}>
              {effectiveWidth > SIDEBAR_COLLAPSED + 20 && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="whitespace-nowrap"
                >
                  {t("sidebar_switch_org")}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Bottom section: profile + collapse */}
        <div className="border-t border-border/50 p-3 flex flex-col gap-2">
          {/* Profile */}
          <Link
            href={profileHref}
            className={`flex items-center py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground ${effectiveWidth > SIDEBAR_COLLAPSED + 20 ? 'gap-3 px-3' : 'justify-center px-0'} ${
              pathname === profileHref ? "bg-primary/10 text-primary" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <UserCircle weight="duotone" className="w-5 h-5" />
            </div>
            <AnimatePresence initial={false}>
              {effectiveWidth > SIDEBAR_COLLAPSED + 20 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col min-w-0"
                >
                  <span className="text-sm font-medium text-foreground truncate">{userName}</span>
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">{role}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Theme toggle + notifications + lock row — only when expanded */}
          {effectiveWidth > SIDEBAR_COLLAPSED + 20 && (
            <div className="flex items-center gap-1 px-1">
              <div className="flex-1">{themeToggle}</div>
              <button
                onClick={toggleCollapse}
                className="flex items-center gap-1.5 p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-xs font-medium"
              >
                {isCollapsed ? (
                  <><Lock className="w-4 h-4" /><span>{t("sidebar_lock")}</span></>
                ) : (
                  <><LockOpen className="w-4 h-4" /><span>{t("sidebar_unlock")}</span></>
                )}
              </button>
            </div>
          )}
          
          {/* Show just the notification bell when collapsed */}
          {effectiveWidth <= SIDEBAR_COLLAPSED + 20 && (
            <div className="flex justify-center mt-2" />
          )}
        </div>
      </motion.aside>

      {/* Spacer for main content */}
      <div style={{ width: effectiveWidth }} className="shrink-0 transition-all duration-200" />
    </>
  )
}