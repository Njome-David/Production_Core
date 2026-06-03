"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Factory, Cylinder, Engine, Package, GearSix, CheckSquareOffset } from "@phosphor-icons/react"
import { useMockData } from "@/providers/MockFeedProductionProvider"

export default function SelectStationPage() {
  const router = useRouter()
  const { setActiveSession, machines, qualityGates } = useMockData()

  const handleSelectStation = (stationId: string, stationType: "machine" | "gate") => {
    setActiveSession(prev => prev ? { ...prev, active_station: stationId, station_type: stationType } : null)
    router.push("/operator/tablet")
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
          <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Select Work Station</h1>
          <p className="text-muted-foreground">Select the physical spot you are currently operating.</p>
        </motion.div>

        {/* Production Machines */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Production Machines</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {machines.map((station) => (
              <motion.div variants={itemVariants} key={station.id}>
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
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{station.type || "General"}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quality Gates */}
        {qualityGates.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">Quality Gate Stations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {qualityGates.map((gate) => (
                <motion.div variants={itemVariants} key={gate.id}>
                  <button 
                    onClick={() => handleSelectStation(gate.id, "gate")}
                    className="w-full group flex flex-col items-center text-center bg-card border border-border rounded-xl p-8 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors duration-300">
                      <CheckSquareOffset weight="duotone" className="w-8 h-8 text-primary/60 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-lg font-display text-muted-foreground group-hover:text-foreground font-bold tracking-tight mb-1">{gate.name}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{gate.inspectionType}</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
