"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChartLineUp, ArrowRight, GearSix, Cube, CheckCircle } from "@phosphor-icons/react"
import Link from "next/link"
import { useLanguage } from "@/providers/LanguageProvider"

const KPI_VALUES = [
  { label: "Revenue", value: "$48.2k", color: "text-emerald-400" },
  { label: "Margin", value: "+14.6%", color: "text-emerald-400" },
  { label: "Orders", value: "1,892", color: "text-blue-400" },
  { label: "Defect", value: "0.3%", color: "text-amber-400" },
]

const ROUTING_STEPS = [
  { name: "Cutting", status: "done" },
  { name: "CNC Routing", status: "active" },
  { name: "Assembly", status: "pending" },
  { name: "QC Check", status: "pending" },
]

export function SmartShowcase() {
  const { t } = useLanguage()
  const [activeKpi, setActiveKpi] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveKpi(k => (k + 1) % KPI_VALUES.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative w-full py-24 md:py-36 px-6 md:px-12 overflow-hidden bg-background">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-[0.15em] text-emerald-400 uppercase">
            {t("showcase_badge")}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter leading-[1.05] text-foreground text-center mb-6"
        >
          {t("showcase_title")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-lg text-muted-foreground max-w-2xl text-center mb-16 leading-relaxed"
        >
          {t("showcase_desc")}
        </motion.p>

        {/* Mockup + Info side by side */}
        <div className="flex flex-col lg:flex-row items-center gap-16 w-full">
          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex-1 w-full max-w-2xl"
          >
            <div className="relative">
              {/* Glow behind */}
              <div className="absolute -inset-4 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent blur-2xl rounded-3xl" />

              {/* Mockup frame */}
              <div className="relative bg-card rounded-2xl border border-border overflow-hidden shadow-2xl">
                {/* Mockup header */}
                <div className="h-12 bg-muted/80 border-b border-border/50 flex items-center px-5 gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground/50 ml-2">PROD_CORE — Executive Dashboard</span>
                </div>

                {/* Mockup body */}
                <div className="p-6 space-y-6">
                  {/* KPI Row */}
                  <div className="grid grid-cols-4 gap-3">
                    {KPI_VALUES.map((kpi, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl p-4 border transition-all duration-700 ${
                          idx === activeKpi
                            ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                            : "bg-muted/50 border-border/50"
                        }`}
                      >
                        <span className="text-xs font-mono text-muted-foreground tracking-widest">{kpi.label}</span>
                        <div className={`text-xl font-display font-bold mt-1 ${kpi.color}`}>{kpi.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className="h-32 bg-muted/50 rounded-xl border border-border/50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-20 flex items-end gap-2 px-6">
                      {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                          className="flex-1 bg-gradient-to-t from-emerald-500/40 to-emerald-400/20 rounded-t-sm"
                        />
                      ))}
                    </div>
                    <ChartLineUp weight="duotone" className="w-8 h-8 text-muted-foreground/30" />
                  </div>

                  {/* Routing steps */}
                  <div className="flex items-center gap-2">
                    {ROUTING_STEPS.map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-14 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono font-semibold transition-all ${
                          step.status === "active"
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10"
                            : step.status === "done"
                            ? "bg-muted/50 border-border/50 text-muted-foreground"
                            : "bg-muted/10 border-border/50 text-muted-foreground/30"
                        }`}
                      >
                        {step.status === "done" && <CheckCircle weight="fill" className="w-3 h-3" />}
                        {step.status === "active" && <GearSix weight="fill" className="w-3 h-3 animate-spin" />}
                        {step.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex-1 max-w-md space-y-6"
          >
            {[
              { icon: ChartLineUp, title: t("showcase_feat1_title"), desc: t("showcase_feat1_desc") },
              { icon: Cube, title: t("showcase_feat2_title"), desc: t("showcase_feat2_desc") },
              { icon: GearSix, title: t("showcase_feat3_title"), desc: t("showcase_feat3_desc") },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="group flex gap-5 p-5 rounded-2xl bg-muted/10 border border-border/50 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <item.icon weight="duotone" className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-foreground font-display font-bold text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}

            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-4 h-12 px-6 bg-primary text-primary-foreground font-semibold rounded-full flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all"
              >
                {t("showcase_btn")}
                <ArrowRight weight="bold" className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
