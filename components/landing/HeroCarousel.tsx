"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react"
import Link from "next/link"
import { useLanguage } from "@/providers/LanguageProvider"
import type { DictionaryKeys } from "@/lib/i18n/dictionary"

const SLIDES: { img: string; titleKey: DictionaryKeys; subKey: DictionaryKeys }[] = [
  {
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2000&q=80",
    titleKey: "hero_slide1_title" as DictionaryKeys,
    subKey: "hero_slide1_sub" as DictionaryKeys,
  },
  {
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=2000&q=80",
    titleKey: "hero_slide2_title" as DictionaryKeys,
    subKey: "hero_slide2_sub" as DictionaryKeys,
  },
  {
    img: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=2000&q=80",
    titleKey: "hero_slide3_title" as DictionaryKeys,
    subKey: "hero_slide3_sub" as DictionaryKeys,
  },
]

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const { t } = useLanguage()

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
  }, [current])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent(c => (c + 1) % SLIDES.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const slide = SLIDES[current]

  return (
    <section className="relative w-full min-h-[100dvh] overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={slide.img}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E11] via-[#0B0E11]/70 to-[#0B0E11]/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0B0E11_80%)]" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 md:px-12 pt-32 pb-24">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold tracking-widest text-white/80 uppercase">PROD_CORE Engine v2.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-display font-bold tracking-tighter leading-[1.05] text-white mb-6">
              {t(slide.titleKey)}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white/40">
                {t(slide.subKey)}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed">
              {t("hero_desc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-14 px-8 bg-white text-[#0B0E11] font-semibold rounded-full flex items-center gap-2 shadow-xl hover:shadow-white/25 transition-shadow"
                >
                  {t("hero_btn_enter")}
                  <ArrowRight weight="bold" className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="#products">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-14 px-8 bg-white/10 text-white border border-white/20 font-semibold rounded-full flex items-center gap-2 backdrop-blur-md hover:bg-white/20 transition-all"
                >
                  {t("hero_btn_explore")}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
      >
        <CaretLeft weight="bold" className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
      >
        <CaretRight weight="bold" className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`transition-all duration-500 rounded-full ${
              idx === current
                ? "w-10 h-2 bg-white"
                : "w-2 h-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
