"use client"

import React from "react"
import { motion } from "framer-motion"
import { useLanguage } from "./LanguageProvider"

export function StatsMarquee() {
  const { t } = useLanguage()
  const [isHovered, setIsHovered] = React.useState(false)

  const stats = [
    { value: "99.97%", label: t("stats_uptime") },
    { value: "24,892,104", label: t("stats_processed") },
    { value: "3,402", label: t("stats_facilities") },
    { value: "0.012%", label: t("stats_defect") },
    { value: "12,940", label: t("stats_sessions") },
    { value: "< 20ms", label: t("stats_latency") },
  ]

  // Duplicate to allow seamless scroll
  const marqueeItems = [...stats, ...stats, ...stats]

  return (
    <div 
      className="w-full border-y border-border/50 bg-card py-6 overflow-hidden flex relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <motion.div 
        animate={{ x: ["0%", "-33.333333%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: isHovered ? 60 : 25 }}
        className="flex whitespace-nowrap min-w-max"
      >
        {marqueeItems.map((stat, idx) => (
          <div key={idx} className="flex items-baseline gap-3 px-12 border-l border-border/50 first:border-l-0">
            <span className="font-display font-bold text-3xl md:text-4xl text-foreground">
              {stat.value}
            </span>
            <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
