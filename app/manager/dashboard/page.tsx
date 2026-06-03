"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { Play, Pause, CheckCircle, Clock, PresentationChart, CaretRight, Plus, X, Factory } from "@phosphor-icons/react"
import { ManufacturingOrderDrawer } from "@/components/manager/ManufacturingOrderDrawer"
import { ManufacturingOrder } from "@/lib/mock-db"

export default function ManagerDashboard() {
  const { activeMOs, products, lines, boms, materials, machines, addOrder, activeUnit, setActiveUnit } = useMockData()
  const [selectedMoId, setSelectedMoId] = useState<string | null>(null)
  
  const [showNewMoModal, setShowNewMoModal] = useState(false)
  const [newMoProductId, setNewMoProductId] = useState("")
  const [newMoLineId, setNewMoLineId] = useState("")
  const [newMoTargetQtyInput, setNewMoTargetQtyInput] = useState(10)
  const [newMoScheduledDate, setNewMoScheduledDate] = useState("")

  const selectedProduct = products.find(p => p.id === newMoProductId)
  const productWeight = selectedProduct?.finalMass || 1

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

  const convertQty = (qtyInUnits: number, productId: string, toUnit: "units" | "kg" | "tons"): number => {
    const mass = getProductMass(productId)
    if (toUnit === "units") return qtyInUnits
    if (toUnit === "kg") return qtyInUnits * mass
    if (toUnit === "tons") return (qtyInUnits * mass) / 1000
    return qtyInUnits
  }

  const getUnitMultiplier = (u: "units" | "tons" | "kg") => {
    if (u === "units") return 1;
    if (u === "kg") return 1 / productWeight;
    if (u === "tons") return 1000 / productWeight;
    return 1;
  }
  
  const unitFactor = getUnitMultiplier(activeUnit);
  const unitLabel = activeUnit === "units" ? "Units" : activeUnit === "tons" ? "Tons" : "kg";

  // Target Qty in standard units database unit
  const targetQtyInBatches = newMoTargetQtyInput * unitFactor;
  
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

    // Machine Cost
    const line = lines.find(l => l.id === newMoLineId)
    if (line) {
      for (const mId of line.machineIds) {
        const machine = machines.find(m => m.id === mId)
        if (machine && machine.operationRate > 0) {
          cost += (targetQtyInBatches / machine.operationRate) * machine.maintenanceCostPerHour
        }
      }
    }
    return cost
  }, [newMoProductId, newMoLineId, targetQtyInBatches, boms, materials, lines, machines])

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
    if (!newMoProductId || !newMoLineId || targetQtyInBatches <= 0) return

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
    setNewMoTargetQtyInput(activeUnit === "kg" ? 10 * productWeight : activeUnit === "tons" ? (10 * productWeight) / 1000 : 10)
    setNewMoScheduledDate("")
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
            <h1 className="text-4xl text-foreground font-display font-bold tracking-tight mb-2">Live Monitor</h1>
            <p className="text-muted-foreground text-lg">Real-time execution state of all active manufacturing orders(MOs) across the facility.</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setShowNewMoModal(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors w-max shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
            >
              <Plus weight="bold" className="w-4 h-4" />
              Launch Order
            </button>

            {/* Premium Unit Segmented Switcher */}
            <div className="flex bg-muted/40 p-1 rounded-xl border border-border/50 w-max">
              {(["units", "tons", "kg"] as const).map(unit => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => {
                    const oldFactor = getUnitMultiplier(activeUnit);
                    const newFactor = getUnitMultiplier(unit);
                    setActiveUnit(unit);
                    setNewMoTargetQtyInput(Number(((newMoTargetQtyInput * oldFactor) / newFactor).toFixed(2)));
                  }}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg transition-colors ${activeUnit === unit ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {unit}
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
            <span className="text-xs font-mono text-muted-foreground mb-1 tracking-wider">ACTIVE MOs</span>
            <span className="text-3xl font-display font-bold text-foreground">{activeMOs.filter(mo => mo.status !== "COMPLETED").length}</span>
          </div>
          <div className="flex flex-col border border-border bg-card p-4 rounded-xl min-w-[140px]">
            <span className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">{unitLabel}/Hr (Avg)</span>
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
          <div className="col-span-2">Order ID</div>
          <div className="col-span-4">Product Formulation</div>
          <div className="col-span-2">{unitLabel}</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
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
                <div><span className="font-mono">{convertQty(mo.targetQty, mo.productId, activeUnit).toFixed(activeUnit === 'units' ? 0 : 2)}</span> <span className="text-muted-foreground text-xs">{unitLabel}</span></div>
                {mo.programmedDate && <span className="text-xs text-amber-600 font-mono">Sch: {mo.programmedDate}</span>}
              </div>
              
              <div className="col-span-2 flex items-center gap-2">
                {mo.status === "PENDING" && (
                  <>
                    <Clock className="text-muted-foreground w-4 h-4" />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Pending</span>
                      {mo.programmedDate && (
                        <span className="text-[10px] text-amber-500 font-mono leading-none mt-0.5">
                          Waiting for {mo.programmedDate}
                        </span>
                      )}
                    </div>
                  </>
                )}
                {mo.status === "IN_PROGRESS" && <><Play className="text-amber-500 w-4 h-4" weight="fill" /><span className="text-sm text-amber-600 font-medium">In Progress</span></>}
                {mo.status === "COMPLETED" && (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="text-emerald-500 w-4 h-4" weight="fill" />
                      <span className="text-sm text-emerald-600 font-medium">Completed</span>
                    </div>
                    {mo.passedQCBatches !== undefined && (() => {
                      const product = products.find(p => p.id === mo.productId)
                      const hasQC = product?.qualityGates && product.qualityGates.length > 0
                      if (hasQC) {
                        return (
                          <span className="text-[10px] text-muted-foreground font-mono leading-none mt-0.5">
                            Passed: {mo.passedQCBatches} / {mo.targetQty} Units
                          </span>
                        )
                      }
                      return null
                    })()}
                  </div>
                )}
              </div>
              
              <div className="col-span-2 flex items-center justify-end gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <span className="text-sm font-medium">View Details</span>
                <CaretRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        ))}
        
        {activeMOs.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl">
            <PresentationChart className="w-8 h-8 text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">No active manufacturing orders found.</p>
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
                
                <h2 className="text-2xl font-display font-bold tracking-tight mb-2">Program Manufacturing Order</h2>
                <p className="text-muted-foreground text-sm mb-8">
                  Create a new manufacturing order and dispatch it to a production line.
                </p>

                <form onSubmit={handleCreateMo} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">Product Formulation</label>
                    <select 
                      value={newMoProductId}
                      onChange={(e) => setNewMoProductId(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none"
                      required
                    >
                      <option value="" disabled>-- Select a Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">Production Line</label>
                    <select 
                      value={newMoLineId}
                      onChange={(e) => setNewMoLineId(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none"
                      required
                    >
                      <option value="" disabled>-- Select a Line --</option>
                      {lines.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">Target Volume ({unitLabel})</label>
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
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">Scheduled Date (Optional)</label>
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
                        <span className="text-[10px] font-mono text-muted-foreground uppercase leading-none mb-1">Est. Cost (Incl. 5,000 launch fee)</span>
                        <span className="text-lg font-mono font-bold text-foreground">{Math.round(estCost).toLocaleString()} FCFA</span>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase leading-none mb-1">Est. Revenue</span>
                        <span className="text-lg font-mono font-bold text-emerald-500">{Math.round(estRevenue).toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  )}
 
                  <button 
                    type="submit"
                    disabled={!newMoProductId || !newMoLineId || targetQtyInBatches <= 0}
                    className="w-full mt-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
                  >
                    <Play weight="fill" className="w-5 h-5" />
                    Dispatch to Floor
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
