"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { X, Play, Clock, CheckCircle, Cube, Drop, Hash, ArrowsLeftRight } from "@phosphor-icons/react"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { computeSellingPrice } from "@/lib/pricing"

interface DrawerProps {
  moId: string
  onClose: () => void
}

export function ManufacturingOrderDrawer({ moId, onClose }: DrawerProps) {
  const { activeMOs, setMOStatus, updateMO, materials, activeUnit, products, machines, lines, boms, qualityGates, additionalCosts, recordInventoryTransaction } = useMockData()
  const mo = activeMOs.find(m => m.id === moId)
  const { t } = useLanguage()

  const [showFinalizeForm, setShowFinalizeForm] = useState(false)
  const [actualCosts, setActualCosts] = useState<Record<string, number>>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  if (!mo) return null

  const product = products.find(p => p.id === mo.productId)

  const bom = boms.find(b => b.productId === mo.productId)
  const materialsCost = bom?.lines.reduce((acc, line) => {
    const mat = materials.find(m => m.id === line.materialId)
    const bomSumKg = bom.lines.reduce((s, r) => s + r.quantityPerUnit, 0)
    const finalMass = bom.unit === 'kg' ? bomSumKg : (product?.finalMass || 100)
    const qty = bom.unit === 'pct' ? (line.quantityPerUnit / 100) * finalMass : line.quantityPerUnit
    return acc + (qty * mo.targetQty * (mat?.costAvg || 250))
  }, 0) || 0

  let opCost = 0
  if (product?.routing) {
    product.routing.forEach(row => {
      const mac = machines.find(m => m.id === row.machineId)
      const macOpCost = mac?.opCostPerHour || 0
      opCost += (row.usagePercentage / 100) * macOpCost * (row.timeInHours || 1)
      
      if (product.qualityGates) {
         const gateEntry = product.qualityGates.find(g => g.sequenceAfter === row.sequence)
         if (gateEntry) {
           const gate = qualityGates.find(q => q.id === gateEntry.gateId)
           const gateHours = gateEntry.timeInHours || 0.25
           opCost += (gate?.opCostPerHour || 0) * gateHours
         }
      }
    })
  }
  const totalOpCost = opCost * mo.targetQty

  const provisionalAdditionalCost = product?.additionalCosts?.reduce((acc, cost) => acc + cost.provisionalValue, 0) || 0
  const totalProvisionalAdditionalCost = provisionalAdditionalCost * mo.targetQty

  const fixedLaunchCost = 5000 
  
  let actualAddlCost = totalProvisionalAdditionalCost
  if (mo.status === 'FINAL' && mo.actualAdditionalCosts && Object.keys(mo.actualAdditionalCosts).length > 0) {
     actualAddlCost = Object.values(mo.actualAdditionalCosts).reduce((a, b) => a + b, 0)
  }

  const estimatedCost = fixedLaunchCost + materialsCost + totalOpCost + actualAddlCost
  const estimatedRevenue = product ? mo.targetQty * computeSellingPrice(product, boms, materials, machines, qualityGates) : 0
  
  const grossMargin = estimatedRevenue - estimatedCost
  const marginPercentage = estimatedRevenue > 0 ? (grossMargin / estimatedRevenue) * 100 : 0

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault()
    updateMO(mo.id, { actualAdditionalCosts: actualCosts, status: "FINAL" })
    setShowFinalizeForm(false)
  }

  const handleOpenFinalize = () => {
    const initial: Record<string, number> = {}
    if (product?.additionalCosts) {
      product.additionalCosts.forEach(ac => {
        initial[ac.costId] = ac.provisionalValue * mo.targetQty
      })
    }
    setActualCosts(initial)
    setShowFinalizeForm(true)
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-2xl h-[100dvh] bg-card border-l border-border shadow-2xl flex flex-col pointer-events-auto"
      >
        <div className="flex items-start justify-between p-6 border-b border-border/50 bg-background/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl text-foreground font-display font-bold uppercase tracking-tight">{mo.id}</h2>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-medium">
                {mo.status === "PENDING" && <><Clock className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-muted-foreground">{t("drawer_status_pending")}</span></>}
                {mo.status === "IN_PROGRESS" && <><Play className="w-3.5 h-3.5 text-amber-500" weight="fill" /><span className="text-amber-600">{t("drawer_status_inprogress")}</span></>}
                {mo.status === "COMPLETED" && <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" weight="fill" /><span className="text-emerald-600">{t("drawer_status_completed")}</span></>}
                {mo.status === "FINAL" && <><CheckCircle className="w-3.5 h-3.5 text-blue-500" weight="fill" /><span className="text-blue-600">FINAL</span></>}
              </div>
            </div>
            <p className="text-muted-foreground text-sm font-medium">{mo.productName}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{t("drawer_specs")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">{t("drawer_target_volume")}</span>
                <span className="text-xl text-foreground font-display font-bold">
                  {Math.round(mo.targetQty * (activeUnit === "units" ? 1 : activeUnit === "tons" ? 1.5 : 1500)).toLocaleString()}{" "}
                  <span className="text-base text-muted-foreground font-normal">
                    {activeUnit === "units" ? "Units" : activeUnit === "tons" ? "Tons" : "kg"}
                  </span>
                </span>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">{t("drawer_routing_line")}</span>
                <span className="text-xl font-display text-foreground font-bold">{mo.routing}</span>
              </div>
              
              {(mo.status === "COMPLETED" || mo.status === "FINAL") && (
                <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1 col-span-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-semibold">
                    <CheckCircle className="text-emerald-500 w-4 h-4" weight="fill" />
                    {t("drawer_qc_verification")}
                  </span>
                  <span className="text-xl text-foreground font-display font-bold">
                    {mo.passedQCBatches !== undefined ? mo.passedQCBatches : mo.targetQty}{" "}
                    <span className="text-base text-muted-foreground font-normal">
                      {t("drawer_qc_passed")} {mo.targetQty} {t("drawer_qc_batches")}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </section>

          {showFinalizeForm && (
            <section className="flex flex-col gap-4 p-5 border border-primary/30 bg-primary/5 rounded-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Drop className="w-4 h-4 text-primary" weight="fill" />
                  {t("drawer_finalize_title")}
                </h3>
              </div>
              <form onSubmit={handleFinalize} className="flex flex-col gap-4">
                {product?.additionalCosts && product.additionalCosts.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {product.additionalCosts.map(ac => {
                      const costDef = additionalCosts.find(c => c.id === ac.costId)
                      const expectedCost = ac.provisionalValue * mo.targetQty
                      return (
                        <div key={ac.costId} className="flex flex-col gap-1">
                          <label className="text-xs font-mono text-muted-foreground uppercase">{costDef?.name || ac.costId} ({t("drawer_finalize_prov")}: {expectedCost.toLocaleString()})</label>
                          <input 
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={actualCosts[ac.costId] !== undefined ? actualCosts[ac.costId] : ''}
                            onChange={(e) => setActualCosts({...actualCosts, [ac.costId]: parseFloat(e.target.value)})}
                            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                          />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-foreground">{t("drawer_finalize_no_costs")}</p>
                )}
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setShowFinalizeForm(false)} className="px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">{t("drawer_finalize_cancel")}</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm">{t("drawer_finalize_submit")}</button>
                </div>
              </form>
            </section>
          )}

          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{t("drawer_financials")}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-semibold">{t("drawer_est_cost")}</span>
                <span className="text-lg text-red-500 font-display font-bold">
                  {Math.round(estimatedCost).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">{t("drawer_currency")}</span>
                </span>
                <span className="text-[9px] text-muted-foreground leading-tight">{t("drawer_cost_breakdown")}</span>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-semibold">{mo.status === 'FINAL' ? 'Actual Revenue' : t("drawer_est_revenue")}</span>
                <span className="text-lg text-emerald-500 font-display font-bold">
                  {Math.round(estimatedRevenue).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">{t("drawer_currency")}</span>
                </span>
                <span className="text-[9px] text-muted-foreground leading-tight">{t("drawer_revenue_per_batch")}</span>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-semibold">{t("drawer_gross_margin")}</span>
                <span className={`text-lg font-display font-bold ${grossMargin >= 0 ? "text-primary" : "text-rose-500"}`}>
                  {Math.round(grossMargin).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">{t("drawer_currency")}</span>
                </span>
                <span className="text-[9px] text-muted-foreground font-mono leading-tight">({marginPercentage.toFixed(1)}% {t("drawer_yield")})</span>
              </div>
            </div>
            
            {mo.status === 'FINAL' && (
              <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">{t("drawer_financials")} — FINAL</span>
                {mo.actualAdditionalCosts && Object.keys(mo.actualAdditionalCosts).length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {Object.entries(mo.actualAdditionalCosts).map(([costId, value]) => {
                      const costDef = additionalCosts.find(c => c.id === costId)
                      return (
                        <div key={costId} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{costDef?.name || costId}</span>
                          <span className="font-mono font-medium text-foreground">{value.toLocaleString()} {t("drawer_currency")}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">{t("drawer_finalize_no_costs")}</span>
                )}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>{t("drawer_bom")}</span>
              <span className="text-foreground">{mo.bom?.lines.length ?? 0} {t("drawer_bom_items")}</span>
            </h3>
            
            <div className="flex flex-col border border-border/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-6">{t("drawer_th_material")}</div>
                <div className="col-span-3 text-right">{t("drawer_th_required")}</div>
                <div className="col-span-3 text-right">{t("drawer_th_inventory")}</div>
              </div>
              
              <div className="flex flex-col divide-y divide-border/50">
                {mo.bom?.lines.map((item, idx) => {
                  const mat = materials.find(m => m.id === item.materialId)
                  const bomSumKg = mo.bom?.lines.reduce((s, r) => s + r.quantityPerUnit, 0) || 0
                  const finalMass = mo.bom?.unit === 'kg' ? bomSumKg : (product?.finalMass || 100)
                  const unitQty = mo.bom?.unit === 'pct' ? (item.quantityPerUnit / 100) * finalMass : item.quantityPerUnit
                  
                  return (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-3 text-sm items-center bg-card hover:bg-muted/20 transition-colors">
                    <div className="col-span-6 flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                      <Cube className="w-4 h-4 text-muted-foreground animate-pulse" />
                      {mat?.name || item.materialId}
                    </div>
                    <div className="col-span-3 text-right font-mono text-muted-foreground">
                      {(unitQty * mo.targetQty).toFixed(2)}
                    </div>
                    <div className="col-span-3 text-right text-muted-foreground flex items-center justify-end gap-1 font-mono">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></div>
                      {t("drawer_stock_available")}
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-border/50 bg-background/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors border border-transparent"
          >
            {t("drawer_cancel")}
          </button>
          
          {mo.status === "PENDING" && (
            <button 
              disabled
              className="px-6 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-md cursor-not-allowed flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {t("drawer_badge_pending")}
            </button>
          )}

          {mo.status === "IN_PROGRESS" && (
            <button 
              disabled
              className="px-6 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-md cursor-not-allowed flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {t("drawer_badge_inprogress")}
            </button>
          )}

          {mo.status === "COMPLETED" && !showFinalizeForm && (
            <button 
              onClick={handleOpenFinalize}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
            >
              <Drop className="w-4 h-4" />
              {t("drawer_finalize_title")}
            </button>
          )}

          {mo.status === "FINAL" && (
            <button 
              disabled
              className="px-6 py-2 bg-muted/50 text-muted-foreground text-sm font-medium rounded-md cursor-not-allowed flex items-center gap-2 border border-border/50"
            >
              <CheckCircle className="w-4 h-4" weight="fill" />
              FINAL
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}