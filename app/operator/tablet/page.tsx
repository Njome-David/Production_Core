"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useResilientChronometer } from "@/hooks/useResilientChronometer"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { Play, Pause, Stop, Warning, Drop, CheckCircle, PresentationChart, Trash, CaretLeft, CheckSquareOffset } from "@phosphor-icons/react"
import Link from "next/link"

export default function OperatorTabletPage() {
  const { activeSession, activeMOs, setMOStatus, materials, updateMO, machines, products, qualityGates } = useMockData()
  
  // QC gate state
  const [showQcModal, setShowQcModal] = useState(false)
  const [qcPassedCount, setQcPassedCount] = useState<number>(0)
  const isGateStation = activeSession?.station_type === "gate"
  const activeMachine = isGateStation ? null : machines.find(m => m.id === activeSession?.active_station)
  const activeGate = isGateStation ? qualityGates.find(g => g.id === activeSession?.active_station) : null

  // Operator Logs State
  const [operatorLogs, setOperatorLogs] = useState<{timestamp: string, text: string}[]>([
    { timestamp: "08:14:22", text: "Moisture levels calibrated and approved." },
    { timestamp: "08:30:45", text: "Bulk solid silo pre-feed flow rate stable at 240kg/min." }
  ])
  const [newLogText, setNewLogText] = useState("")

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLogText.trim()) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setOperatorLogs(prev => [...prev, { timestamp: now, text: newLogText.trim() }])
    setNewLogText("")
  }
  
  const stationMOs = isGateStation
    ? activeMOs.filter(mo => mo.currentGateId === activeSession?.active_station)
    : activeMOs.filter(mo => mo.machineId === activeSession?.active_station)
  const currentMO = stationMOs.find(mo => mo.status === "IN_PROGRESS") || stationMOs.find(mo => mo.status === "PENDING")

  const {
    isRunning,
    formattedTime,
    startTimer,
    pauseTimer,
    stopTimer,
    elapsedSeconds
  } = useResilientChronometer(currentMO?.id || null)

  const [showRefillModal, setShowRefillModal] = useState(false)
  const [showScrapModal, setShowScrapModal] = useState(false)
  const [scrapQty, setScrapQty] = useState<number>(0)
  const [selectedScrapMaterial, setSelectedScrapMaterial] = useState<string>("")

  const completeOrderSequence = (passedQC?: number) => {
    if (!currentMO) return
    stopTimer()
    const product = products.find(p => p.id === currentMO.productId)
    const routing = product?.routing || []
    const gates = product?.qualityGates || []
    const currentSequence = currentMO.currentSequence || 1
    
    const baseUpdates: any = {}
    if (passedQC !== undefined) {
      baseUpdates.qcStatus = "DONE"
      baseUpdates.passedQCBatches = passedQC
    }

    // If we are at a gate station, completing means resuming to next machine
    if (isGateStation) {
      const currentIndex = routing.findIndex(r => r.sequence === currentSequence)
      if (currentIndex !== -1 && currentIndex < routing.length - 1) {
        const nextStep = routing[currentIndex + 1]
        updateMO(currentMO.id, { ...baseUpdates, currentGateId: undefined, machineId: nextStep.machineId, currentSequence: nextStep.sequence, status: "PENDING" })
      } else {
        updateMO(currentMO.id, { ...baseUpdates, currentGateId: undefined })
        setMOStatus(currentMO.id, "COMPLETED")
      }
      return
    }

    // Machine station: check if a gate is attached after this sequence
    const currentIndex = routing.findIndex(r => r.sequence === currentSequence)
    const attachedGate = gates.find(g => g.sequenceAfter === currentSequence)

    if (attachedGate) {
      // Route to quality gate
      updateMO(currentMO.id, { ...baseUpdates, machineId: undefined, currentGateId: attachedGate.gateId, status: "PENDING" })
    } else if (currentIndex !== -1 && currentIndex < routing.length - 1) {
      const nextStep = routing[currentIndex + 1]
      updateMO(currentMO.id, { ...baseUpdates, currentSequence: nextStep.sequence, machineId: nextStep.machineId, status: "PENDING" })
    } else {
      updateMO(currentMO.id, { ...baseUpdates })
      setMOStatus(currentMO.id, "COMPLETED")
    }
  }

  const handleAction = (action: "start" | "pause" | "complete") => {
    if (!currentMO) return

    if (action === "start") {
      setMOStatus(currentMO.id, "IN_PROGRESS")
      startTimer()
    } else if (action === "pause") {
      pauseTimer()
    } else if (action === "complete") {
      if (isGateStation) {
        setQcPassedCount(currentMO.targetQty)
        setShowQcModal(true)
      } else {
        completeOrderSequence()
      }
    }
  }

  const handleLogScrap = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedScrapMaterial || scrapQty <= 0) return
    
    // In a real app, this would deduct from line-side inventory and log to a scrap table.
    // We'll just close the modal for the mock.
    console.log(`Logged ${scrapQty} of ${selectedScrapMaterial} as scrap.`)
    setShowScrapModal(false)
    setScrapQty(0)
    setSelectedScrapMaterial("")
  }

  if (!currentMO) {
    return (
      <div className="min-h-[calc(100dvh-64px)] w-full flex items-center justify-center p-6">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
            <PresentationChart className="w-10 h-10 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">No Active Orders</h2>
          <p className="text-muted-foreground">There are currently no manufacturing orders assigned to this station. Await dispatch from the production manager.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] w-full flex flex-col p-6">
      <div className="max-w-[1600px] mx-auto w-full mb-6">
        <Link 
          href="/operator/select-station" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors font-medium text-sm"
        >
          <CaretLeft className="w-4 h-4" />
          Back to Select Station
        </Link>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Active Run Context */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card border border-border p-8 rounded-2xl shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-muted text-muted-foreground uppercase tracking-widest">{currentMO.id}</span>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-md uppercase tracking-widest font-bold ${currentMO.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                  {currentMO.status}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground">{currentMO.productName}</h1>
            </div>

            <div className="mt-6 md:mt-0 flex flex-col items-end">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Elapsed Run Time</span>
              <div className="font-mono text-2xl md:text-4xl tracking-tighter font-bold text-foreground bg-clip-text">
                {formattedTime}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* Target Spec & Operator Logs Container */}
            <div className="flex flex-col gap-6">
              {/* Target Spec Card */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[80px] pointer-events-none"></div>
                <div>
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Production Target</span>
                  <div className="mt-2 font-display text-2xl text-foreground font-bold">
                    {currentMO.targetQty} <span className="text-lg text-muted-foreground font-normal">Units</span>
                  </div>
                </div>
                
                {/* 1s per unit computation progress bar */}
                {(() => {
                  const totalSeconds = Math.max(1, currentMO.targetQty * 1);
                  const progressPercentage = Math.min(100, Math.floor((elapsedSeconds / totalSeconds) * 100));
                  return (
                    <div className="mt-6 flex flex-col gap-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Progress (1s per unit)</span>
                        <span className="font-mono text-foreground font-bold">{progressPercentage}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isRunning ? 'bg-amber-500' : 'bg-muted-foreground'}`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Real-time Operator Logs panel (directly under target card) */}
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col flex-1 gap-4 overflow-hidden">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Operator Notes</span>
                
                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto max-h-[140px] flex flex-col gap-2 pr-1">
                  {operatorLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 text-xs items-start bg-muted/30 p-2.5 rounded-xl border border-border/30">
                      <span className="font-mono font-bold text-amber-500 shrink-0">{log.timestamp}</span>
                      <span className="text-foreground">{log.text}</span>
                    </div>
                  ))}
                </div>

                {/* Add new log */}
                <form onSubmit={handleAddLog} className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Enter timestamped log..."
                    value={newLogText}
                    onChange={(e) => setNewLogText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-foreground"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90 transition-colors"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>

            {/* Run Actions */}
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col gap-4 justify-center">
              {currentMO.status !== "IN_PROGRESS" && !isRunning ? (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleAction("start")}
                  className="h-20 w-full bg-amber-500 text-amber-950 font-display font-bold text-xl rounded-xl flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:bg-amber-400 transition-colors"
                >
                  <Play weight="fill" className="w-8 h-8" />
                  INITIATE RUN
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleAction("pause")}
                  className="h-20 w-full bg-muted text-foreground font-display font-bold text-xl rounded-xl flex items-center justify-center gap-3 hover:bg-neutral-200 transition-colors"
                >
                  <Pause weight="fill" className="w-8 h-8" />
                  PAUSE LINE
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAction("complete")}
                disabled={currentMO.status === "PENDING"}
                className={`h-20 w-full font-display font-bold text-xl rounded-xl flex items-center justify-center gap-3 transition-colors ${currentMO.status === "PENDING" ? 'bg-background border border-border text-muted-foreground opacity-50 cursor-not-allowed' : 'bg-emerald-500 text-emerald-950 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400'}`}
              >
                <CheckCircle weight="bold" className="w-8 h-8" />
                COMPLETE ORDER
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column: BOM & Context */}
        <div className="col-span-1 lg:col-span-4 bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-muted/20">
            <h3 className="font-display text-foreground font-bold text-xl">Active Feedstock (BOM)</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {currentMO.bom?.lines.map((item, idx) => {
              const mat = materials.find(m => m.id === item.materialId)
              return (
              <div key={idx} className="p-4 border-b border-border/30 last:border-0 flex flex-col gap-2 hover:bg-muted/10 transition-colors rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{mat?.name || item.materialId}</span>
                  </div>
                  <span className="font-mono text-foreground text-sm font-bold">{(item.quantityPerUnit * currentMO.targetQty).toFixed(2)} Kg</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setSelectedScrapMaterial(item.materialId)
                        setShowScrapModal(true)
                      }}
                      className="px-3 py-1.5 text-xs text-red-500 font-medium border border-red-500/20 rounded bg-red-500/5 hover:bg-red-500/10 transition-colors"
                    >
                      Log Scrap
                    </button>
                    <button 
                      onClick={() => setShowRefillModal(true)}
                      className="px-3 py-1.5 text-xs text-muted-foreground font-medium border border-border rounded bg-background hover:bg-muted transition-colors"
                    >
                      Manual Refill
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
          
          {/* QC and Logs Area */}
          {isGateStation && (
            <div className="p-4 bg-card border-t border-border/50 flex flex-col gap-3">
              <div className="flex items-center gap-2 px-2 mb-1">
                <CheckSquareOffset weight="duotone" className="w-5 h-5 text-primary" />
                <span className="text-sm font-display font-bold text-foreground">{activeGate?.name}</span>
              </div>
              <button 
                onClick={() => {
                  setQcPassedCount(currentMO.targetQty)
                  setShowQcModal(true)
                }}
                disabled={currentMO.qcStatus === "DONE"}
                className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle weight="bold" className="w-5 h-5" />
                {currentMO.qcStatus === "DONE" ? "Quality Check Passed" : "Perform Quality Check"}
              </button>
              <div className="flex justify-between items-center text-xs text-muted-foreground px-2">
                <span>Status: {currentMO.qcStatus === "DONE" ? "QC DONE" : "QC PENDING"}</span>
                <span className="font-mono text-amber-500">Target: {currentMO.targetQty} Units</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Manual Refill Modal overlay - Liquid Glass concept implementation */}
      <AnimatePresence>
        {showRefillModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowRefillModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-md pointer-events-auto"
            >
              {/* Liquid Glass implementation */}
              <div className="rounded-3xl bg-card/60 backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.2)] p-8 overflow-hidden">
                {/* Noise filter overlay for premium feel */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                
                <div className="relative z-10 flex flex-col gap-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Drop className="w-8 h-8 text-amber-500" weight="duotone" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-display font-bold tracking-tight mb-2">Manual Material Override</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      You are about to manually inject material into the active line. This bypasses automated batch constraints.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 mt-4">
                    <motion.button 
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowRefillModal(false)}
                      className="w-full py-3 bg-amber-500 text-amber-950 font-bold rounded-xl shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:bg-amber-400 transition-colors"
                    >
                      Acknowledge & Refill
                    </motion.button>
                    <button 
                      onClick={() => setShowRefillModal(false)}
                      className="w-full py-3 text-muted-foreground font-medium hover:text-foreground rounded-xl hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scrap Logging Modal */}
      <AnimatePresence>
        {showScrapModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowScrapModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-md pointer-events-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-8 overflow-hidden">
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                    <Trash className="w-8 h-8 text-red-500" weight="duotone" />
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-2xl font-display font-bold tracking-tight mb-2">Record Material Scrap</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Log wasted or contaminated {materials.find(m => m.id === selectedScrapMaterial)?.name || selectedScrapMaterial}. This will deduct from line-side inventory without adding to completed yield.
                    </p>
                  </div>

                  <form onSubmit={handleLogScrap} className="flex flex-col gap-5 mt-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">Scrap Quantity (Kg)</label>
                      <input 
                        type="number" 
                        min="0.1" 
                        step="0.1"
                        value={scrapQty || ""}
                        onChange={(e) => setScrapQty(parseFloat(e.target.value))}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-foreground font-mono"
                        autoFocus
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                      <motion.button 
                        whileTap={{ scale: 0.96 }}
                        type="submit"
                        disabled={scrapQty <= 0}
                        className="w-full py-3 bg-red-500 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        Log Scrap
                      </motion.button>
                      <button 
                        type="button"
                        onClick={() => setShowScrapModal(false)}
                        className="w-full py-3 text-muted-foreground font-medium hover:text-foreground rounded-xl hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quality Check Verification Gate Modal */}
      <AnimatePresence>
        {showQcModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowQcModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-xl pointer-events-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-8 overflow-hidden">
                <h2 className="text-2xl font-display font-bold tracking-tight mb-2 flex items-center gap-2">
                  <CheckCircle weight="fill" className="text-emerald-500 w-7 h-7" />
                  Quality Gate: Batch Release Check
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Please verify that all manufactured units have successfully completed visual assessment and weight-tolerance compliance tests.
                </p>

                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">Number of Good Units</label>
                  <input 
                    type="number" 
                    min="0" 
                    max={currentMO.targetQty}
                    value={qcPassedCount}
                    onChange={(e) => setQcPassedCount(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-mono"
                    autoFocus
                    required
                  />
                  <span className="text-[10px] text-muted-foreground">Out of {currentMO.targetQty} total produced units</span>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      completeOrderSequence(qcPassedCount)
                      setShowQcModal(false)
                    }}
                    className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
                  >
                    Submit QC Check & Proceed
                  </button>
                  <button 
                    onClick={() => setShowQcModal(false)}
                    className="w-full py-3 text-muted-foreground font-medium hover:text-foreground rounded-xl hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
