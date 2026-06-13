"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Buildings } from "@phosphor-icons/react"
import Link from "next/link"
import { ThemeToggle } from "./ThemeToggle"
import { useLanguage } from "./LanguageProvider"

export function Header() {
  const [imageError, setImageError] = useState(false)
  const { language, setLanguage, t} = useLanguage()

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 h-20 border-b border-border/50 bg-background/80 backdrop-blur-xl z-50 px-6 md:px-12 flex items-center justify-between"
    >
      <Link href="/" className="flex items-center gap-3 group">
        {!imageError ? (
          <div className="h-10 w-auto flex items-center justify-start group-hover:scale-105 transition-transform origin-left">
            <img 
              src="/android-chrome-512x512.png" 
              alt="PROD_CORE Logo" 
              className="h-full w-auto object-contain rounded-xl"
              onError={() => setImageError(true)}
            />
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block ml-3">PROD_CORE</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Buildings weight="duotone" className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block">PROD_CORE</span>
          </div>
        )}
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setLanguage(language === "en" ? "fr" : "en")}
          className="h-10 px-3 text-secondary-foreground rounded-full text-sm hover:text-lg hover:font-bold font-mono tracking-widest uppercase transition-colors"
        >
          {language}
        </button>
        <ThemeToggle />
        <Link href="/login">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 px-5 bg-foreground text-background text-sm font-medium rounded-full shadow-sm"
          >
            {t("header_signIn")}
          </motion.button>
        </Link>
      </div>
    </motion.header>
  )
}
