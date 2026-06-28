"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { Play, Pause, CheckCircle, Clock, PresentationChart, CaretRight, Plus, X, Factory, Warning } from "@phosphor-icons/react"
import { ManufacturingOrderDrawer } from "@/components/manager/ManufacturingOrderDrawer"
import { ManufacturingOrder } from "@/lib/mock-db"

export default function ManagerDashboard() {
  const { activeMOs, products, lines, boms, materials, machines, qualityGates, addOrder, recordInventoryTransaction } = useMockData()
  const { t } = useLanguage()
  const [selectedMoId, setSelectedMoId] = useState<string | null>(null)
  
  const [filterProductId, setFilterProductId] = useState<string>("ALL")
  const [filterState, setFilterState] = useState<string>("ALL")

  
  const [showNewMoModal, setShowNewMoModal] = useState(false)
  const [newMoProductId, setNewMoProductId] = useState("")
  const [newMoLineId, setNewMoLineId] = useState("")
  const [newMoTargetQtyInput, setNewMoTargetQtyInput] = useState(10)
  const [newMoScheduledDate, setNewMoScheduledDate] = useState("")
  const [materialWarnings, setMaterialWarnings] = useState<{ type: 'error' | 'warn'; materialName: string; required: number; available: number }[]>([])
  const [showMaterialWarnings, setShowMaterialWarnings] = useState(false)

  // Display mode toggle: "units" shows # of batches, "qty" shows totalQty×finalMass in measureUnit
  const [displayMode, setDisplayMode] = useState<"units" | "qty">("units")

  const selectedProduct = products.find(p => p.id === newMoProductId)
  const productWeight = selectedProduct?.finalMass || 1
  const productUnit = selectedProduct?.measureUnit || "units"

  // Per-product mass calculation: pct mode uses finalMass, kg mode sums BOM
  const getProductMass = (productId: string): number => {
    const bom = boms.find(b => b.productId === productId)
    if (!bom) return 1
    if (bom.unit === 'pct') {
      const prod = products.find(p => p.id === productId)
      return prod?.finalMass || 1
    }
    // kg mode: sum of all BOM line quantities
    const sum = bom.lines.reduce((acc, line) => acc + line.quantityPerUnit, 0)
    return sum > 0 ? sum : 1
  }

  // Per-row unit helper: returns the product's measureUnit
  const getMOUnit = (productId: string): string => {
    const prod = products.find(p => p.id === productId)
    return prod?.measureUnit || 'kg'
  }

  // Compute volume display value depending on displayMode
  // units mode: just targetQty (number of batches / units produced)
  // qty mode: targetQty × product.finalMass in the product's measureUnit
  const getMODisplayQty = (targetQty: number, productId: string): { value: string; unit: string } => {
    const prod = products.find(p => p.id === productId)
    if (displayMode === 'units') {
      return { value: targetQty.toLocaleString(), unit: 'units' }
    }
    // qty mode
    const finalMass = prod?.finalMass || 1
    const total = targetQty * finalMass
    const unit = prod?.measureUnit || 'kg'
    return { value: total.toLocaleString(undefined, { maximumFractionDigits: 2 }), unit }
  }

  // Filter MOs
  const filteredMOs = React.useMemo(() => {
    return activeMOs.filter(mo => {
      if (filterProductId !== "ALL" && mo.productId !== filterProductId) return false
      if (filterState !== "ALL" && mo.status !== filterState) return false
      return true
    })
  }, [activeMOs, filterProductId, filterState])

  // Target qty in modal is always in product's native unit
  const targetQtyInBatches = newMoTargetQtyInput;
  
  // Calculate estimates
  const estRevenue = React.useMemo(() => {
    if (!newMoProductId || targetQtyInBatches <= 0) return 0
    const product = products.find(p => p.id === newMoProductId)
    return product ? product.price * targetQtyInBatches : 0
  }, [newMoProductId, targetQtyInBatches, products])

  const estCost = React.useMemo(() => {
    if (!newMoProductId || !newMoLineId || targetQtyInBatches <= 0) return 0
    let cost = 5000 // Fixed launching cost
    
    // Material Cost
    const bom = boms.find(b => b.productId === newMoProductId)
    if (bom) {
      for (const line of bom.lines) {
        const mat = materials.find(m => m.id === line.materialId)
        if (mat) {
          cost += line.quantityPerUnit * targetQtyInBatches * mat.costAvg
        }
      }
    }

    // Machine Cost + QC Gate Cost
    const product = products.find(p => p.id === newMoProductId)
    const line = lines.find(l => l.id === newMoLineId)
    if (line && product) {
      for (const mId of line.machineIds) {
        const machine = machines.find(m => m.id === mId)
        if (machine && machine.operationRate > 0) {
          cost += (targetQtyInBatches / machine.operationRate) * machine.maintenanceCostPerHour
        }
      }
      // QC Gate costs
      if (product.qualityGates) {
        for (const gateEntry of product.qualityGates) {
          const gate = qualityGates.find(g => g.id === gateEntry.gateId)
          const gateHours = gateEntry.timeInHours || 0.25
          // CORRECTION: Multiplication par targetQtyInBatches
          cost += (gate?.opCostPerHour || 0) * gateHours * targetQtyInBatches
        }
      }
      // CORRECTION: Ajout des coûts supplémentaires par unité
      if (product.additionalCosts) {
        for (const costEntry of product.additionalCosts) {
          cost += costEntry.provisionalValue * targetQtyInBatches
        }
      }
    }
    return cost
  }, [newMoProductId, newMoLineId, targetQtyInBatches, boms, materials, lines, machines, products, qualityGates])

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

  const validateMaterials = (productId: string, qty: number): { type: 'error' | 'warn'; materialName: string; required: number; available: number }[] => {
    const bom = boms.find(b => b.productId === productId)
    if (!bom) return []

    const issues: { type: 'error' | 'warn'; materialName: string; required: number; available: number }[] = []

    for (const line of bom.lines) {
      const mat = materials.find(m => m.id === line.materialId)
      if (!mat) continue

      const requiredQty = line.quantityPerUnit * qty
      const available = mat.balanceVolume
      const remaining = available - requiredQty

      if (remaining < 0) {
        issues.push({ type: 'error', materialName: mat.name, required: requiredQty, available })
      } else if (remaining < mat.threshold) {
        issues.push({ type: 'warn', materialName: mat.name, required: requiredQty, available })
      }
    }

    return issues
  }

  const handleCreateMo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMoProductId || !newMoLineId || targetQtyInBatches <= 0) return

    const issues = validateMaterials(newMoProductId, targetQtyInBatches)
    const errors = issues.filter(i => i.type === 'error')

    if (errors.length > 0) {
      setMaterialWarnings(issues)
      setShowMaterialWarnings(true)
      return
    }

    if (issues.length > 0) {
      setMaterialWarnings(issues)
      setShowMaterialWarnings(true)
      // Allow continuing with warnings
      return
    }

    setMaterialWarnings([])
    setShowMaterialWarnings(false)

    // Deduct materials
    const bom = boms.find(b => b.productId === newMoProductId)
    if (bom) {
      for (const line of bom.lines) {
        const mat = materials.find(m => m.id === line.materialId)
        if (mat) {
          recordInventoryTransaction({
            materialId: line.materialId,
            type: 'CONSUMPTION',
            quantity: line.quantityPerUnit * targetQtyInBatches,
            unitCost: mat.costAvg,
            totalValue: line.quantityPerUnit * targetQtyInBatches * mat.costAvg
          })
        }
      }
    }

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
    setNewMoTargetQtyInput(10)
    setNewMoScheduledDate("")
  }

  const handleForceCreate = () => {
    if (!newMoProductId || !newMoLineId || targetQtyInBatches <= 0) return

    const errors = materialWarnings.filter(i => i.type === 'error')
    if (errors.length > 0) return // still can't proceed with errors

    const bom = boms.find(b => b.productId === newMoProductId)
    if (bom) {
      for (const line of bom.lines) {
        const mat = materials.find(m => m.id === line.materialId)
        if (mat) {
          recordInventoryTransaction({
            materialId: line.materialId,
            type: 'CONSUMPTION',
            quantity: line.quantityPerUnit * targetQtyInBatches,
            unitCost: mat.costAvg,
            totalValue: line.quantityPerUnit * targetQtyInBatches * mat.costAvg
          })
        }
      }
    }

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
    setShowMaterialWarnings(false)
    setShowNewMoModal(false)
    setMaterialWarnings([])
    setNewMoProductId("")
    setNewMoLineId("")
    setNewMoTargetQtyInput(10)
    setNewMoScheduledDate("")
  }

  // Handle product selection to auto-assign line
  const handleProductChange = (productId: string) => {
    setNewMoProductId(productId)
    const product = products.find(p => p.id === productId)
    if (product && product.assignedLineIds && product.assignedLineIds.length > 0) {
      setNewMoLineId(product.assignedLineIds[0])
    } else {
      setNewMoLineId("")
    }
  }

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
            <h1 className="text-4xl text-foreground font-display font-bold tracking-tight mb-2">{t("dash_title")}</h1>
            <p className="text-muted-foreground text-lg">{t("dash_desc")}</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setShowNewMoModal(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors w-max shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
            >
              <Plus weight="bold" className="w-4 h-4" />
              {t("dash_btn_launch")}
            </button>

            {/* Units / Quantity display toggle */}
            <div className="flex bg-muted/40 p-1 rounded-xl border border-border/50 w-max">
              <button
                type="button"
                onClick={() => setDisplayMode("units")}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg transition-colors ${
                  displayMode === 'units' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t("dash_display_units")}
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("qty")}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg transition-colors ${
                  displayMode === 'qty' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t("dash_display_qty")}
              </button>
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
            <span className="text-xs font-mono text-muted-foreground mb-1 tracking-wider">{t("dash_kpi_active")}</span>
            <span className="text-3xl font-display font-bold text-foreground">{activeMOs.filter(mo => mo.status !== "COMPLETED").length}</span>
          </div>
          <div className="flex flex-col border border-border bg-card p-4 rounded-xl min-w-[140px]">
            <span className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">{t("dash_kpi_rate")}</span>
            <span className="text-3xl font-display font-bold text-foreground">
              {Math.round(14.2).toLocaleString()}
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
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-xl">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col gap-1 w-full md:w-48">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{t("dash_th_product")}</label>
              <select 
                value={filterProductId}
                onChange={(e) => setFilterProductId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
              >
                <option value="ALL">All Products</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1 w-full md:w-48">
              <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{t("dash_th_status")}</label>
              <select 
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
              >
                <option value="ALL">All States</option>
                <option value="PENDING">{t("dash_status_pending")}</option>
                <option value="IN_PROGRESS">{t("dash_status_inprogress")}</option>
                <option value="COMPLETED">{t("dash_status_completed")}</option>
                <option value="FINAL">FINAL</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider border-b border-border/50">
          <div className="col-span-2">{t("dash_th_order")}</div>
          <div className="col-span-4">{t("dash_th_product")}</div>
          <div className="col-span-2">{displayMode === 'units' ? t("dash_display_units") : t("dash_display_qty")}</div>
          <div className="col-span-2">{t("dash_th_status")}</div>
          <div className="col-span-2 text-right">{t("dash_th_actions")}</div>
        </div>

        {filteredMOs.map(mo => (
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
                {(() => {
                  const { value, unit } = getMODisplayQty(mo.targetQty, mo.productId)
                  return <div><span className="font-mono">{value}</span> <span className="text-muted-foreground text-xs font-mono">{unit}</span></div>
                })()}
                {mo.programmedDate && <span className="text-xs text-amber-600 font-mono">{t("dash_modal_sch")} {mo.programmedDate}</span>}
              </div>
              
              <div className="col-span-2 flex items-center gap-2">
                {mo.status === "PENDING" && (
                  <>
                    <Clock className="text-muted-foreground w-4 h-4" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">{t("dash_status_pending")}</span>
                      {mo.programmedDate && (
                        <span className="text-[10px] text-amber-500 font-mono leading-none mt-0.5">
                          {t("dash_status_waiting")} {mo.programmedDate}
                        </span>
                      )}
                    </div>
                  </>
                )}
                {mo.status === "IN_PROGRESS" && <><Play className="text-amber-500 w-4 h-4" weight="fill" /><span className="text-sm text-amber-600 font-medium">{t("dash_status_inprogress")}</span></>}
                {mo.status === "COMPLETED" && (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="text-emerald-500 w-4 h-4" weight="fill" />
                      <span className="text-sm text-emerald-600 font-medium">{t("dash_status_completed")}</span>
                    </div>
                    {mo.passedQCBatches !== undefined && (() => {
                      const product = products.find(p => p.id === mo.productId)
                      const hasQC = product?.qualityGates && product.qualityGates.length > 0
                      if (hasQC) {
                        return (
                          <span className="text-[10px] text-muted-foreground font-mono leading-none mt-0.5">
                            {t("dash_qc_passed")}: {mo.passedQCBatches} / {mo.targetQty} {getMOUnit(mo.productId)}
                          </span>
                        )
                      }
                      return null
                    })()}
                  </div>
                )}
                {mo.status === "FINAL" && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="text-blue-500 w-4 h-4" weight="fill" />
                    <span className="text-sm text-blue-600 font-medium">FINAL</span>
                  </div>
                )}
              </div>
              
              <div className="col-span-2 flex items-center justify-end gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <span className="text-sm font-medium">{t("dash_action_details")}</span>
                <CaretRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        ))}
        
        {filteredMOs.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl">
            <PresentationChart className="w-8 h-8 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">{t("dash_empty")}</p>
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
                
                <h2 className="text-2xl font-display font-bold tracking-tight mb-2">{t("dash_modal_title")}</h2>
                <p className="text-muted-foreground text-sm mb-8">
                  {t("dash_modal_desc")}
                </p>

                <form onSubmit={handleCreateMo} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("dash_modal_label_product")}</label>
                    <select 
                      value={newMoProductId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none"
                      required
                    >
                      <option value="" disabled>{t("dash_modal_placeholder_product")}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>

                  {newMoLineId && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("dash_modal_label_line")}</label>
                      <div className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-muted-foreground">
                        {lines.find(l => l.id === newMoLineId)?.name || "Auto-assigned"}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("dash_modal_label_volume")} ({selectedProduct ? productUnit : "units"})</label>
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
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("dash_modal_label_date")}</label>
                    <input 
                      type="date"
                      value={newMoScheduledDate}
                      onChange={(e) => setNewMoScheduledDate(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-mono"
                    />
                  </div>
 
                  {newMoProductId && newMoLineId && targetQtyInBatches > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase leading-none mb-1">{t("dash_modal_cost")}</span>
                        <span className="text-lg font-mono font-bold text-foreground">{Math.round(estCost).toLocaleString()} {t("dash_modal_currency")}</span>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase leading-none mb-1">{t("dash_modal_revenue")}</span>
                        <span className="text-lg font-mono font-bold text-emerald-500">{Math.round(estRevenue).toLocaleString()} {t("dash_modal_currency")}</span>
                      </div>
                    </div>
                  )}
 
                  {/* Material check warnings */}
                  {showMaterialWarnings && materialWarnings.length > 0 && (
                    <div className="flex flex-col gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                      <div className="flex items-center gap-2">
                        <Warning weight="fill" className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-bold text-foreground">Material Availability</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {materialWarnings.map((w, i) => (
                          <div key={i} className={`flex items-center justify-between text-xs p-2 rounded-lg ${w.type === 'error' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-700'}`}>
                            <span className="font-medium">{w.materialName}</span>
                            <span className="font-mono font-bold">
                              {w.type === 'error' 
                                ? `Need ${w.required.toFixed(1)}, have ${w.available.toFixed(1)}` 
                                : `After: ${(w.available - w.required).toFixed(1)} (below threshold)`}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button 
                          type="button"
                          onClick={handleForceCreate}
                          disabled={materialWarnings.some(w => w.type === 'error')}
                          className="flex-1 py-2 bg-amber-500 text-amber-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Continue Anyway
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setShowMaterialWarnings(false); setMaterialWarnings([]) }}
                          className="flex-1 py-2 bg-muted text-muted-foreground font-bold rounded-xl text-xs hover:bg-muted/80 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={!newMoProductId || !newMoLineId || targetQtyInBatches <= 0}
                    className="w-full mt-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
                  >
                    <Play weight="fill" className="w-5 h-5" />
                    {t("dash_modal_submit")}
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
