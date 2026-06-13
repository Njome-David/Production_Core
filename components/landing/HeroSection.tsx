"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Buildings } from "@phosphor-icons/react"
import Link from "next/link"
import { useLanguage } from "./LanguageProvider"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const { t } = useLanguage()

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  return (
    <section ref={containerRef} className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-32 pb-16 px-6 md:px-12 overflow-hidden w-full">
      {/* Background Parallax */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div style={{ y, opacity, scale }} className="w-full h-full relative">
           <img 
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=2000&q=80" 
            alt="Production facility" 
            className="w-full h-full object-cover opacity-[0.4] dark:opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/50 to-background" />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto mt-[-5vh]">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-48 h-16 flex items-center justify-center overflow-hidden relative rounded-2xl shadow-sm mb-6"
        >
          <img 
            src="/logo.png" 
            alt="PROD_CORE Engine Logo" 
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border backdrop-blur-md mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
        >
          <span className="flex h-2 w-2 rounded-full bg-accent-blue animate-pulse" />
          <span className="text-sm font-medium tracking-wide">{t("hero_badge")}</span>
        </motion.div> */}

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-[6rem] font-display font-bold tracking-tighter leading-[1.05] text-foreground mb-8"
        >
          {t("hero_title1")} <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
            {t("hero_title2")}
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
        >
          {t("hero_desc")}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-14 px-8 w-full bg-foreground text-background font-medium rounded-full flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors shadow-lg"
            >
              {t("hero_btn_enter")}
              <ArrowRight weight="bold" className="w-5 h-5" />
            </motion.button>
          </Link>
          
          <Link href="#modules" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-14 px-8 w-full bg-background text-foreground border border-border font-medium rounded-full flex items-center justify-center gap-2 hover:bg-muted transition-colors"
            >
              {t("hero_btn_explore")}
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Screenshot with subtle tilt */}
      <motion.div 
        initial={{ opacity: 0, y: 100, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 25, delay: 0.6 }}
        style={{ perspective: 1000 }}
        className="relative z-20 w-full max-w-6xl mx-auto mt-24 rounded-[1rem] border-x border-t border-border/50 bg-background overflow-hidden shadow-2xl"
      >
        <img 
          src="/Screenshot from PROD_CORE.png" 
          alt="PROD_CORE App Interface"
          className="w-full h-auto object-cover"
        />
      </motion.div>
    </section>
  )
}
