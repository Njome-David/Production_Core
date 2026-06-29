"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/providers/LanguageProvider"
import { type DictionaryKeys } from "@/lib/i18n/dictionary"
import { ArrowRight, ArrowLeft, Check, Sparkle, Eye, EyeSlash, Buildings, CreditCard, ShieldCheck, CheckCircle } from "@phosphor-icons/react"

type PlanTier = "starter" | "professional" | "enterprise"
type Billing = "monthly" | "annual"

const PLAN_FEATURES: Record<PlanTier, DictionaryKeys[]> = {
  starter: [
    "register_feature_1_agence",
    "register_feature_5_employes",
    "register_feature_gestion_stocks",
    "register_feature_ordres_fabrication",
    "register_feature_support_email",
  ],
  professional: [
    "register_feature_3_agences",
    "register_feature_25_employes",
    "register_feature_tout_starter",
    "register_feature_tableau_bord",
    "register_feature_portail_operateur",
    "register_feature_controle_qualite",
    "register_feature_support_prioritaire",
  ],
  enterprise: [
    "register_feature_agences_illimitees",
    "register_feature_employes_illimites",
    "register_feature_tout_professional",
    "register_feature_gestion_multi_site",
    "register_feature_api_integrations",
    "register_feature_rapports_personnalises",
    "register_feature_support_dedie",
    "register_feature_sla_garanti",
  ],
}

const PLAN_PRICES: Record<PlanTier, { monthly: number; annual: number }> = {
  starter: { monthly: 49_000, annual: 49_000 * 10 },
  professional: { monthly: 149_000, annual: 149_000 * 10 },
  enterprise: { monthly: 499_000, annual: 499_000 * 10 },
}

