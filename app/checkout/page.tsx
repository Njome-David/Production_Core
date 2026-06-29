"use client"

import React, { useState, Suspense } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/landing/Header"
import { useLanguage } from "@/providers/LanguageProvider"
import { Check, ArrowLeft, ArrowRight, Lock, CreditCard, CalendarBlank, ShieldCheck } from "@phosphor-icons/react"
import Link from "next/link"
import type { DictionaryKeys } from "@/lib/i18n/dictionary"

const PAID_PLANS = ["startup", "pro", "enterprise"]

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2)
  return digits
}

function CheckoutForm() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()

  const planKey = searchParams.get("plan") || "startup"
  const annual = searchParams.get("annual") === "true"
  const isPaid = PAID_PLANS.includes(planKey)

  const [paid, setPaid] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")

  const priceKey = `pricing_${planKey}_price` as DictionaryKeys
  const basePrice = parseInt(t(priceKey))
  const displayPrice = annual ? Math.round(basePrice * 12 * 0.8 / 12) : basePrice
  const planName = t(`pricing_${planKey}` as DictionaryKeys)

  const features: string[] = []
  for (let i = 1; i <= 6; i++) {
    const fk = `pricing_${planKey}_feat${i}` as DictionaryKeys
    const val = t(fk)
    if (val !== fk) features.push(val)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardNumber || !cardName || !expiry || !cvv) return
    setPaid(true)
  }

  const backHref = `/pricing${annual ? "?annual=true" : ""}`

  if (!isPaid) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">{t("pricing_title")}</p>
        <Link href="/pricing" className="mt-4 inline-block text-emerald-400 hover:text-emerald-300 transition-colors underline">
          {t("pricing_title")}
        </Link>
      </div>
    )
  }

  if (paid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
          <Check weight="bold" className="w-10 h-10 text-emerald-400" />
        </div>

        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-foreground mb-4">
          {t("checkout_success_title")}
        </h2>

        <div className="bg-muted/50 border border-border rounded-2xl p-6 mb-8 text-left">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm">{t("pricing_title")}</span>
            <span className="text-emerald-400 text-sm font-semibold">
              <Check weight="bold" className="w-4 h-4 inline mr-1" />
              {t("checkout_success_status")}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="text-foreground/70 text-sm">{planName}</span>
            <span className="text-foreground font-semibold">${displayPrice}/mo</span>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="text-foreground/70 text-sm">{annual ? t("checkout_billed_annual") : t("checkout_billed_monthly")}</span>
            <span className="text-muted-foreground text-sm">{annual ? t("checkout_save_annual") : ""}</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-8">
          {t("checkout_success_desc")}
        </p>

        <Link href="/login">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="h-12 px-6 bg-emerald-500 text-white font-semibold rounded-full flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
          >
            {t("header_signIn")}
            <ArrowRight weight="bold" className="w-4 h-4" />
          </motion.button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto w-full"
    >
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft weight="bold" className="w-4 h-4" />
        {t("pricing_title")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-muted/50 border border-border rounded-2xl p-6 sticky top-28">
            <h3 className="text-sm font-mono tracking-widest text-muted-foreground uppercase mb-6">
              {t("checkout_summary")}
            </h3>

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-foreground font-semibold text-lg">{planName}</p>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {annual ? t("checkout_billed_annual") : t("checkout_billed_monthly")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-foreground font-display font-bold text-2xl">${displayPrice}</p>
                <p className="text-muted-foreground text-xs">/mo</p>
              </div>
            </div>

            {annual && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-6">
                <p className="text-emerald-400 text-sm font-semibold">
                  {t("checkout_save_annual")}
                </p>
              </div>
            )}

            <div className="space-y-3 border-t border-border pt-6">
              {features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check weight="bold" className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment form */}
        <div className="lg:col-span-3">
          <div className="bg-muted/50 border border-border rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
              <Lock weight="bold" className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-display font-bold text-foreground">
                {t("checkout_payment_title")}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                  {t("checkout_card_number")}
                </label>
                <div className="relative">
                  <CreditCard weight="duotone" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder={t("checkout_card_placeholder")}
                    required
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-sm tracking-widest font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                  {t("checkout_cardholder")}
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder={t("checkout_cardholder_placeholder")}
                  required
                  className="w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                    {t("checkout_expiry")}
                  </label>
                  <div className="relative">
                    <CalendarBlank weight="duotone" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder={t("checkout_expiry_placeholder")}
                      required
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1.5">{t("checkout_cvv")}</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder={t("checkout_cvv_placeholder")}
                    required
                    className="w-full h-12 px-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-sm font-mono"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 rounded-full bg-emerald-500 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all mt-2"
              >
                <Lock weight="bold" className="w-5 h-5" />
                {t("checkout_pay")} ${displayPrice}/mo
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CheckoutPageContent() {
  const { t } = useLanguage()

  return (
    <main className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-emerald-500/30 overflow-x-hidden w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Header />

      <section className="relative pt-36 pb-24 md:pb-32 px-6 md:px-12 flex-1 flex items-start justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full" />
        </div>

        <Suspense fallback={
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          </div>
        }>
          <CheckoutForm />
        </Suspense>
      </section>

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

export default function CheckoutPage() {
  return <CheckoutPageContent />
}
