"use client"

import React, { useEffect } from "react"
import { motion } from "framer-motion"
import { X, Play, Clock, CheckCircle, Cube, WarningCircle, Robot } from "@phosphor-icons/react"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { t } from "@/lib/i18n"
import { calculateProductionCost } from "@/lib/production-calculations"

interface DrawerProps {
  moId: string
  onClose: () => void
}

export function ManufacturingOrderDrawer({ moId, onClose }: DrawerProps) {
  const { activeMOs, materials, activeUnit, products, machines, lines, boms } = useMockData()
  const { language } = useLanguage()
  const mo = activeMOs.find(m => m.id === moId)
  
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  if (!mo) return null

  const estimate = calculateProductionCost({
    productId: mo.productId,
    lineId: mo.lineId,
    targetQty: mo.targetQty,
    products,
    boms,
    materials,
    lines,
    machines,
  })

  const unitLabel = activeUnit === "batches" ? t(language, 'batches') : activeUnit === "tons" ? t(language, 'tons') : t(language, 'kg');

  return (
    <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-2xl h-[100dvh] bg-card border-l border-border shadow-2xl flex flex-col pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border/50 bg-background/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl text-foreground font-display font-bold uppercase tracking-tight">{mo.id}</h2>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-medium">
                {mo.status === "PENDING" && <><Clock className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-muted-foreground">{t(language, 'pending')}</span></>}
                {mo.status === "IN_PROGRESS" && <><Play className="w-3.5 h-3.5 text-amber-500" weight="fill" /><span className="text-amber-600">{t(language, 'in-progress')}</span></>}
                {mo.status === "COMPLETED" && <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" weight="fill" /><span className="text-emerald-600">{t(language, 'completed')}</span></>}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {/* Bill of Materials comes first because launch readiness depends on composition before any other production data. */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>{t(language, 'composition-bom')}</span>
              <span className="text-foreground">{estimate.materialBreakdown.length} {t(language, 'items')}</span>
            </h3>
            
            <div className="flex flex-col border border-border/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-4">{t(language, 'material')}</div>
                <div className="col-span-2 text-right">{t(language, 'unit-cost')}</div>
                <div className="col-span-2 text-right">{t(language, 'required')}</div>
                <div className="col-span-2 text-right">{t(language, 'projected')}</div>
                <div className="col-span-2">{t(language, 'note')}</div>
              </div>
              
              <div className="flex flex-col divide-y divide-border/50">
                {estimate.materialBreakdown.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-3 text-sm items-center bg-card hover:bg-muted/20 transition-colors">
                    <div className="col-span-4 flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                      <Cube className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{item.material?.name || item.materialId}</span>
                    </div>
                    <div className="col-span-2 text-right font-mono text-red-500">
                      {Math.round(item.unitCost).toLocaleString()}
                    </div>
                    <div className="col-span-2 text-right font-mono text-red-500">
                      {item.requiredQty.toFixed(2)}
                    </div>
                    <div className={`col-span-2 text-right font-mono ${item.hasShortage ? "text-red-500" : "text-muted-foreground"}`}>
                      {item.projectedBalance.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground truncate">
                      {item.note || item.material?.note || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Production Specs */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{t(language, 'production-specs')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">{t(language, 'target-volume')}</span>
                <span className="text-xl text-foreground font-display font-bold">
                  {Math.round(mo.targetQty * (activeUnit === "batches" ? 1 : activeUnit === "tons" ? 1.5 : 1500)).toLocaleString()}{" "}
                  <span className="text-base text-muted-foreground font-normal">
                    {unitLabel}
                  </span>
                </span>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">{t(language, 'routing-line')}</span>
                <span className="text-xl font-display text-foreground font-bold">{mo.routing}</span>
              </div>
              
              {mo.status === "COMPLETED" && (
                <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1 col-span-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-semibold">
                    <CheckCircle className="text-emerald-500 w-4 h-4" weight="fill" />
                    {t(language, 'quality-check-verification')}
                  </span>
                  <span className="text-xl text-foreground font-display font-bold">
                    {mo.passedQCBatches !== undefined ? mo.passedQCBatches : mo.targetQty}{" "}
                    <span className="text-base text-muted-foreground font-normal">
                      {t(language, 'out-of')} {mo.targetQty} {t(language, 'passed-validation')}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Estimated Financials */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{t(language, 'estimated-financials')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-semibold">{t(language, 'calculated-cost')}</span>
                <span className="text-lg text-red-500 font-display font-bold">
                  {Math.round(estimate.totalCost).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">FCFA</span>
                </span>
                <span className="text-[9px] text-muted-foreground leading-tight">Fixed + BOM + labor + machine + VNC</span>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-semibold">{t(language, 'target-price')}</span>
                <span className="text-lg text-red-500 font-display font-bold">
                  {Math.round(estimate.targetSellingPrice).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">FCFA</span>
                </span>
                <span className="text-[9px] text-muted-foreground leading-tight">{estimate.targetMarginPercent}% {t(language, 'target-margin')}</span>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-semibold">{t(language, 'gross-margin')}</span>
                <span className={`text-lg font-display font-bold ${estimate.marginValue >= 0 ? "text-red-500" : "text-rose-500"}`}>
                  {Math.round(estimate.marginValue).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">FCFA</span>
                </span>
                <span className="text-[9px] text-muted-foreground font-mono leading-tight">{t(language, 'calculated-value')}</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{t(language, 'quality-automation')}</h3>
            <div className="grid grid-cols-1 gap-3">
              {estimate.product?.aiEnabled && (
                <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex gap-3">
                  <Robot className="w-5 h-5 text-primary shrink-0" weight="duotone" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{t(language, 'ai-checks-enabled')}</p>
                    <p className="text-xs text-muted-foreground">{t(language, 'ai-checks-desc')}</p>
                  </div>
                </div>
              )}
              {estimate.product?.qualityControls?.map(item => (
                <div key={item} className="p-3 rounded-lg border border-border/50 bg-card flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-emerald-500" weight="fill" />
                  {item}
                </div>
              ))}
              {estimate.machineBreakdown.some(item => item.alert) && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 flex gap-3">
                  <WarningCircle className="w-5 h-5 shrink-0" weight="fill" />
                  <div className="text-xs leading-relaxed">
                    {estimate.machineBreakdown.map(item => item.alert).filter(Boolean).map((alert, idx) => (
                      <p key={idx}>{alert}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border/50 bg-background/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors border border-transparent"
          >
            {t(language, 'cancel')}
          </button>
          
          {mo.status === "PENDING" && (
            <button 
              disabled
              className="px-6 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-md cursor-not-allowed flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {t(language, 'awaiting-operator-action')}
            </button>
          )}

          {mo.status === "IN_PROGRESS" && (
            <button 
              disabled
              className="px-6 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-md cursor-not-allowed flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {t(language, 'execution-in-progress')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
