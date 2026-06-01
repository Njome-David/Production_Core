"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { BuildingsIcon, ArrowRight, CaretDown } from "@phosphor-icons/react"
import { t, languages, type Language } from "@/lib/i18n"

export default function LoginPage() {
  const router = useRouter()
  const { setActiveSession } = useMockData()
  const { language, setLanguage } = useLanguage()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [email, setEmail] = useState("david@alpha-feed.com")
  const [password, setPassword] = useState("password")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mocking auth success
    router.push("/org-selector")
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-background">
      {/* Language Selector - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <div className="relative">
          <motion.button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="h-10 px-4 bg-background text-foreground border border-border rounded-md text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors"
            whileTap={{ scale: 0.97 }}
          >
            {languages[language]}
            <CaretDown weight="bold" className={`w-4 h-4 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
          </motion.button>

          {showLanguageMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-12 right-0 bg-background border border-border rounded-md shadow-lg overflow-hidden w-48 z-50"
            >
              {(Object.keys(languages) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang)
                    setShowLanguageMenu(false)
                  }}
                  className={`w-full px-4 py-3 text-sm text-left transition-colors ${
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
        </div>
      </div>

      {/* Left Asset Pane (50/50 Split) */}
      <div className="hidden md:flex flex-1 relative bg-card overflow-hidden items-end p-12">
        <div className="absolute inset-0 z-0">
          {/* We use a reliable abstract architectural image to replace the generic carpentry examples */}
          <img 
            src="/simon-kadula-8gr6bObQLOI-unsplash.jpg" 
            alt="Heavy Industrial Valves & Pipes" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-foreground leading-none mb-4">
              {t(language, 'precision-output')}<br/>{t(language, 'zero-waste')}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              {t(language, 'description')}
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
                <BuildingsIcon weight="duotone" className="w-12 h-12 text-primary" />
                <span className="font-display font-bold text-foreground tracking-tight text-xl">PRODUCTION_CORE</span>
              </div>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            .fallback-icon-svg { display: none; }
            .fallback-icon .fallback-icon-svg { display: block; }
          `}} />

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-display text-foreground font-bold tracking-tight">
                {isSignUp ? t(language, 'create-account') : t(language, 'access-gateway')}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isSignUp 
                  ? t(language, 'signup-subtitle')
                  : t(language, 'signin-subtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              {isSignUp && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">{t(language, 'full-name')}</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t(language, 'full-name-placeholder')}
                      className="h-11 px-4 bg-background text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" 
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">{t(language, 'company-name')}</label>
                    <input 
                      type="text" 
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={t(language, 'company-placeholder')}
                      className="h-11 px-4 bg-background text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" 
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">{t(language, 'email')}</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 px-4 bg-background text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">{t(language, 'password')}</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 px-4 bg-background text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="h-11 w-full bg-foreground text-background font-medium rounded-md flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors"
              >
                {isSignUp ? t(language, 'register') : t(language, 'sign-in')}
                <ArrowRight weight="bold" className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="h-11 w-full bg-background text-foreground border border-border font-medium rounded-md flex items-center justify-center gap-2 hover:bg-muted transition-colors"
              >
                {isSignUp ? t(language, 'already-have-account') : t(language, 'create-new-account')}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
