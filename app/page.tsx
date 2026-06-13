"use client"

import { Header } from "@/components/landing/Header"
import { HeroSection } from "@/components/landing/HeroSection"
import { StatsMarquee } from "@/components/landing/StatsMarquee"
import { DetailedModules } from "@/components/landing/DetailedModules"
import { LanguageProvider, useLanguage } from "@/components/landing/LanguageProvider"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkle } from "@phosphor-icons/react"

function LandingPageContent() {
  const { t } = useLanguage()

  return (
    <main className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-accent-green/30 overflow-x-hidden w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Header />
      <div className="pt-6" />
      <HeroSection />
      <StatsMarquee />
      <div id="modules" className="scroll-mt-20 w-full">
        <DetailedModules />
      </div>

      {/* ── CTA Section ─────────────────────────────── */}
      <section className="relative w-full px-6 md:px-12 py-24 md:py-36 overflow-hidden">
        {/* animated radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-foreground/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-border/50" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border backdrop-blur-md"
          >
            <Sparkle weight="fill" className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-sm font-mono font-semibold tracking-widest text-muted-foreground uppercase">
              {t("cta_badge")}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter leading-[1.05] text-foreground"
          >
            {t("cta_title")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            {t("cta_desc")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="h-14 px-8 bg-foreground text-background font-semibold rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                {t("cta_btn_start")}
                <ArrowRight weight="bold" className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="#modules">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="h-14 px-8 bg-transparent text-foreground border border-border font-semibold rounded-full flex items-center gap-2 hover:bg-muted transition-colors"
              >
                {t("cta_btn_modules")}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-6 mt-0 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden relative rounded-xl shadow-sm opacity-80">
               <img 
                 src="/android-chrome-512x512.png" 
                 alt="PROD_CORE Logo" 
                 className="w-full object-contain rounded-xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" 
               />
            </div>
            <span className="font-display font-bold text-sm text-muted-foreground tracking-tight">PROD_CORE</span>
          </div>
          <p className="text-muted-foreground font-sans text-sm text-center">
            {t("footer_copy")}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
            <span>v2.0</span>
            <span className="w-px h-4 bg-border" />
            <Link href="/login" className="hover:text-foreground transition-colors">{t("header_signIn")}</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}


export default function Home() {
  return (
    <LanguageProvider>
      <LandingPageContent />
    </LanguageProvider>
  )
}
