"use client"

import React from "react"
import { motion } from "framer-motion"
import { ChartLineUp, DeviceTablet, FolderOpen, Buildings, CheckCircle, PresentationChart } from "@phosphor-icons/react"
import { useLanguage } from "./LanguageProvider"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 }
  }
}

export function DetailedModules() {
  const { t } = useLanguage()

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-32">
      
      {/* 1. Dashboard & Financials */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col md:flex-row gap-12 items-center"
      >
        <motion.div variants={itemVariants} className="flex-1 flex flex-col gap-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <PresentationChart weight="duotone" className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            {t("mod_dashboard_title")}
          </h2>
          <ul className="space-y-4 mt-4">
            <li className="flex items-start gap-3">
              <CheckCircle weight="fill" className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-lg leading-relaxed">{t("mod_dashboard_desc1")}</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle weight="fill" className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-lg leading-relaxed">{t("mod_dashboard_desc2")}</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle weight="fill" className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-lg leading-relaxed">{t("mod_dashboard_desc3")}</p>
            </li>
          </ul>
        </motion.div>
        <motion.div variants={itemVariants} className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative bg-card border border-border rounded-[2rem] p-8 shadow-xl aspect-square flex flex-col gap-4">
             {/* Abstract UI representation of dashboard */}
             <div className="flex gap-4">
               <div className="h-24 flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col justify-center items-center group hover:bg-emerald-500/20 transition-colors cursor-default">
                 <span className="text-emerald-500 font-display font-bold text-2xl md:text-3xl group-hover:scale-110 transition-transform">$45.2k</span>
                 <span className="text-[10px] text-emerald-500/80 font-mono tracking-widest mt-1">REVENUE</span>
               </div>
               <div className="h-24 flex-1 bg-muted/50 rounded-xl flex flex-col justify-center items-center group hover:bg-muted/80 transition-colors cursor-default">
                 <span className="text-foreground font-display font-bold text-2xl md:text-3xl group-hover:scale-110 transition-transform">+12%</span>
                 <span className="text-[10px] text-muted-foreground font-mono tracking-widest mt-1">MARGIN</span>
               </div>
               <div className="h-24 flex-1 bg-muted/50 rounded-xl flex flex-col justify-center items-center group hover:bg-muted/80 transition-colors cursor-default">
                 <span className="text-foreground font-display font-bold text-2xl md:text-3xl group-hover:scale-110 transition-transform">$3.1k</span>
                 <span className="text-[10px] text-muted-foreground font-mono tracking-widest mt-1 text-center leading-tight mt-1">ADDED COSTS</span>
               </div>
             </div>
             <div className="flex-1 bg-muted/30 rounded-xl border border-border/50 flex flex-col items-center justify-center group hover:bg-muted/50 transition-colors cursor-default">
               <PresentationChart weight="duotone" className="w-12 h-12 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-emerald-500 transition-all mb-2" />
               <span className="text-muted-foreground font-sans font-medium opacity-50 group-hover:opacity-100 transition-opacity">Live Financial Graph</span>
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 2. Inventory & Config */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col md:flex-row-reverse gap-12 items-center"
      >
        <motion.div variants={itemVariants} className="flex-1 flex flex-col gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <FolderOpen weight="duotone" className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            {t("mod_inventory_title")}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t("mod_inventory_desc")}
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative bg-card border border-border rounded-[2rem] p-8 shadow-xl aspect-square flex flex-col gap-4">
             <div className="h-12 w-full bg-muted/50 rounded-lg flex items-center px-4 font-mono text-sm font-bold tracking-widest text-muted-foreground">ACTIVE BILL OF MATERIALS</div>
             <div className="flex-1 flex flex-col gap-3 mt-2">
               {[
                 { title: "Aluminum Chassis", sku: "SKU-992A" },
                 { title: "Logic Board v4", sku: "SKU-102B" },
                 { title: "Thermal Paste", sku: "SKU-332C" },
                 { title: "Assembly Screws", sku: "SKU-441D" }
               ].map((item, i) => (
                 <div key={i} className="h-16 w-full bg-muted/20 hover:bg-amber-500/10 transition-colors rounded-xl border border-border/50 hover:border-amber-500/30 flex items-center px-4 gap-4 cursor-default group">
                   <div className="w-8 h-8 rounded bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">{i+1}</div>
                   <div className="flex flex-col">
                     <span className="text-foreground font-medium text-sm group-hover:text-amber-500 transition-colors">{item.title}</span>
                     <span className="text-xs text-muted-foreground font-mono">{item.sku}</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Operator Tablet */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col md:flex-row gap-12 items-center"
      >
        <motion.div variants={itemVariants} className="flex-1 flex flex-col gap-6">
          <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center border border-accent-blue/20">
            <DeviceTablet weight="duotone" className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            {t("mod_operator_title")}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t("mod_operator_desc")}
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-accent-blue/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative bg-card border border-border rounded-[2rem] p-8 shadow-xl aspect-square flex flex-col items-center justify-center">
             <div className="w-full h-full max-h-[90%] border-[8px] border-border rounded-3xl bg-background overflow-hidden relative shadow-inner flex flex-col group">
               <div className="h-12 bg-accent-blue/10 border-b border-accent-blue/20 flex items-center px-4 justify-between">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-accent-blue/40" />
                   <div className="w-3 h-3 rounded-full bg-accent-blue/40" />
                   <div className="w-3 h-3 rounded-full bg-accent-blue/40" />
                 </div>
                 <span className="font-mono text-xs font-bold text-accent-blue tracking-widest uppercase">Operator #42</span>
               </div>
               <div className="p-4 flex flex-col gap-4 flex-1">
                  <div className="flex-1 bg-muted/20 hover:bg-muted/40 transition-colors rounded-xl border border-border/50 flex flex-col p-4 gap-2 cursor-default">
                     <span className="font-display font-bold text-lg text-foreground">Order #882-Alpha</span>
                     <span className="text-xs text-muted-foreground">Requires 50 units. Machine configured.</span>
                  </div>
                  <div className="h-24 bg-accent-blue text-white rounded-xl flex items-center justify-center group-hover:scale-[0.98] transition-transform cursor-pointer shadow-lg hover:shadow-accent-blue/50">
                     <span className="font-display font-bold text-xl tracking-wide uppercase">Start Production</span>
                  </div>
               </div>
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 4. Multi-Tenant */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col md:flex-row-reverse gap-12 items-center"
      >
        <motion.div variants={itemVariants} className="flex-1 flex flex-col gap-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
            <Buildings weight="duotone" className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            {t("mod_multitenant_title")}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t("mod_multitenant_desc")}
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative bg-card border border-border rounded-[2rem] p-8 shadow-xl aspect-square flex flex-col gap-4 items-center justify-center group">
             <div className="flex -space-x-4">
               <div className="w-24 h-24 rounded-full bg-card border-4 border-border shadow-lg flex items-center justify-center text-xl font-bold font-display text-muted-foreground z-30 group-hover:-translate-x-4 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all cursor-default">ORG 1</div>
               <div className="w-24 h-24 rounded-full bg-card border-4 border-border shadow-lg flex items-center justify-center text-xl font-bold font-display text-muted-foreground z-20 group-hover:-translate-y-4 group-hover:bg-amber-500/10 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-all cursor-default">ORG 2</div>
               <div className="w-24 h-24 rounded-full bg-card border-4 border-border shadow-lg flex items-center justify-center text-xl font-bold font-display text-muted-foreground z-10 group-hover:translate-x-4 group-hover:bg-purple-500/10 group-hover:text-purple-500 group-hover:border-purple-500/30 transition-all cursor-default">ORG 3</div>
             </div>
             <span className="absolute bottom-12 font-mono text-xs font-bold tracking-widest text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">ONE UNIFIED ACCOUNT</span>
          </div>
        </motion.div>
      </motion.div>

    </section>
  )
}
