"use client"

import React, { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/providers/AuthProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { Users, HardDrives, Plus, X, Check, UserSquare, CaretRight } from "@phosphor-icons/react"

export default function ManagerSubordinates() {
  const { t } = useLanguage()
  const { activeOrg } = useAuth()
  const {
    employees, machines, machineAssignments,
    assignMachineToOperator, removeMachineAssignment,
  } = useMockData()

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignOperatorId, setAssignOperatorId] = useState("")
  const [assignMachineIds, setAssignMachineIds] = useState<string[]>([])

  const operators = useMemo(() => {
    return employees.filter(e => e.role === "operator" && e.status === "active")
  }, [employees])

  const assignedOperatorIds = useMemo(() => {
    return new Set(machineAssignments.map(a => a.operatorId))
  }, [machineAssignments])

  const assignedMachineIds = useMemo(() => {
    return new Set(machineAssignments.map(a => a.machineId))
  }, [machineAssignments])

  const getOperatorMachines = (operatorId: string) => {
    return machineAssignments
      .filter(a => a.operatorId === operatorId)
      .map(a => machines.find(m => m.id === a.machineId))
      .filter(Boolean)
  }

  const getAssignedOperator = (machineId: string) => {
    const assignment = machineAssignments.find(a => a.machineId === machineId)
    if (!assignment) return null
    return employees.find(e => e.userId === assignment.operatorId)
  }

  const handleOpenAssign = () => {
    setAssignOperatorId("")
    setAssignMachineIds([])
    setShowAssignModal(true)
  }

  const handleMachineToggle = (machineId: string) => {
    setAssignMachineIds(prev =>
      prev.includes(machineId)
        ? prev.filter(id => id !== machineId)
        : [...prev, machineId]
    )
  }

  const handleRemoveAssignment = (machineId: string) => {
    removeMachineAssignment(machineId)
  }

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignOperatorId || assignMachineIds.length === 0) return

    // Find operator employee to get userId
    const op = employees.find(e => e.id === assignOperatorId)
    if (!op) return

    // Remove existing assignments for selected machines
    assignMachineIds.forEach(mid => {
      removeMachineAssignment(mid)
    })

    // Assign each machine to operator
    assignMachineIds.forEach(mid => {
      assignMachineToOperator(mid, op.userId, activeOrg?.org.id ?? "")
    })

    setShowAssignModal(false)
  }

  const availableMachines = machines.filter(m => !assignedMachineIds.has(m.id))

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6 }}
        >
          <h1 className="text-4xl font-display text-foreground font-bold tracking-tight mb-2">{t("manager_subordinates_title")}</h1>
          <p className="text-muted-foreground text-lg">
            {operators.length} {t("manager_subordinates_operator_label")}{operators.length > 1 ? "s" : ""} &middot; {machineAssignments.length} {t("manager_subordinates_assignment_label")}{machineAssignments.length > 1 ? "s" : ""}
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleOpenAssign}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:bg-primary/90 transition-colors"
        >
          <Plus weight="bold" className="w-5 h-5" />
          {t("manager_subordinates_assign_btn")}
        </motion.button>
      </div>

      {/* Operator cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {operators.map((op, idx) => {
          const opMachines = getOperatorMachines(op.userId)
          return (
            <motion.div
              key={op.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserSquare className="w-6 h-6 text-primary" weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground truncate">
                    {employees.find(e => e.userId === op.userId)?.jobTitle || t("manager_subordinates_operator_fallback")}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{op.id}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                  {t("manager_subordinates_assigned_machines")} ({opMachines.length})
                </span>
                {opMachines.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">{t("manager_subordinates_no_machines")}</p>
                ) : (
                  opMachines.map((mac: any) => (
                    <div key={mac.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <HardDrives className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">{mac.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAssignment(mac.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowAssignModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-lg max-h-screen overflow-y-auto pointer-events-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-display font-bold tracking-tight text-foreground">{t("manager_subordinates_modal_title")}</h2>
                  <button onClick={() => setShowAssignModal(false)} className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitAssignment} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("manager_subordinates_modal_label_operator")}</label>
                    <select value={assignOperatorId} onChange={e => setAssignOperatorId(e.target.value)} required
                      className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                      <option value="" disabled>{t("manager_subordinates_modal_placeholder_operator")}</option>
                      {operators.map(op => (
                        <option key={op.id} value={op.id}>{op.jobTitle || op.id}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("manager_subordinates_modal_label_machines")}</label>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                      {availableMachines.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic p-4 text-center">{t("manager_subordinates_modal_all_assigned")}</p>
                      ) : (
                        availableMachines.map(mac => (
                          <label key={mac.id} className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                            <input
                              type="checkbox"
                              checked={assignMachineIds.includes(mac.id)}
                              onChange={() => handleMachineToggle(mac.id)}
                              className="w-4 h-4 accent-primary"
                            />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <HardDrives className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="text-sm text-foreground truncate">{mac.name}</span>
                              <span className="text-[10px] font-mono text-muted-foreground uppercase">{mac.type}</span>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${mac.state === "RUNNING" ? "bg-emerald-500" : mac.state === "IDLE" ? "bg-muted" : "bg-amber-500"}`} />
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  {assignOperatorId && assignMachineIds.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-foreground">
                        {assignMachineIds.length} {t("manager_subordinates_machine_label")}{assignMachineIds.length > 1 ? "s" : ""} → {operators.find(op => op.id === assignOperatorId)?.jobTitle || assignOperatorId}
                      </span>
                    </div>
                  )}

                  <button type="submit" disabled={!assignOperatorId || assignMachineIds.length === 0}
                    className="w-full h-12 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> {t("manager_subordinates_modal_submit")}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unassigned machines */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="text-sm font-display font-bold text-foreground mb-4">{t("manager_subordinates_unassigned_title")}</h2>
        {availableMachines.filter(m => m.state !== "MAINTENANCE").length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{t("manager_subordinates_all_assigned")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {availableMachines.filter(m => m.state !== "MAINTENANCE").map(mac => (
              <div key={mac.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <HardDrives className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{mac.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{mac.type}</span>
                </div>
                <button onClick={() => { handleOpenAssign(); setAssignMachineIds([mac.id]) }}
                  className="text-xs text-primary font-bold hover:text-primary/80 transition-colors flex items-center gap-1">
                  {t("manager_subordinates_assign_action")} <CaretRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
