"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "@phosphor-icons/react"
import { useLanguage } from "@/providers/LanguageProvider"
import type { DictionaryKeys } from "@/lib/i18n/dictionary"

const SCREENSHOTS = [
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    altKey: "gallery_img1" as DictionaryKeys,
  },
  {
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    altKey: "gallery_img2" as DictionaryKeys,
  },
  {
    src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80",
    altKey: "gallery_img3" as DictionaryKeys,
  },
  {
    src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
    altKey: "gallery_img4" as DictionaryKeys,
  },
  {
    src: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80",
    altKey: "gallery_img5" as DictionaryKeys,
  },
  {
    src: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=600&q=80",
    altKey: "gallery_img6" as DictionaryKeys,
  },
]

export function ScreenshotGallery() {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <>
      <section className="relative w-full py-24 md:py-32 px-6 md:px-12 bg-background">
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
              <span className="text-xs font-mono font-semibold tracking-widest text-muted-foreground uppercase">{t("gallery_badge")}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-foreground">
              {t("gallery_title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mt-4">
              {t("gallery_desc")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {SCREENSHOTS.map((shot, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelected(idx)}
                className={`relative overflow-hidden rounded-xl border border-border/50 hover:border-border transition-all group ${
                  idx === 0 ? "md:col-span-2 md:row-span-2" : "aspect-[4/3]"
                }`}
              >
                <img
                  src={shot.src}
                  alt={t(shot.altKey)}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs font-mono font-semibold tracking-widest text-muted-foreground">{t(shot.altKey)}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 md:p-8 cursor-pointer"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center text-foreground hover:bg-accent transition-all z-10"
            >
              <X weight="bold" className="w-5 h-5" />
            </button>
            <motion.img
              key={selected}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={SCREENSHOTS[selected].src}
              alt={t(SCREENSHOTS[selected].altKey)}
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
