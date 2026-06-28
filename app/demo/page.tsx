"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/landing/Header"
import { useLanguage } from "@/providers/LanguageProvider"
import { Check, ArrowLeft, ArrowRight, VideoCamera, CalendarDots } from "@phosphor-icons/react"
import Link from "next/link"
import type { DictionaryKeys } from "@/lib/i18n/dictionary"

function DemoPageContent() {
  const { t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    size: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const sizeKey = `demo_size_${form.size}` as DictionaryKeys

  return (
    <main className="min-h-[100dvh] flex flex-col bg-[#0B0E11] text-white selection:bg-emerald-500/30 overflow-x-hidden w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Header />

      <section className="relative pt-36 pb-24 md:pb-32 px-6 md:px-12 flex-1 flex items-start justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full" />
        </div>

        <div className="relative max-w-2xl mx-auto w-full">
          {!submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-8"
              >
                <ArrowLeft weight="bold" className="w-4 h-4" />
                {t("pricing_title")}
              </Link>

              <div className="text-center mb-10">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
                    {t("pricing_free" as DictionaryKeys)}
                  </span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-white mb-4">
                  {t("demo_title")}
                </h1>
                <p className="text-lg text-white/50 max-w-lg mx-auto">
                  {t("demo_desc")}
                </p>
              </div>

              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      {t("demo_company")} <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-sm"
                      placeholder={t("login_placeholder_company")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      {t("demo_name")} <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-sm"
                      placeholder={t("login_label_name")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      {t("demo_email")} <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-sm"
                      placeholder={t("login_label_email")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      {t("demo_phone")} <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-sm"
                      placeholder={t("demo_phone_placeholder")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    {t("demo_size")} <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-sm appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23ffffff66' viewBox='0 0 256 256'%3E%3Cpath d='M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                    }}
                  >
                    <option value="" disabled className="bg-[#14181C]">{t("demo_size_placeholder")}</option>
                    <option value="1" className="bg-[#14181C]">{t("demo_size_1")}</option>
                    <option value="2" className="bg-[#14181C]">{t("demo_size_2")}</option>
                    <option value="3" className="bg-[#14181C]">{t("demo_size_3")}</option>
                    <option value="4" className="bg-[#14181C]">{t("demo_size_4")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    {t("demo_message")}
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all text-sm resize-none"
                    placeholder={t("demo_message_placeholder")}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 rounded-full bg-emerald-500 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                >
                  {t("demo_submit")}
                  <ArrowRight weight="bold" className="w-5 h-5" />
                </motion.button>

                <p className="text-center text-xs text-white/30 mt-4">
                  {t("demo_footer")}
                </p>
              </motion.form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
                <Check weight="bold" className="w-10 h-10 text-emerald-400" />
              </div>

              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-white mb-4">
                {t("demo_success_title")}
              </h2>
              <p className="text-lg text-white/50 max-w-md mx-auto mb-10">
                {t("demo_success_desc")}
              </p>

              <div className="max-w-sm mx-auto space-y-4 mb-12">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <VideoCamera weight="bold" className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {t("demo_video_title")}
                    </p>
                    <p className="text-xs text-white/40">
                      {t("demo_video_desc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CalendarDots weight="bold" className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {t("demo_delay_title")}
                    </p>
                    <p className="text-xs text-white/40">
                      {t("demo_delay_desc")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/pricing">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="h-12 px-6 bg-white/10 text-white border border-white/20 font-semibold rounded-full flex items-center gap-2 transition-all hover:bg-white/20"
                  >
                    <ArrowLeft weight="bold" className="w-4 h-4" />
                    {t("pricing_title")}
                  </motion.button>
                </Link>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="h-12 px-6 bg-emerald-500 text-white font-semibold rounded-full flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                  >
                    {t("pricing_cta")}
                    <ArrowRight weight="bold" className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <footer className="border-t border-white/5 bg-[#0B0E11] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden relative rounded-xl shadow-sm opacity-80">
              <img
                src="/android-chrome-512x512.png"
                alt="PROD_CORE Logo"
                className="w-full object-contain rounded-xl brightness-0 invert opacity-50 hover:opacity-100 transition-all"
              />
            </div>
            <span className="font-display font-bold text-sm text-white/40 tracking-tight">PROD_CORE</span>
          </div>
          <p className="text-white/40 font-sans text-sm text-center">{t("footer_copy")}</p>
          <div className="flex items-center gap-4 text-xs text-white/40 font-mono">
            <span>v2.0</span>
            <span className="w-px h-4 bg-white/10" />
            <Link href="/login" className="hover:text-white transition-colors">{t("header_signIn")}</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default function DemoPage() {
  return <DemoPageContent />
}
