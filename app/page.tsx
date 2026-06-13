"use client"

import { Header } from "@/components/landing/Header"
import { HeroSection } from "@/components/landing/HeroSection"
import { StatsMarquee } from "@/components/landing/StatsMarquee"
import { DetailedModules } from "@/components/landing/DetailedModules"
import { LanguageProvider, useLanguage } from "@/components/landing/LanguageProvider"

function LandingPageContent() {
  const { t } = useLanguage()

  return (
    <main className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-accent-green/30 overflow-x-hidden w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Header />
      <div className="pt-6" />
      <HeroSection />
      <StatsMarquee />
      <div id="modules" className="scroll-mt-20 w-full">
        <DetailedModules />
      </div>
      
      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-6 mt-12 text-center w-full">
        <div className="flex justify-center mb-6">
          <div className="w-48 h-16 flex items-center justify-center overflow-hidden relative rounded-2xl shadow-sm opacity-80">
             <img 
               src="/logo.png" 
               alt="PROD_CORE Logo" 
               className="w-full object-contain rounded-xl grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" 
             />
          </div>
        </div>
        <p className="text-muted-foreground font-sans text-sm">
          {t("footer_copy")}
        </p>
      </footer>
    </main>
  )
}

export default function Home() {
  return (
    <LanguageProvider>
      <LandingPageContent />
    </LanguageProvider>
  )
}
