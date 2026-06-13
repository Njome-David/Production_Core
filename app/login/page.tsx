"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { BuildingsIcon, ArrowRight, House } from "@phosphor-icons/react"

export default function LoginPage() {
  const router = useRouter()
  const { setActiveSession } = useMockData()
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mocking auth success
    router.push("/org-selector")
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-background">
      {/* Back to landing */}
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted/60 backdrop-blur-sm"
      >
        <House weight="duotone" className="w-4 h-4" />
        <span className="font-medium hidden sm:inline">Home</span>
      </Link>

      {/* Left Asset Pane (50/50 Split) */}
      <div className="hidden md:flex flex-1 relative bg-card overflow-hidden items-end p-12">
        <div className="absolute inset-0 z-0">
          {/* We use a reliable abstract architectural image to replace the generic carpentry examples */}
          <img 
            src="/simon-kadula-8gr6bObQLOI-unsplash.jpg" 
            alt="Heavy Industrial Valves & Pipes" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-foreground leading-none mb-4">
              Precision Output.<br/>Zero Waste.
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Industrial-grade production management for any business type or size. Built for speed, resilient to chaos.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Auth Pane */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-24 pt-5 pb-12">
        <motion.div 
          className="w-full max-w-sm mx-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.1 }}
        >
          <div className="flex justify-center mb-12">
            <div className="w-48 h-16 flex items-center justify-center overflow-hidden relative rounded-2xl shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('fallback-icon'); }} />
              <div className="hidden fallback-icon-svg flex-col items-center gap-2 absolute inset-0 justify-center">
                <BuildingsIcon weight="duotone" className="w-12 h-12 text-foreground" />
                <span className="font-display font-bold text-foreground tracking-tight text-xl">PRODUCTION_CORE</span>
              </div>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            .fallback-icon-svg { display: none; }
            .fallback-icon .fallback-icon-svg { display: block; }
          `}} />

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-display text-foreground font-bold tracking-tight">
                {isSignUp ? "Create Account" : "Access Gateway"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isSignUp 
                  ? "Enter your details to provision a new manufacturing tenant profile." 
                  : "Enter your credentials to connect to the active facility."}
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              {isSignUp && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. David Vance"
                      className="h-11 px-4 bg-background text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" 
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-foreground">Company Name</label>
                    <input 
                      type="text" 
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Alpha Feed Co."
                      className="h-11 px-4 bg-background text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" 
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 px-4 bg-background text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 px-4 bg-background text-foreground border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="h-11 w-full bg-foreground text-background font-medium rounded-md flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors"
              >
                {isSignUp ? "Register tenant profile" : "Sign In"}
                <ArrowRight weight="bold" className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="h-11 w-full bg-background text-foreground border border-border font-medium rounded-md flex items-center justify-center gap-2 hover:bg-muted transition-colors"
              >
                {isSignUp ? "Already have an account? Sign In" : "Create New Account"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
