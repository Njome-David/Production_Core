"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Factory, Cylinder, Engine, Package, GearSix, CheckSquareOffset, WarningCircle } from "@phosphor-icons/react"
import { useAuth } from "@/providers/AuthProvider"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"

export default function SelectStationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { setActiveSession, machines, qualityGates, activeMOs, products, machineAssignments } = useMockData()

  // Filter machines by assignment
  const assignedMachineIds = useMemo(() => {
    if (!user) return new Set<string>()
    return new Set(
      machineAssignments
        .filter(a => a.operatorId === user.id)
        .map(a => a.machineId)
    )
  }, [machineAssignments, user])

  const assignedMachines = useMemo(() => {
    return machines.filter(m => assignedMachineIds.has(m.id))
  }, [machines, assignedMachineIds])

  const hasStations = assignedMachines.length > 0 || qualityGates.length > 0

  const [showFifoModal, setShowFifoModal] = useState(false)
  const [fifoStationId, setFifoStationId] = useState<string | null>(null)
  const [fifoStationType, setFifoStationType] = useState<"machine" | "gate" | null>(null)


  const handleSelectStation = (stationId: string, stationType: "machine" | "gate") => {
    setActiveSession(prev => prev ? { ...prev, active_station: stationId, station_type: stationType } : null)
    router.push("/operator/tablet")
  }

  const handlePendingClick = (e: React.MouseEvent, stationId: string, type: "machine" | "gate") => {
    e.stopPropagation()
    setFifoStationId(stationId)
    setFifoStationType(type)
    setShowFifoModal(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { ease: [0.32, 0.72, 0, 1] as const, duration: 0.5 } }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] w-full flex items-center justify-center p-6">
      <motion.div 
        className="w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 mb-6">
            <Factory weight="duotone" className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="text-3xl font-display text-foreground font-bold tracking-tight mb-2">{t("station_title")}</h1>
          <p className="text-muted-foreground">{t("station_desc")}</p>
        </motion.div>

        {!hasStations && (
          <motion.div variants={itemVariants} className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-6">
              <WarningCircle weight="duotone" className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">{t("station_none_title")}</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">{t("station_none_desc")}</p>
          </motion.div>
        )}

        {hasStations && (
          <>
        {assignedMachines.length > 0 && (
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">{t("station_section_machines")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {assignedMachines.map((station) => (
              <motion.div variants={itemVariants} key={station.id}>
                {(() => {
                  const stationMOs = activeMOs.filter(mo => mo.machineId === station.id && mo.status !== "COMPLETED" && mo.status !== "FINAL")
                  const pending = stationMOs.filter(mo => mo.status === "PENDING").length
                  const inProgress = stationMOs.filter(mo => mo.status === "IN_PROGRESS").length
                  const total = pending + inProgress
                  return (
                  <button 
                    onClick={() => handleSelectStation(station.id, "machine")}
                    className="w-full group flex flex-col items-center text-center bg-card border border-border rounded-xl p-8 hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 group-hover:bg-amber-500/10 transition-colors duration-300">
                      {station.type === "MIXER" ? (
                        <Cylinder weight="duotone" className="w-8 h-8 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                      ) : station.type === "PELLETIZER" ? (
                        <Engine weight="duotone" className="w-8 h-8 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                      ) : station.type === "PACKAGER" ? (
                        <Package weight="duotone" className="w-8 h-8 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                      ) : (
                        <GearSix weight="duotone" className="w-8 h-8 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                      )}
                    </div>
                    <h3 className="text-lg font-display text-muted-foreground group-hover:text-foreground font-bold tracking-tight mb-1">{station.name}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{station.type || t("station_type_general")}</span>
                    {total > 0 && (
                      <div className="flex items-center gap-2 mt-4">
                        {pending > 0 && (
                          <span 
                            onClick={(e) => handlePendingClick(e, station.id, "machine")}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 cursor-pointer hover:bg-blue-500/20"
                          >
                            {pending} {t("station_pending")}
                          </span>
                        )}
                        {inProgress > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            {inProgress} {t("station_in_progress")}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                  )
                })()}
              </motion.div>
            ))}
          </div>
        </motion.div>
        )}

        {/* Quality Gates */}
        {qualityGates.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">{t("station_section_gates")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {qualityGates.map((gate) => (
                <motion.div variants={itemVariants} key={gate.id}>
                  {(() => {
                    const gateMOs = activeMOs.filter(mo => mo.currentGateId === gate.id && mo.status !== "COMPLETED" && mo.status !== "FINAL")
                    const pending = gateMOs.filter(mo => mo.status === "PENDING").length
                    const inProgress = gateMOs.filter(mo => mo.status === "IN_PROGRESS").length
                    const total = pending + inProgress
                    return (
                    <button 
                      onClick={() => handleSelectStation(gate.id, "gate")}
                      className="w-full group flex flex-col items-center text-center bg-card border border-border rounded-xl p-8 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors duration-300">
                        <CheckSquareOffset weight="duotone" className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="text-lg font-display text-muted-foreground group-hover:text-foreground font-bold tracking-tight mb-1">{gate.name}</h3>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{gate.inspectionType}</span>
                      {total > 0 && (
                        <div className="flex items-center gap-2 mt-4">
                          {pending > 0 && (
                            <span 
                              onClick={(e) => handlePendingClick(e, gate.id, "gate")}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 cursor-pointer hover:bg-blue-500/20"
                            >
                              {pending} {t("station_pending")}
                            </span>
                          )}
                          {inProgress > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              {inProgress} {t("station_in_progress")}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                    )
                  })()}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
          </>
        )}
      </motion.div>

      {/* FIFO Modal */}
      {showFifoModal && fifoStationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowFifoModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-10"
          >
            <div className="p-6 border-b border-border/50">
              <h3 className="text-xl font-display font-bold text-foreground">File d&apos;attente (FIFO)</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("operator_select_station_pending_orders_for")} {fifoStationType === "machine" ? machines.find(m => m.id === fifoStationId)?.name : qualityGates.find(g => g.id === fifoStationId)?.name}
              </p>
            </div>
            <div className="p-0 overflow-y-auto max-h-[60vh]">
              {(() => {
                const pendingMOs = activeMOs
                  .filter(mo => (fifoStationType === "machine" ? mo.machineId === fifoStationId : mo.currentGateId === fifoStationId) && mo.status === "PENDING")
                  // Add sorting logic if there is a programmedDate or fallback to id
                  .sort((a, b) => {
                    if (a.programmedDate && b.programmedDate) return new Date(a.programmedDate).getTime() - new Date(b.programmedDate).getTime()
                    if (a.programmedDate) return -1
                    if (b.programmedDate) return 1
                    return a.id.localeCompare(b.id)
                  })

                if (pendingMOs.length === 0) {
                  return (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      {t("operator_select_station_no_pending_orders")}
                    </div>
                  )
                }

                return (
                  <div className="flex flex-col divide-y divide-border/50">
                    {pendingMOs.map((mo, idx) => {
                      const prod = products.find(p => p.id === mo.productId)
                      return (
                        <div key={mo.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-mono font-bold text-xs">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-medium text-foreground text-sm">{prod?.name || mo.productId}</div>
                              <div className="text-xs text-muted-foreground font-mono">#{mo.id} - {mo.targetQty} unités</div>
                            </div>
                          </div>
                          {mo.programmedDate && (
                            <div className="text-xs font-mono text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
                              {mo.programmedDate}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
            <div className="p-4 border-t border-border/50 flex justify-end">
              <button 
                onClick={() => setShowFifoModal(false)}
                className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
