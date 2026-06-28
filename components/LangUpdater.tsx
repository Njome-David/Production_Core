"use client"

import { useEffect } from "react"
import { useLanguage } from "@/providers/LanguageProvider"

export function LangUpdater() {
  const { language } = useLanguage()

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return null
}
