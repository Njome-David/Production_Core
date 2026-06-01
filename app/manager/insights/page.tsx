"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { ChartLineUp, CurrencyDollar, FileText, ArrowUpRight, Package } from "@phosphor-icons/react"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { t } from "@/lib/i18n"
import { calculateProductionCost } from "@/lib/production-calculations"

export default function InsightsPage() {
  const { inventoryLedger, activeMOs, materials, products, boms, lines, machines } = useMockData()
  const { language } = useLanguage()

  // Calculate Insights
  const insights = useMemo(() => {
    const totalRefillCost = inventoryLedger
      .filter(l => l.type === "REFILL")
      .reduce((sum, l) => sum + l.totalValue, 0)
      
    const completedOrders = activeMOs.filter(mo => mo.status === "COMPLETED")
    
    // Reuse the shared production formula so insight margins stay aligned with launch validation.
    const estimatedCostOfGoods = completedOrders.reduce((sum, mo) => {
      return sum + calculateProductionCost({ productId: mo.productId, lineId: mo.lineId, targetQty: mo.targetQty, products, boms, materials, lines, machines }).totalCost
    }, 0)
    
    const estimatedRevenue = completedOrders.reduce((sum, mo) => {
      return sum + calculateProductionCost({ productId: mo.productId, lineId: mo.lineId, targetQty: mo.targetQty, products, boms, materials, lines, machines }).targetSellingPrice
    }, 0)

    const grossMargin = estimatedRevenue - estimatedCostOfGoods

    return {
      totalRefillCost,
      completedOrdersCount: completedOrders.length,
      estimatedCostOfGoods,
      estimatedRevenue,
      grossMargin
    }
  }, [inventoryLedger, activeMOs, materials, products, boms, lines, machines])

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6 }}
          className="max-w-xl"
        >
          <h1 className="text-4xl font-display text-foreground font-bold tracking-tight mb-2">{t(language, 'financial-insights')}</h1>
          <p className="text-muted-foreground text-lg">{t(language, 'insights-desc')}</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="p-6 border border-border rounded-2xl bg-card flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center mb-2">
            <CurrencyDollar className="w-5 h-5 text-emerald-600" weight="duotone" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">{t(language, 'estimated-revenue')}</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl text-foreground font-display font-bold">{insights.estimatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FCFA</span>
          </div>
        </div>

        <div className="p-6 border border-border rounded-2xl bg-card flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center mb-2">
            <ChartLineUp className="w-5 h-5 text-amber-600" weight="duotone" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">{t(language, 'cost-of-goods')}</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl text-foreground font-display font-bold">{insights.estimatedCostOfGoods.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FCFA</span>
          </div>
        </div>
        
        <div className="p-6 border border-border rounded-2xl bg-card flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center mb-2">
            <ArrowUpRight className="w-5 h-5 text-primary" weight="duotone" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">{t(language, 'gross-margin')}</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl text-foreground font-display font-bold">{insights.grossMargin.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FCFA</span>
          </div>
        </div>

        <div className="p-6 border border-border rounded-2xl bg-card flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center mb-2">
            <Package className="w-5 h-5 text-indigo-600" weight="duotone" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">{t(language, 'completed-mos')}</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl text-foreground font-display font-bold">{insights.completedOrdersCount}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.2 }}
          className="flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <h3 className="font-display text-foreground font-bold text-lg">{t(language, 'recent-ledger')}</h3>
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
             {inventoryLedger.filter(l => l.type === "REFILL").slice(0, 10).map(entry => {
                const mat = materials.find(m => m.id === entry.materialId)
                const unitWord = mat?.unit || (language === 'fr' ? 'Unités' : 'Units')
                const singularUnitWord = mat?.unit || (language === 'fr' ? 'Unité' : 'Unit')
                return (
                  <div key={entry.id} className="p-4 border-b border-border/30 last:border-0 flex flex-col gap-1 hover:bg-muted/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm text-foreground">{mat?.name || entry.materialId}</span>
                      <span className="font-mono text-sm font-bold text-foreground">
                        {entry.totalValue.toFixed(0)} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span className="font-mono">{new Date(entry.timestamp).toLocaleString()}</span>
                      <span className="font-mono">{entry.quantity} {unitWord} {language === 'fr' ? 'à' : 'at'} {(entry.totalValue / entry.quantity).toFixed(0)} FCFA/{singularUnitWord}</span>
                    </div>
                  </div>
                )
             })}
             {inventoryLedger.filter(l => l.type === "REFILL").length === 0 && (
               <div className="p-8 text-center text-sm text-muted-foreground">{t(language, 'no-records')}</div>
             )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.3 }}
          className="flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <h3 className="font-display text-foreground font-bold text-lg">{t(language, 'margin-visualizer')}</h3>
            <ChartLineUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center gap-4 min-h-[300px]">
            {/* Animated Concentric Rings SVG Visualizer */}
            {(() => {
              const cogsPct = insights.estimatedRevenue > 0 ? (insights.estimatedCostOfGoods / insights.estimatedRevenue) * 100 : 0
              const marginPct = insights.estimatedRevenue > 0 ? (insights.grossMargin / insights.estimatedRevenue) * 100 : 0

              const circ1 = 2 * Math.PI * 75  // ~471.2
              const circ2 = 2 * Math.PI * 55  // ~345.6
              const circ3 = 2 * Math.PI * 35  // ~219.9

              return (
                <div className="w-full max-w-sm flex flex-col items-center gap-6">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                      {/* Background tracks */}
                      <circle cx="100" cy="100" r="75" stroke="currentColor" className="text-muted/10" strokeWidth="12" fill="transparent" />
                      <circle cx="100" cy="100" r="55" stroke="currentColor" className="text-muted/10" strokeWidth="12" fill="transparent" />
                      <circle cx="100" cy="100" r="35" stroke="currentColor" className="text-muted/10" strokeWidth="12" fill="transparent" />
                      
                      {/* Revenue (100%) */}
                      <motion.circle 
                        cx="100" 
                        cy="100" 
                        r="75" 
                        stroke="#10B981" // Emerald-500
                        strokeWidth="12" 
                        fill="transparent" 
                        strokeDasharray={circ1}
                        initial={{ strokeDashoffset: circ1 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        strokeLinecap="round"
                      />
                      {/* Cost of Goods */}
                      <motion.circle 
                        cx="100" 
                        cy="100" 
                        r="55" 
                        stroke="#F59E0B" // Amber-500
                        strokeWidth="12" 
                        fill="transparent" 
                        strokeDasharray={circ2}
                        initial={{ strokeDashoffset: circ2 }}
                        animate={{ strokeDashoffset: circ2 - (circ2 * Math.min(100, cogsPct)) / 100 }}
                        transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        strokeLinecap="round"
                      />
                      {/* Gross Margin */}
                      <motion.circle 
                        cx="100" 
                        cy="100" 
                        r="35" 
                        stroke="#10b981" // Primary theme color
                        strokeWidth="12" 
                        fill="transparent" 
                        strokeDasharray={circ3}
                        initial={{ strokeDashoffset: circ3 }}
                        animate={{ strokeDashoffset: circ3 - (circ3 * Math.max(0, Math.min(100, marginPct))) / 100 }}
                        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Centered statistics HUD */}
                    <div className="absolute flex flex-col items-center justify-center text-center font-sans">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">{t(language, 'gross-margin')}</span>
                      <span className="text-xl font-display font-bold text-foreground">{marginPct.toFixed(1)}%</span>
                      <span className="text-[9px] text-emerald-500 font-mono mt-0.5 uppercase tracking-widest font-bold">{t(language, 'healthy')}</span>
                    </div>
                  </div>

                  {/* High-fidelity custom legend */}
                  <div className="w-full flex flex-col gap-2.5 bg-muted/20 p-4 rounded-xl border border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-muted-foreground font-medium">{t(language, 'revenue-stream')}</span>
                      </div>
                      <span className="font-mono text-foreground font-bold">100%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-muted-foreground font-medium">{t(language, 'cost-of-goods')}</span>
                      </div>
                      <span className="font-mono text-foreground font-bold">{cogsPct.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded bg-primary" />
                        <span className="text-muted-foreground font-medium">{t(language, 'net-profit-margin')}</span>
                      </div>
                      <span className="font-mono text-foreground font-bold">{marginPct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )
            })()}
            
            <p className="text-xs text-muted-foreground font-mono mt-4 text-center max-w-xs leading-relaxed">
              {t(language, 'margin-note')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
