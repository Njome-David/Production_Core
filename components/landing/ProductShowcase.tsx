"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, PresentationChart, FolderOpen, DeviceTablet, ShieldCheck } from "@phosphor-icons/react"
import Link from "next/link"
import { useLanguage } from "@/providers/LanguageProvider"
import type { DictionaryKeys } from "@/lib/i18n/dictionary"

const PRODUCTS: { icon: React.ComponentType<any>; titleKey: DictionaryKeys; catKey: DictionaryKeys; descKey: DictionaryKeys; img: string; color: string }[] = [
  {
    icon: PresentationChart,
    titleKey: "product_dashboard_title" as DictionaryKeys,
    catKey: "product_dashboard_cat" as DictionaryKeys,
    descKey: "product_dashboard_desc" as DictionaryKeys,
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    color: "emerald",
  },
  {
    icon: FolderOpen,
    titleKey: "product_inventory_title" as DictionaryKeys,
    catKey: "product_inventory_cat" as DictionaryKeys,
    descKey: "product_inventory_desc" as DictionaryKeys,
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    color: "amber",
  },
  {
    icon: DeviceTablet,
    titleKey: "product_tablet_title" as DictionaryKeys,
    catKey: "product_tablet_cat" as DictionaryKeys,
    descKey: "product_tablet_desc" as DictionaryKeys,
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    color: "blue",
  },
  {
    icon: ShieldCheck,
    titleKey: "product_gates_title" as DictionaryKeys,
    catKey: "product_gates_cat" as DictionaryKeys,
    descKey: "product_gates_desc" as DictionaryKeys,
    img: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80",
    color: "purple",
  },
]

const COLOR_MAP: Record<string, { border: string; text: string; bg: string; btn: string }> = {
  emerald: { border: "border-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-500/10", btn: "hover:bg-emerald-500 hover:text-white" },
  amber: { border: "border-amber-500/20", text: "text-amber-400", bg: "bg-amber-500/10", btn: "hover:bg-amber-500 hover:text-white" },
  blue: { border: "border-blue-500/20", text: "text-blue-400", bg: "bg-blue-500/10", btn: "hover:bg-blue-500 hover:text-white" },
  purple: { border: "border-purple-500/20", text: "text-purple-400", bg: "bg-purple-500/10", btn: "hover:bg-purple-500 hover:text-white" },
}

export function ProductShowcase() {
  const { t } = useLanguage()

  return (
    <section className="relative w-full py-24 md:py-32 px-6 md:px-12 bg-background">
      {/* Section header */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border backdrop-blur-md mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            <span className="text-xs font-mono font-semibold tracking-widest text-muted-foreground uppercase">{t("product_badge")}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-foreground">
            {t("product_heading_title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mt-4">
            {t("product_heading_desc")}
          </p>
        </motion.div>

        {/* Product cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product, idx) => {
            const colors = COLOR_MAP[product.color]
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-border transition-all duration-300"
              >
                {/* Image area */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.img}
                    alt=""
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-mono font-bold tracking-[0.15em] px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {t(product.catKey)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <product.icon weight="duotone" className={`w-5 h-5 ${colors.text}`} />
                    <h3 className="text-foreground font-display font-bold text-base">{t(product.titleKey)}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(product.descKey)}</p>
                  <Link
                    href="/login"
                    className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors ${colors.btn} rounded-full px-4 py-2 -ml-2 transition-all`}
                  >
                    {t("product_learn")} <ArrowRight weight="bold" className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
