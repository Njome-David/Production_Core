"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { dictionary, type Language, type DictionaryKeys } from "@/lib/i18n/dictionary"

interface LanguageContextProps {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: DictionaryKeys) => string
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = useCallback((key: DictionaryKeys) => {
    return dictionary[language][key]
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
