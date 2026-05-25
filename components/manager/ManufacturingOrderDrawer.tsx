"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { X, Play, Clock, CheckCircle, Cube, Drop, Hash, ArrowsLeftRight } from "@phosphor-icons/react"
import { useMockData } from "@/providers/MockFeedProductionProvider"

interface DrawerProps {
  moId: string
  onClose: () => void
}

export function ManufacturingOrderDrawer({ moId, onClose }: DrawerProps) {
  const { activeMOs, setMOStatus, materials, activeUnit, products, machines, lines, boms } = useMockData()
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

  // Financial calculations
  const product = products.find(p => p.id === mo.productId)
  const targetPrice = product?.price || 12000 // default selling price: 12000 FCFA per batch
  const estimatedRevenue = mo.targetQty * targetPrice

  // Materials cost
  const bom = boms.find(b => b.productId === mo.productId)
  const materialsCost = bom?.lines.reduce((acc, line) => {
    const mat = materials.find(m => m.id === line.materialId)
    const cost = line.quantityPerUnit * mo.targetQty * (mat?.costAvg || 250) // default cost 250 FCFA/unit
    return acc + cost
  }, 0) || 0

  // Machine maintenance cost
  const productionLine = lines.find(l => l.id === mo.lineId)
  const machineMaintenanceCost = productionLine?.machineIds.reduce((acc, machineId) => {
    const machine = machines.find(m => m.id === machineId)
    if (!machine) return acc
    // batches / operationRate = hours. Then hours * maintenanceCostPerHour
    const hours = mo.targetQty / (machine.operationRate || 10)
    const cost = hours * (machine.maintenanceCostPerHour || 1500)
    return acc + cost
  }, 0) || 0

  const fixedLaunchCost = 5000 // 5000 FCFA
  const estimatedCost = fixedLaunchCost + materialsCost + machineMaintenanceCost
  const grossMargin = estimatedRevenue - estimatedCost
  const marginPercentage = estimatedRevenue > 0 ? (grossMargin / estimatedRevenue) * 100 : 0

  const handleRelease = () => {
    // Optimistically update status to 'In Progress' for mock purposes
    setMOStatus(mo.id, "IN_PROGRESS")
  }

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
                {mo.status === "PENDING" && <><Clock className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-muted-foreground">Pending</span></>}
                {mo.status === "IN_PROGRESS" && <><Play className="w-3.5 h-3.5 text-amber-500" weight="fill" /><span className="text-amber-600">In Progress</span></>}
                {mo.status === "COMPLETED" && <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" weight="fill" /><span className="text-emerald-600">Completed</span></>}
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
          {/* Production Specs */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Production Specs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Target Volume</span>
                <span className="text-xl text-foreground font-display font-bold">
                  {Math.round(mo.targetQty * (activeUnit === "batches" ? 1 : activeUnit === "tons" ? 1.5 : 1500)).toLocaleString()}{" "}
                  <span className="text-base text-muted-foreground font-normal">
                    {activeUnit === "batches" ? "Batches" : activeUnit === "tons" ? "Tons" : "kg"}
                  </span>
                </span>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Routing Line</span>
                <span className="text-xl font-display text-foreground font-bold">{mo.routing}</span>
              </div>
              
              {mo.status === "COMPLETED" && (
                <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1 col-span-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-semibold">
                    <CheckCircle className="text-emerald-500 w-4 h-4" weight="fill" />
                    Quality Check Verification
                  </span>
                  <span className="text-xl text-foreground font-display font-bold">
                    {mo.passedQCBatches !== undefined ? mo.passedQCBatches : mo.targetQty}{" "}
                    <span className="text-base text-muted-foreground font-normal">
                      out of {mo.targetQty} Batches successfully passed validation
                    </span>
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Estimated Financials */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Estimated Financials</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-semibold">Est. Cost</span>
                <span className="text-lg text-red-500 font-display font-bold">
                  {Math.round(estimatedCost).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">FCFA</span>
                </span>
                <span className="text-[9px] text-muted-foreground leading-tight">Fixed + BOM + Maintenance</span>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-semibold">Est. Revenue</span>
                <span className="text-lg text-emerald-500 font-display font-bold">
                  {Math.round(estimatedRevenue).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">FCFA</span>
                </span>
                <span className="text-[9px] text-muted-foreground leading-tight">Price per batch</span>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-semibold">Gross Margin</span>
                <span className={`text-lg font-display font-bold ${grossMargin >= 0 ? "text-primary" : "text-rose-500"}`}>
                  {Math.round(grossMargin).toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">FCFA</span>
                </span>
                <span className="text-[9px] text-muted-foreground font-mono leading-tight">({marginPercentage.toFixed(1)}% yield)</span>
              </div>
            </div>
          </section>

          {/* Bill of Materials */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Bill of Materials (BOM)</span>
              <span className="text-foreground">{mo.bom?.lines.length ?? 0} items</span>
            </h3>
            
            <div className="flex flex-col border border-border/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-6">Material</div>
                <div className="col-span-3 text-right">Required (Kg)</div>
                <div className="col-span-3 text-right">Inventory</div>
              </div>
              
              <div className="flex flex-col divide-y divide-border/50">
                {mo.bom?.lines.map((item, idx) => {
                  const mat = materials.find(m => m.id === item.materialId)
                  return (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-3 text-sm items-center bg-card hover:bg-muted/20 transition-colors">
                    <div className="col-span-6 flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                      <Cube className="w-4 h-4 text-muted-foreground animate-pulse" />
                      {mat?.name || item.materialId}
                    </div>
                    <div className="col-span-3 text-right font-mono text-muted-foreground">
                      {(item.quantityPerUnit * mo.targetQty).toFixed(2)}
                    </div>
                    <div className="col-span-3 text-right text-muted-foreground flex items-center justify-end gap-1 font-mono">
                      {/* For mockup: show a generic stock level, or green check if sufficient */}
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></div>
                      Available
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border/50 bg-background/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors border border-transparent"
          >
            Cancel
          </button>
          
          {mo.status === "PENDING" && (
            <button 
              disabled
              className="px-6 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-md cursor-not-allowed flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Awaiting Operator Action
            </button>
          )}

          {mo.status === "IN_PROGRESS" && (
            <button 
              disabled
              className="px-6 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-md cursor-not-allowed flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Execution in Progress
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
