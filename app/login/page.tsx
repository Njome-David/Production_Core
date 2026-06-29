"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/providers/AuthProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { BuildingsIcon, ArrowRight, House, Sparkle, Eye, EyeSlash } from "@phosphor-icons/react"

export default function LoginPage() {
  const router = useRouter()
  const { login, loginError, isLoading: authLoading, user, logout, orgs } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await login(email, password)
    setSubmitting(false)
    if (!ok) return

    // After successful login, check org count
    if (orgs.length === 0) {
      // Refetch
      return
    }
    if (orgs.length === 1) {
      const role = orgs[0].role
      if (role === "owner") router.push(`/owner/dashboard`)
      else if (role === "manager") router.push(`/manager/dashboard`)
      else router.push("/operator/select-station")
    } else {
      router.push("/org-selector")
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-background">
      {/* Back to landing */}
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted/60 backdrop-blur-sm"
      >
        <House weight="duotone" className="w-4 h-4" />
        <span className="font-medium hidden sm:inline">{t("login_home")}</span>
      </Link>

      {/* Left Asset Pane */}
      <div className="hidden md:flex flex-1 relative bg-card overflow-hidden items-end p-12">
        <div className="absolute inset-0 z-0">
          <img
            src="/simon-kadula-8gr6bObQLOI-unsplash.jpg"
            alt="Industrial valves"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/30 backdrop-blur-sm border border-border/50 mb-6 text-xs font-mono font-semibold text-muted-foreground">
              <Sparkle weight="fill" className="w-3 h-3 text-amber-400" />
              {t("login_pane_tag" as const)}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-foreground leading-none mb-4">
              {t("login_pane_title")}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              {t("login_pane_desc")}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Auth Pane */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-24 pt-5 pb-12">
        <motion.div
          className="w-full max-w-sm mx-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.1 }}
        >
          <div className="flex justify-center mb-12">
            <div className="w-48 h-16 flex items-center justify-center overflow-hidden relative rounded-2xl shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('fallback-icon'); }} />
              <div className="hidden fallback-icon-svg flex-col items-center gap-2 absolute inset-0 justify-center">
                <BuildingsIcon weight="duotone" className="w-12 h-12 text-foreground" />
                <span className="font-display font-bold text-foreground tracking-tight text-xl">{t("login_fallback_logo")}</span>
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            .fallback-icon-svg { display: none; }
            .fallback-icon .fallback-icon-svg { display: flex; }
          `}} />

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-display text-foreground font-bold tracking-tight">
                {t("login_title_signin")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t("login_desc_signin")}
              </p>
            </div>

            {/* Error */}
            {loginError && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5"
              >
                {loginError}
              </motion.p>
            )}

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">{t("login_label_email")}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david@alpha-feed.com"
                  autoComplete="email"
                  className="h-11 px-4 bg-background text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">{t("login_label_password")}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-11 w-full px-4 pr-11 bg-background text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
                className="h-11 w-full bg-foreground text-background font-medium rounded-md flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {t("login_btn_signin")}
                    <ArrowRight weight="bold" className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Link href="/register">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className="h-11 w-full bg-background text-foreground border border-border font-medium rounded-md flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                >
                  {t("login_btn_create")}
                </motion.button>
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
