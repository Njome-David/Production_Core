"use client"

import React from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/providers/LanguageProvider"

export function MarqueeBanner() {
  const { t } = useLanguage()

  return (
    <div className="relative w-full py-6 bg-[#0B0E11] border-y border-white/5 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0B0E11] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0B0E11] to-transparent z-10 pointer-events-none" />

      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        className="flex whitespace-nowrap min-w-max"
      >
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="text-5xl md:text-6xl font-display font-bold tracking-tighter text-white/5 mx-8 select-none"
          >
            {t("marquee_text")}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
