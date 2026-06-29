"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  PresentationChart,
  FolderOpen,
  DeviceTablet,
  Buildings,
  GearSix,
  ClipboardText,
} from "@phosphor-icons/react"
import { useLanguage } from "@/providers/LanguageProvider"
import type { DictionaryKeys } from "@/lib/i18n/dictionary"

const FEATURES: { icon: React.ComponentType<any>; titleKey: DictionaryKeys; descKey: DictionaryKeys; color: string }[] = [
  { icon: PresentationChart, titleKey: "feature_realtime_title" as DictionaryKeys, descKey: "feature_realtime_desc" as DictionaryKeys, color: "emerald" },
  { icon: FolderOpen, titleKey: "feature_bom_title" as DictionaryKeys, descKey: "feature_bom_desc" as DictionaryKeys, color: "amber" },
  { icon: GearSix, titleKey: "feature_routing_title" as DictionaryKeys, descKey: "feature_routing_desc" as DictionaryKeys, color: "blue" },
  { icon: DeviceTablet, titleKey: "feature_tablet_title" as DictionaryKeys, descKey: "feature_tablet_desc" as DictionaryKeys, color: "purple" },
  { icon: ClipboardText, titleKey: "feature_inventory_title" as DictionaryKeys, descKey: "feature_inventory_desc" as DictionaryKeys, color: "rose" },
  { icon: Buildings, titleKey: "feature_multitenant_title" as DictionaryKeys, descKey: "feature_multitenant_desc" as DictionaryKeys, color: "cyan" },
]

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20 group-hover:border-emerald-500/40",
    text: "text-emerald-400",
    glow: "bg-emerald-500/10",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20 group-hover:border-amber-500/40",
    text: "text-amber-400",
    glow: "bg-amber-500/10",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20 group-hover:border-blue-500/40",
    text: "text-blue-400",
    glow: "bg-blue-500/10",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20 group-hover:border-purple-500/40",
    text: "text-purple-400",
    glow: "bg-purple-500/10",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/20 group-hover:border-rose-500/40",
    text: "text-rose-400",
    glow: "bg-rose-500/10",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20 group-hover:border-cyan-500/40",
    text: "text-cyan-400",
    glow: "bg-cyan-500/10",
  },
}

export function FeatureGrid() {
  const { t } = useLanguage()

  return (
    <section className="relative w-full py-24 md:py-32 px-6 md:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-foreground mb-4">
            {t("landing_feature_title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("landing_feature_desc")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {FEATURES.map((feat, idx) => {
            const colors = COLOR_MAP[feat.color]
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group relative"
              >
                {/* Glow on hover */}
                <div className={`absolute -inset-2 ${colors.glow} blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div
                  className={`relative h-full bg-card rounded-2xl border border-border/50 ${colors.border} p-6 flex flex-col gap-5 transition-all duration-300 cursor-default`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.border.replace("group-hover:", "")} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feat.icon weight="duotone" className={`w-7 h-7 ${colors.text}`} />
                  </div>

                  <h3 className="text-foreground font-display font-bold text-lg tracking-tight">
                    {t(feat.titleKey)}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(feat.descKey)}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
