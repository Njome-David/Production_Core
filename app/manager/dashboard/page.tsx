"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { t } from "@/lib/i18n"
import { Play, CheckCircle, Clock, PresentationChart, CaretRight, Plus, X, Factory, WarningCircle } from "@phosphor-icons/react"
import { ManufacturingOrderDrawer } from "@/components/manager/ManufacturingOrderDrawer"
import { ManufacturingOrder } from "@/lib/mock-db"
import { calculateProductionCost } from "@/lib/production-calculations"

export default function ManagerDashboard() {
  const { activeMOs, products, lines, boms, materials, machines, addOrder, activeUnit, setActiveUnit } = useMockData()
  const { language } = useLanguage()
  const [selectedMoId, setSelectedMoId] = useState<string | null>(null)
  
  const [showNewMoModal, setShowNewMoModal] = useState(false)
  const [newMoProductId, setNewMoProductId] = useState("")
  const [newMoLineId, setNewMoLineId] = useState("")
  const [newMoTargetQtyInput, setNewMoTargetQtyInput] = useState(10)
  const [newMoScheduledDate, setNewMoScheduledDate] = useState("")

  // Conversion factors relative to batches
  const unitFactor = activeUnit === "batches" ? 1 : activeUnit === "tons" ? 1.5 : 1500;
  const unitLabel = activeUnit === "batches" ? t(language, 'batches') : activeUnit === "tons" ? t(language, 'tons') : t(language, 'kg');

  // Target Qty in standard batches database unit
  const targetQtyInBatches = newMoTargetQtyInput / unitFactor;
  
  const estimate = React.useMemo(() => {
    if (!newMoProductId || !newMoLineId || targetQtyInBatches <= 0) return null
    return calculateProductionCost({
      productId: newMoProductId,
      lineId: newMoLineId,
      targetQty: targetQtyInBatches,
      products,
      boms,
      materials,
      lines,
      machines,
    })
  }, [newMoProductId, newMoLineId, targetQtyInBatches, products, boms, materials, lines, machines])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { ease: [0.32, 0.72, 0, 1] as const, duration: 0.5 } }
  }

  const handleCreateMo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMoProductId || !newMoLineId || targetQtyInBatches <= 0 || !estimate?.isLaunchReady) return

    const newMo: ManufacturingOrder = {
      id: `mo_${Date.now()}`,
      productId: newMoProductId,
      lineId: newMoLineId,
      status: "PENDING",
      targetQty: targetQtyInBatches,
      qcStatus: "UNDONE",
      ...(newMoScheduledDate && { programmedDate: newMoScheduledDate })
    }
    
    addOrder(newMo)
    setShowNewMoModal(false)
    setNewMoProductId("")
    setNewMoLineId("")
    setNewMoTargetQtyInput(activeUnit === "kg" ? 15000 : activeUnit === "tons" ? 15 : 10)
    setNewMoScheduledDate("")
  }

  const canDispatch = Boolean(newMoProductId && newMoLineId && targetQtyInBatches > 0 && estimate?.isLaunchReady)

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      {/* Header section: Asymmetric design */}
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6 }}
          className="max-w-xl flex flex-col gap-4"
        >
          <div>
            <h1 className="text-4xl text-foreground font-display font-bold tracking-tight mb-2">{t(language, 'live-monitor')}</h1>
            <p className="text-muted-foreground text-lg">{t(language, 'live-monitor-desc')}</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setShowNewMoModal(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors w-max shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
            >
              <Plus weight="bold" className="w-4 h-4" />
              {t(language, 'launch-order')}
            </button>

            {/* Premium Unit Segmented Switcher */}
            <div className="flex bg-muted/40 p-1 rounded-xl border border-border/50 w-max">
              {(["batches", "tons", "kg"] as const).map(unit => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => {
                    setActiveUnit(unit);
                    const oldFactor = unitFactor;
                    const newFactor = unit === "batches" ? 1 : unit === "tons" ? 1.5 : 1500;
                    setNewMoTargetQtyInput(Math.round((newMoTargetQtyInput / oldFactor) * newFactor));
                  }}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg transition-colors ${activeUnit === unit ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t(language, unit)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* KPI blocks */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.1 }}
          className="flex gap-4"
        >
          <div className="flex flex-col border border-border bg-card p-4 rounded-xl min-w-[140px]">
            <span className="text-xs font-mono text-muted-foreground mb-1 tracking-wider">{t(language, 'active-mos')}</span>
            <span className="text-3xl font-display font-bold text-foreground">{activeMOs.filter(mo => mo.status !== "COMPLETED").length}</span>
          </div>
          <div className="flex flex-col border border-border bg-card p-4 rounded-xl min-w-[140px]">
            <span className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">{unitLabel}/Hr ({t(language, 'avg')})</span>
            <span className="text-3xl font-display font-bold text-foreground">
              {Math.round(14.2 * unitFactor).toLocaleString()}
            </span>
          </div>
        </motion.div>
      </div>

      {/* MO List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider border-b border-border/50">
          <div className="col-span-2">{t(language, 'order-id')}</div>
          <div className="col-span-4">{t(language, 'product-formulation')}</div>
          <div className="col-span-2">{unitLabel}</div>
          <div className="col-span-2">{t(language, 'status')}</div>
          <div className="col-span-2 text-right">{t(language, 'actions')}</div>
        </div>

        {activeMOs.map(mo => (
          <motion.div 
            key={mo.id} 
            variants={itemVariants}
            className="group"
          >
            <button 
              onClick={() => setSelectedMoId(mo.id)}
              className="w-full text-left grid grid-cols-12 gap-4 items-center px-4 py-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-primary transition-colors duration-300"></div>
              
              <div className="col-span-2 font-mono text-sm text-foreground font-medium">
                #{mo.id}
              </div>
              
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-background flex items-center justify-center">
                  <PresentationChart className="bg-background w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{mo.productName}</div>
                  <div className="text-xs text-muted-foreground font-mono">{mo.routing}</div>
                </div>
              </div>
              
              <div className="col-span-2 text-sm text-foreground flex flex-col justify-center">
                <div><span className="font-mono">{Math.round(mo.targetQty * unitFactor).toLocaleString()}</span> <span className="text-muted-foreground text-xs">{unitLabel}</span></div>
                {mo.programmedDate && <span className="text-xs text-amber-600 font-mono">Sch: {mo.programmedDate}</span>}
              </div>
              
              <div className="col-span-2 flex items-center gap-2">
                {mo.status === "PENDING" && (
                  <>
                    <Clock className="text-muted-foreground w-4 h-4" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">{t(language, 'pending')}</span>
                      {mo.programmedDate && (
                        <span className="text-[10px] text-amber-500 font-mono leading-none mt-0.5">
                          {t(language, 'waiting-for')} {mo.programmedDate}
                        </span>
                      )}
                    </div>
                  </>
                )}
                {mo.status === "IN_PROGRESS" && <><Play className="text-amber-500 w-4 h-4" weight="fill" /><span className="text-sm text-amber-600 font-medium">{t(language, 'in-progress')}</span></>}
                {mo.status === "COMPLETED" && (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="text-emerald-500 w-4 h-4" weight="fill" />
                      <span className="text-sm text-emerald-600 font-medium">{t(language, 'completed')}</span>
                    </div>
                    {mo.passedQCBatches !== undefined && (
                      <span className="text-[10px] text-muted-foreground font-mono leading-none mt-0.5">
                        {t(language, 'passed')} {mo.passedQCBatches} / {mo.targetQty} {t(language, 'batches')}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="col-span-2 flex items-center justify-end gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <span className="text-sm font-medium">{t(language, 'view-details')}</span>
                <CaretRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        ))}
        
        {activeMOs.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl">
            <PresentationChart className="w-8 h-8 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">{t(language, 'no-active-orders')}</p>
          </div>
        )}
      </motion.div>

      {/* Slide-out MO Drawer */}
      <AnimatePresence>
        {selectedMoId && (
          <ManufacturingOrderDrawer 
            moId={selectedMoId} 
            onClose={() => setSelectedMoId(null)} 
          />
        )}
      </AnimatePresence>

      {/* New MO Modal */}
      <AnimatePresence>
        {showNewMoModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowNewMoModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-lg max-h-screen overflow-y-auto scrollbar-none pointer-events-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-8 overflow-hidden ">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Factory className="w-6 h-6 text-primary" weight="duotone" />
                  </div>
                  <button 
                    onClick={() => setShowNewMoModal(false)}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-display font-bold tracking-tight mb-2">{t(language, 'program-mo')}</h2>
                <p className="text-muted-foreground text-sm mb-8">
                  {t(language, 'create-mo-desc')}
                </p>

                <form onSubmit={handleCreateMo} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t(language, 'product-formulation')}</label>
                    <select 
                      value={newMoProductId}
                      onChange={(e) => setNewMoProductId(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none"
                      required
                    >
                      <option value="" disabled>-- {language === "fr" ? "Sélectionner un produit" : "Select a Product"} --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t(language, 'production-line')}</label>
                    <select 
                      value={newMoLineId}
                      onChange={(e) => setNewMoLineId(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none"
                      required
                    >
                      <option value="" disabled>-- {language === "fr" ? "Sélectionner une ligne" : "Select a Line"} --</option>
                      {lines.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t(language, 'target-volume')} ({unitLabel})</label>
                    <input 
                      type="number" 
                      min="1"
                      step="1"
                      value={newMoTargetQtyInput || ""}
                      onChange={(e) => setNewMoTargetQtyInput(parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-mono"
                      required
                    />
                  </div>
 
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t(language, 'scheduled-date-optional')}</label>
                    <input 
                      type="date"
                      value={newMoScheduledDate}
                      onChange={(e) => setNewMoScheduledDate(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-mono"
                    />
                  </div>
 
                  {estimate && (
                    <div className="flex flex-col gap-3 mt-2">
                      {(!estimate.isLaunchReady || estimate.machineBreakdown.some(item => item.alert)) && (
                        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 flex gap-3">
                          <WarningCircle className="w-5 h-5 shrink-0" weight="fill" />
                          <div className="text-xs leading-relaxed">
                            {estimate.missingPricingDetails.length > 0 && (
                              <p className="font-mono font-bold">
                                {language === "fr" ? "Détails de prix manquants : " : "Missing price details: "}
                                {estimate.missingPricingDetails.join(", ")}
                              </p>
                            )}
                            {estimate.hasShortage && (
                              <p className="font-mono font-bold">
                                {language === "fr" ? "Les prévisions de stock ne peuvent pas couvrir cette commande." : "Stock forecast cannot cover this order."}
                              </p>
                            )}
                            {estimate.machineBreakdown.map(item => item.alert).filter(Boolean).map((alert, idx) => (
                              <p key={idx}>{alert}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase leading-none mb-1">{t(language, 'calculated-cost')}</span>
                        <span className="text-lg font-mono font-bold text-red-500">{Math.round(estimate.totalCost).toLocaleString()} FCFA</span>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase leading-none mb-1">{t(language, 'target-price')} ({estimate.targetMarginPercent}%)</span>
                        <span className="text-lg font-mono font-bold text-red-500">{Math.round(estimate.targetSellingPrice).toLocaleString()} FCFA</span>
                      </div>
                      <div className="col-span-2 p-4 bg-muted/30 rounded-xl border border-border/50 grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="block text-muted-foreground uppercase font-mono">{t(language, 'materials')}</span>
                          <span className="font-mono text-red-500 font-bold">{Math.round(estimate.materialsCost).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground uppercase font-mono">{t(language, 'machines')}</span>
                          <span className="font-mono text-red-500 font-bold">{Math.round(estimate.machineCost).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground uppercase font-mono">{t(language, 'labor')}</span>
                          <span className="font-mono text-red-500 font-bold">{Math.round(estimate.laborCost).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    </div>
                  )}
 
                  <button 
                    type="submit"
                    disabled={!canDispatch}
                    className="w-full mt-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
                  >
                    <Play weight="fill" className="w-5 h-5" />
                    {t(language, 'dispatch-to-floor')}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
