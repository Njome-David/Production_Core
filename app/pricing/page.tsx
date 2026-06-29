"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/landing/Header"
import { useLanguage } from "@/providers/LanguageProvider"
import { Check, ArrowRight, Question, X, CaretDown } from "@phosphor-icons/react"
import Link from "next/link"
import type { DictionaryKeys } from "@/lib/i18n/dictionary"

const PLANS = [
  {
    key: "free",
    popular: false,
    features: [
      "pricing_free_feat1",
      "pricing_free_feat2",
      "pricing_free_feat3",
      "pricing_free_feat4",
    ],
    excluded: [] as string[],
  },
  {
    key: "startup",
    popular: false,
    features: [
      "pricing_startup_feat1",
      "pricing_startup_feat2",
      "pricing_startup_feat3",
      "pricing_startup_feat4",
    ],
    excluded: [] as string[],
  },
  {
    key: "pro",
    popular: true,
    features: [
      "pricing_pro_feat1",
      "pricing_pro_feat2",
      "pricing_pro_feat3",
      "pricing_pro_feat4",
      "pricing_pro_feat5",
    ],
    excluded: [] as string[],
  },
  {
    key: "enterprise",
    popular: false,
    features: [
      "pricing_enterprise_feat1",
      "pricing_enterprise_feat2",
      "pricing_enterprise_feat3",
      "pricing_enterprise_feat4",
      "pricing_enterprise_feat5",
      "pricing_enterprise_feat6",
    ],
    excluded: [] as string[],
  },
]

const FAQS = [
  { q: "pricing_faq_1q", a: "pricing_faq_1a" },
  { q: "pricing_faq_2q", a: "pricing_faq_2a" },
  { q: "pricing_faq_3q", a: "pricing_faq_3a" },
  { q: "pricing_faq_4q", a: "pricing_faq_4a" },
]

function PricingPageContent() {
  const { t } = useLanguage()
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-emerald-500/30 overflow-x-hidden w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Header />

      {/* Header section */}
      <section className="relative pt-36 pb-16 md:pb-24 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">{t("pricing_badge")}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold tracking-tighter text-foreground"
          >
            {t("pricing_title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-lg text-muted-foreground max-w-xl"
          >
            {t("pricing_desc")}
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 bg-muted/50 border border-border rounded-full p-1.5 mt-4"
          >
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("pricing_monthly")}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("pricing_annual")}
              <span className="ml-1.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Plans grid */}
      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLANS.map((plan, idx) => {
            const isFree = plan.key === "free"
            const priceKey = `pricing_${plan.key}_price` as DictionaryKeys
            const basePrice = parseInt(t(priceKey))
            const displayPrice = annual && !isFree ? Math.round(basePrice * 12 * 0.8 / 12) : basePrice

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  plan.popular
                    ? "bg-emerald-500/5 border-emerald-500/30 shadow-xl shadow-emerald-500/10"
                    : "bg-card border-border hover:border-border"
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-[10px] font-mono font-bold tracking-widest rounded-full uppercase">
                    {t("pricing_popular")}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {t(`pricing_${plan.key}` as DictionaryKeys)}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(`pricing_${plan.key}_desc` as DictionaryKeys)}
                  </p>
                </div>

                <div className="mb-8">
                  {isFree ? (
                    <span className="text-5xl font-display font-bold text-foreground">{t("pricing_free" as DictionaryKeys)}</span>
                  ) : (
                    <>
                      <span className="text-5xl font-display font-bold text-foreground">${displayPrice}</span>
                      <span className="text-muted-foreground text-sm ml-1">/mo</span>
                    </>
                  )}
                </div>

                <Link href={isFree ? "/demo" : `/checkout?plan=${plan.key}${annual ? "&annual=true" : ""}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full h-12 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      plan.popular
                        ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                        : isFree
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-muted text-foreground border border-border hover:bg-accent"
                    }`}
                  >
                    {t(isFree ? "pricing_cta_demo" : "pricing_cta")}
                    <ArrowRight weight="bold" className="w-4 h-4" />
                  </motion.button>
                </Link>

                <div className="mt-8 space-y-4 flex-1">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check weight="bold" className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/70">{t(feat as any)}</span>
                    </div>
                  ))}
                  {plan.excluded.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-30">
                      <X weight="bold" className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{t(feat as any)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-6xl mx-auto mt-8 p-8 rounded-2xl bg-muted/50 border border-border flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="text-xl font-display font-bold text-foreground">{t("pricing_enterprise_cta_title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("pricing_enterprise_cta_desc")}</p>
          </div>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="h-12 px-6 bg-primary text-primary-foreground font-semibold rounded-full flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all shrink-0"
            >
              {t("pricing_cta_contact")}
              <ArrowRight weight="bold" className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-12 pb-32">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-foreground text-center mb-12"
          >
            {t("pricing_faq_title")}
          </motion.h2>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left bg-muted/10 hover:bg-muted transition-all"
                >
                  <span className="text-foreground font-medium text-sm">{t(faq.q as any)}</span>
                  <CaretDown
                    weight="bold"
                    className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(faq.a as any)}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden relative rounded-xl shadow-sm opacity-80">
              <img
                src="/android-chrome-512x512.png"
                alt="PROD_CORE Logo"
                className="w-full object-contain rounded-xl brightness-0 invert opacity-50 hover:opacity-100 transition-all"
              />
            </div>
            <span className="font-display font-bold text-sm text-muted-foreground tracking-tight">PROD_CORE</span>
          </div>
          <p className="text-muted-foreground font-sans text-sm text-center">{t("footer_copy")}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
            <span>v2.0</span>
            <span className="w-px h-4 bg-muted" />
            <Link href="/login" className="hover:text-foreground transition-colors">{t("header_signIn")}</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default function PricingPage() {
  return <PricingPageContent />
}