const INDUSTRIES: Array<{ value: string; key: DictionaryKeys }> = [
  { value: "Agroalimentaire & Transformation", key: "register_industry_agro_food" },
  { value: "Fabrication Métallique", key: "register_industry_metal_fab" },
  { value: "Textile & Habillement", key: "register_industry_textile" },
  { value: "Chimie & Pharmacie", key: "register_industry_chemical" },
  { value: "Bois & Ameublement", key: "register_industry_wood" },
  { value: "Matériaux de Construction", key: "register_industry_construction" },
  { value: "Électronique", key: "register_industry_electronics" },
  { value: "Autre", key: "register_industry_other" },
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)

  const { t } = useLanguage()

  // Step 1
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Step 2
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState(INDUSTRIES[0].value)
  const [country, setCountry] = useState("Cameroun")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")

  // Step 3
  const [plan, setPlan] = useState<PlanTier>("professional")
  const [billing, setBilling] = useState<Billing>("monthly")

  // Step 4
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")

  const totalSteps = 5
  const canNext = (): boolean => {
    switch (step) {
      case 1: return name.trim().length > 0 && email.trim().length > 0 && password.length >= 6
      case 2: return companyName.trim().length > 0
      case 3: return true
      case 4: return cardNumber.trim().length >= 16
      default: return true
    }
  }

  const nextStep = () => {
    if (step < totalSteps) setStep(s => s + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    // Simulate registration
    await new Promise(r => setTimeout(r, 1500))
    setSubmitting(false)
    setRegistered(true)
  }

  if (registered) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center flex flex-col items-center gap-6"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle weight="duotone" className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
            {t("register_success_title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("register_success_desc").replace("{companyName}", companyName)}
          </p>
          <Link href="/login">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="h-12 px-8 bg-foreground text-background font-medium rounded-full flex items-center gap-2 hover:bg-foreground/90 transition-colors"
            >
              {t("register_success_login")}
              <ArrowRight weight="bold" className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] w-full flex bg-background">
      {/* Left sidebar — steps indicator on desktop */}
      <div className="hidden lg:flex flex-col w-80 border-r border-border bg-card p-8">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <Buildings weight="duotone" className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-foreground tracking-tight">PROD_CORE</span>
        </Link>

        <div className="flex flex-col gap-0">
          {[
            { num: 1, label: t("register_step_1") },
            { num: 2, label: t("register_step_2") },
            { num: 3, label: t("register_step_3") },
            { num: 4, label: t("register_step_4") },
            { num: 5, label: t("register_step_5") },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-4 py-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s.num < step
                  ? "bg-emerald-500 text-white"
                  : s.num === step
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}>
                {s.num < step ? <Check weight="bold" className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-sm font-medium ${
                s.num === step ? "text-foreground" : "text-muted-foreground"
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 md:px-12 h-16 border-b border-border">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("register_back_home")}
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            {t("register_already_account")}
          </Link>
        </div>

        {/* Mobile step indicator */}
        <div className="lg:hidden flex items-center justify-center gap-2 px-6 py-4 border-b border-border">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 max-w-12 transition-colors ${
                i + 1 <= step ? "bg-foreground" : "bg-muted"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground font-mono ml-2 w-8 text-right">
            {step}/{totalSteps}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-6 md:px-12 py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h1 className="text-2xl font-display font-bold tracking-tight text-foreground mb-1">
                        {t("register_step1_title")}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {t("register_step1_desc")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <Field label={t("register_step1_fullname")}>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)}
                          placeholder={t("register_step1_fullname_placeholder")}
                          className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </Field>
                      <Field label={t("register_step1_email")}>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                          placeholder={t("register_step1_email_placeholder")}
                          className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </Field>
                      <Field label={t("register_step1_password")}>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} required value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder={t("register_step1_password_placeholder")}
                            className="w-full h-11 px-4 pr-11 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}>
                            {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {password.length > 0 && password.length < 6 && (
                          <p className="text-xs text-red-500 mt-1">{t("register_step1_password_error")}</p>
                        )}
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h1 className="text-2xl font-display font-bold tracking-tight text-foreground mb-1">
                        {t("register_step2_title")}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {t("register_step2_desc")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <Field label={t("register_step2_company")}>
                        <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)}
                          placeholder={t("register_step2_company_placeholder")}
                          className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </Field>
                      <Field label={t("register_step2_industry")}>
                        <select value={industry} onChange={e => setIndustry(e.target.value)}
                          className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                          {INDUSTRIES.map(i => <option key={i.value} value={i.value}>{t(i.key)}</option>)}
                        </select>
                      </Field>
                      <Field label={t("register_step2_country")}>
                        <input type="text" required value={country} onChange={e => setCountry(e.target.value)}
                          className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </Field>
                      <Field label="Téléphone">
                        <input type="tel" required value={companyPhone} onChange={e => setCompanyPhone(e.target.value)}
                          placeholder="+237 6XX XXX XXX"
                          className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </Field>
                      <Field label="Adresse">
                        <input type="text" required value={companyAddress} onChange={e => setCompanyAddress(e.target.value)}
                          placeholder="Ville, Quartier"
                          className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── STEP 3 ── */}
                {step === 3 && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h1 className="text-2xl font-display font-bold tracking-tight text-foreground mb-1">
                        Choisissez votre forfait
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {t("register_plan_desc")}
                      </p>
                    </div>

                    {/* Billing toggle */}
                    <div className="flex items-center justify-center gap-3">
                      <span className={`text-sm font-medium ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
{t("register_plan_monthly")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBilling(b => b === "monthly" ? "annual" : "monthly")}
                        className="relative w-12 h-6 rounded-full bg-muted transition-colors"
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground shadow transition-transform ${
                          billing === "annual" ? "translate-x-6" : "translate-x-0.5"
                        }`} />
                      </button>
                      <span className={`text-sm font-medium ${billing === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
{t("register_plan_annual")}
                        <span className="ml-1 text-xs text-emerald-500 font-semibold">{t("register_plan_annual_offer")}</span>
                      </span>
                    </div>

                    {/* Plan cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {(["starter", "professional", "enterprise"] as PlanTier[]).map((p) => {
                        const price = PLAN_PRICES[p][billing]
                        const isSelected = plan === p
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPlan(p)}
                            className={`relative text-left p-6 rounded-xl border-2 transition-all ${
                              isSelected
                                ? "border-foreground bg-card shadow-md"
                                : "border-border bg-transparent hover:border-muted-foreground/30"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                                <Check weight="bold" className="w-3 h-3 text-background" />
                              </div>
                            )}
                            <h3 className="text-base font-display font-bold text-foreground capitalize mb-1">{p}</h3>
                            <div className="mb-3">
                              <span className="text-2xl font-display font-bold text-foreground">
                                {price.toLocaleString()} FCFA
                              </span>
                              <span className="text-xs text-muted-foreground">
                                /{billing === "monthly" ? t("register_plan_month") : "an"}
                              </span>
                            </div>
                            <ul className="flex flex-col gap-2">
                              {PLAN_FEATURES[p].map((f) => (
                                <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <Check weight="bold" className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                                  {t(f)}
                                </li>
                              ))}
                            </ul>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── STEP 4 ── */}
                {step === 4 && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h1 className="text-2xl font-display font-bold tracking-tight text-foreground mb-1">
{t("register_step4_title")}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {t("register_step4_desc")}
                      </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <CreditCard weight="duotone" className="w-6 h-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">{t("register_step4_card")}</span>
                      </div>
                      <div className="flex flex-col gap-4">
                        <Field label={t("register_step4_card_number")}>
                          <input type="text" required value={cardNumber}
                            onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                            placeholder="4242 4242 4242 4242"
                            className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </Field>
                        <Field label={t("register_step4_card_holder")}>
                          <input type="text" required value={cardHolder} onChange={e => setCardHolder(e.target.value)}
                            placeholder="JEAN KAMGA"
                            className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase" />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label={t("register_step4_card_expiry")}>
                            <input type="text" required value={cardExpiry}
                              onChange={e => {
                                let v = e.target.value.replace(/\D/g, "").slice(0, 4)
                                if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2)
                                setCardExpiry(v)
                              }}
                              placeholder="MM/AA"
                              className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </Field>
                          <Field label={t("register_step4_card_cvv")}>
                            <input type="text" required value={cardCvv}
                              onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                              placeholder="123"
                              className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </Field>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck weight="duotone" className="w-4 h-4 text-emerald-500" />
                      {t("register_step4_secure")}
                    </div>
                  </div>
                )}

                {/* ── STEP 5 ── */}
                {step === 5 && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h1 className="text-2xl font-display font-bold tracking-tight text-foreground mb-1">
                        {t("register_step5_title")}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {t("register_step5_desc")}
                      </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
                      <Section label={t("register_step5_section_account")}>
                        <Row label={t("register_step5_account_name")} value={name} />
                        <Row label="Email" value={email} />
                      </Section>
                      <div className="border-t border-border" />
                      <Section label={t("register_step5_section_org")}>
                        <Row label={t("register_step5_org_name")} value={companyName} />
                        <Row label={t("register_step5_org_industry")} value={industry} />
                        <Row label={t("register_step5_org_country")} value={country} />
                      </Section>
                      <div className="border-t border-border" />
                      <Section label={t("register_step5_section_plan")}>
                        <Row label="Plan" value={plan.charAt(0).toUpperCase() + plan.slice(1)} />
                        <Row label={t("register_step5_plan_billing")} value={billing === "monthly" ? "Mensuelle" : "Annuelle"} />
                        <Row label={t("register_step5_plan_total")} value={`${PLAN_PRICES[plan][billing].toLocaleString()} FCFA`} />
                      </Section>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <div>
                {step > 1 ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={prevStep}
                    className="h-11 px-6 bg-background text-foreground border border-border font-medium rounded-md flex items-center gap-2 hover:bg-muted transition-colors"
                  >
                    <ArrowLeft weight="bold" className="w-4 h-4" />
                    {t("register_nav_back")}
                  </motion.button>
                ) : null}
              </div>
              <div>
                {step < totalSteps ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={nextStep}
                    disabled={!canNext()}
                    className="h-11 px-6 bg-foreground text-background font-medium rounded-md flex items-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("register_nav_continue")}
                    <ArrowRight weight="bold" className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="h-11 px-8 bg-emerald-600 text-white font-medium rounded-md flex items-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t("register_nav_creating")}
                      </>
                    ) : (
                      <>
                        <Sparkle weight="fill" className="w-4 h-4" />
                        {t("register_nav_create")}
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">{label}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
