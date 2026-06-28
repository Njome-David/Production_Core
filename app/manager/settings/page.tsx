"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { Gear, Plus, Package, Factory, HardDrives, CaretRight, X, FloppyDisk, Drop, Cube, Trash, CaretUp, CaretDown, CheckSquareOffset } from "@phosphor-icons/react"
import { QCParameter, RoutingStep, QualityGate } from "@/lib/mock-db"

type ConfigTab = "products" | "machines" | "quality_gates" | "lines"
type ProductTab = "profile" | "routing" | "notice"

export default function SettingsPage() {
  const { 
    products, 
    machines, 
    boms, 
    materials,
    updateProduct,
    addProduct,
    updateBOM,
    addBOM,
    updateMachine,
    addMachine,
    lines,
    qualityGates,
    addQualityGate,
    updateQualityGate
  } = useMockData()
  const { t } = useLanguage()
  
  const [activeTab, setActiveTab] = useState<ConfigTab>("products")
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  const [productActiveTab, setProductActiveTab] = useState<ProductTab>("profile")

  // Local form states
  const [productForm, setProductForm] = useState<any>(null)
  const [bomRows, setBomRows] = useState<Array<{ materialId: string, quantityPerUnit: number }>>([])
  const [bomUnit, setBomUnit] = useState<'kg' | 'pct'>('kg')
  const [routingRows, setRoutingRows] = useState<RoutingStep[]>([])
  const [qcRows, setQcRows] = useState<QCParameter[]>([])
  const [productQualityGateRows, setProductQualityGateRows] = useState<{ sequenceAfter: number, gateId: string, timeInHours?: number }[]>([])
  
  const [machineForm, setMachineForm] = useState<any>(null)
  const [qualityGateForm, setQualityGateForm] = useState<any>(null)

  // Sub-modal states
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false)
  const [newMaterialId, setNewMaterialId] = useState("")
  const [newMaterialQty, setNewMaterialQty] = useState(1.5)

  const [showAssignMachineModal, setShowAssignMachineModal] = useState(false)
  const [assignGateSequence, setAssignGateSequence] = useState<number | null>(null)
  const [newRoutingMachineId, setNewRoutingMachineId] = useState("")
  const [newRoutingUsage, setNewRoutingUsage] = useState(100)
  const [newRoutingTime, setNewRoutingTime] = useState(1)

  // Synchronize state when selection changes
  React.useEffect(() => {
    if (!selectedEntityId) return

    if (activeTab === "products") {
      const isNew = selectedEntityId === "new"
      const prod = isNew 
        ? { id: `prod_${Date.now()}`, sku: "SKU-NEW", name: "", targetMargin: 30, finalMass: 100, assignedLineIds: [], qcParameters: [], routing: [], qualityGates: [] }
        : products.find(p => p.id === selectedEntityId)
      
      setProductForm(prod ? { ...prod } : null)
      setRoutingRows(prod?.routing ? [...prod.routing] : [])
      setQcRows(prod?.qcParameters ? [...prod.qcParameters] : [])
      setProductQualityGateRows(prod?.qualityGates ? [...prod.qualityGates] : [])
      
      const bom = isNew ? null : boms.find(b => b.productId === selectedEntityId)
      setBomUnit(bom?.unit || 'kg')
      setBomRows(bom ? [...bom.lines] : [])
      setProductActiveTab("profile")
    } else if (activeTab === "machines") {
      const isNew = selectedEntityId === "new"
      const mac = isNew
        ? { id: `mac_${Date.now()}`, name: "", type: "MIXER", state: "IDLE", maintenanceCostPerHour: 1500, opCostPerHour: 50, operationRate: 20, isQualityCheckService: false, powerRating: 10, technicalSpecs: "" }
        : machines.find(m => m.id === selectedEntityId)
      
      setMachineForm(mac ? { ...mac } : null)
    } else if (activeTab === "quality_gates") {
      const isNew = selectedEntityId === "new"
      const gate = isNew
        ? { id: `gate_${Date.now()}`, name: "", description: "", type: "VISUAL", inspectionType: "", serviceProvider: "", opCostPerHour: 0, operationRate: 0 }
        : qualityGates.find(g => g.id === selectedEntityId)
      
      setQualityGateForm(gate ? { ...gate } : null)
    }
  }, [selectedEntityId, activeTab, products, boms, machines])

  // Handlers
  const handleEntitySelect = (id: string) => {
    setSelectedEntityId(id)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedEntityId(null)
  }

  const handleCreateNew = () => {
    setSelectedEntityId("new")
    setIsDrawerOpen(true)
  }

  // BOM Material Row Handlers
  const handleRemoveMaterialRow = (idx: number) => {
    setBomRows(prev => prev.filter((_, i) => i !== idx))
  }

  const handleUpdateMaterialRowQty = (idx: number, qty: number) => {
    setBomRows(prev => prev.map((row, i) => i === idx ? { ...row, quantityPerUnit: qty } : row))
  }
  const handleAddMaterialRow = () => {
    if (!newMaterialId) return
    setBomRows(prev => {
      return [...prev, { materialId: newMaterialId, quantityPerUnit: newMaterialQty }]
    })
    setShowAddMaterialModal(false)
    setNewMaterialId("")
    setNewMaterialQty(1.5)
  }

  // Routing Handlers
  const handleAddRouting = () => {
    if (!newRoutingMachineId) return
    setRoutingRows(prev => {
      const nextSeq = prev.length > 0 ? Math.max(...prev.map(r => r.sequence)) + 1 : 1
      return [...prev, { machineId: newRoutingMachineId, sequence: nextSeq, usagePercentage: newRoutingUsage, timeInHours: newRoutingTime }]
    })
    setShowAssignMachineModal(false)
    setNewRoutingMachineId("")
    setNewRoutingUsage(100)
    setNewRoutingTime(1)
  }

  const handleRemoveRouting = (idx: number) => {
    const seqToRemove = routingRows[idx].sequence
    const newRows = routingRows.filter((_, i) => i !== idx)
    setRoutingRows(newRows)
    setProductQualityGateRows(prev => prev.filter(g => g.sequenceAfter !== seqToRemove))
  }

  const handleRemoveQualityGateFromRouting = (seq: number) => {
    setProductQualityGateRows(prev => prev.filter(g => g.sequenceAfter !== seq))
  }
  
  const handleMoveRouting = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx > 0) {
      setRoutingRows(prev => {
        const newArr = [...prev]
        const temp = newArr[idx]
        newArr[idx] = newArr[idx - 1]
        newArr[idx - 1] = temp
        // update seq
        newArr[idx].sequence = idx + 1
        newArr[idx - 1].sequence = idx
        return newArr
      })
    } else if (direction === 'down' && idx < routingRows.length - 1) {
      setRoutingRows(prev => {
        const newArr = [...prev]
        const temp = newArr[idx]
        newArr[idx] = newArr[idx + 1]
        newArr[idx + 1] = temp
        newArr[idx].sequence = idx + 1
        newArr[idx + 1].sequence = idx + 2
        return newArr
      })
    }
  }

  const handleUpdateRoutingUsage = (idx: number, usage: number) => {
    setRoutingRows(prev => prev.map((row, i) => i === idx ? { ...row, usagePercentage: usage } : row))
  }

  const handleUpdateRoutingTime = (idx: number, time: number) => {
    setRoutingRows(prev => prev.map((row, i) => i === idx ? { ...row, timeInHours: time } : row))
  }

  // QC Handlers
  const handleAddQC = () => {
    setQcRows(prev => [
      ...prev, 
      { id: `qc_${Date.now()}`, name: "New Parameter", minValue: 0, maxValue: 10, unit: "units", tolerance: 1 }
    ])
  }
  
  const handleRemoveQC = (idx: number) => {
    setQcRows(prev => prev.filter((_, i) => i !== idx))
  }
  
  const handleUpdateQC = (idx: number, field: keyof QCParameter, value: any) => {
    setQcRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row))
  }

  // Submit/Save Handlers
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productForm) return

    // Recalculate cost & price before saving
    let totalMaterialsCost = 0
    bomRows.forEach(row => {
      const mat = materials.find(m => m.id === row.materialId)
      if (mat) {
        const qty = bomUnit === 'pct' ? (row.quantityPerUnit / 100) * (productForm.finalMass || 100) : row.quantityPerUnit
        totalMaterialsCost += qty * mat.costAvg
      }
    })
    
    if (bomUnit === 'pct') {
      const sum = bomRows.reduce((acc, row) => acc + row.quantityPerUnit, 0)
      if (Math.abs(sum - 100) > 0.01) {
        alert("Percentages must sum to exactly 100%.")
        return
      }
    }
    
    let totalOpCost = 0
    routingRows.forEach(row => {
      const mac = machines.find(m => m.id === row.machineId)
      const macOpCost = mac?.opCostPerHour || 0
      totalOpCost += (row.usagePercentage / 100) * macOpCost * (row.timeInHours || 1)
      
      const gateEntry = productQualityGateRows.find(g => g.sequenceAfter === row.sequence)
      if (gateEntry) {
        const gate = qualityGates.find(q => q.id === gateEntry.gateId)
        const gateHours = gateEntry.timeInHours || 0.25
        totalOpCost += (gate?.opCostPerHour || 0) * gateHours
      }
    })
    
    const costPrice = totalMaterialsCost + totalOpCost
    const margin = productForm.targetMargin || 30
    const suggestedPrice = costPrice * (100 + margin) / 100

    const updatedProduct = {
      ...productForm,
      price: suggestedPrice,
      qcParameters: qcRows,
      routing: routingRows,
      qualityGates: productQualityGateRows
    }

    const isNew = selectedEntityId === "new"
    if (isNew) {
      addProduct(updatedProduct)
      addBOM({
        id: `bom_${Date.now()}`,
        productId: productForm.id,
        unit: bomUnit,
        lines: bomRows
      })
    } else {
      updateProduct(productForm.id, updatedProduct)
      const existingBom = boms.find(b => b.productId === productForm.id)
      if (existingBom) {
        updateBOM(existingBom.id, { unit: bomUnit, lines: bomRows })
      } else {
        addBOM({
          id: `bom_${Date.now()}`,
          productId: productForm.id,
          unit: bomUnit,
          lines: bomRows
        })
      }
    }
    closeDrawer()
  }

  const handleSaveMachine = (e: React.FormEvent) => {
    e.preventDefault()
    if (!machineForm) return

    const isNew = selectedEntityId === "new"
    if (isNew) {
      addMachine(machineForm)
    } else {
      updateMachine(machineForm.id, machineForm)
    }
    closeDrawer()
  }

  const handleSaveQualityGate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!qualityGateForm) return

    const isNew = selectedEntityId === "new"
    if (isNew) {
      addQualityGate(qualityGateForm)
    } else {
      updateQualityGate(qualityGateForm.id, qualityGateForm)
    }
    closeDrawer()
  }

  // Calculations for display
  const bomSumKg = bomRows.reduce((acc, row) => acc + row.quantityPerUnit, 0)
  const computedFinalMass = bomUnit === 'kg' ? bomSumKg : (productForm?.finalMass || 100)
  const finalMass = computedFinalMass
  let totalMaterialsCost = 0
  bomRows.forEach(row => {
    const mat = materials.find(m => m.id === row.materialId)
    if (mat) {
      const qty = bomUnit === 'pct' ? (row.quantityPerUnit / 100) * finalMass : row.quantityPerUnit
      totalMaterialsCost += qty * mat.costAvg
    }
  })
  let totalOpCost = 0
  routingRows.forEach(row => {
    const mac = machines.find(m => m.id === row.machineId)
    const macOpCost = mac?.opCostPerHour || 0
    totalOpCost += (row.usagePercentage / 100) * macOpCost * (row.timeInHours || 1)
    
    const gateEntry = productQualityGateRows.find(g => g.sequenceAfter === row.sequence)
    if (gateEntry) {
      const gate = qualityGates.find(q => q.id === gateEntry.gateId)
      const gateHours = gateEntry.timeInHours || 0.25
      totalOpCost += (gate?.opCostPerHour || 0) * gateHours
    }
  })
  const currentCostPrice = totalMaterialsCost + totalOpCost
  const currentMargin = productForm?.targetMargin || 0
  const currentSuggestedPrice = currentCostPrice * (100 + currentMargin) / 100


  // Render Left Column Content
  const renderList = () => {
    if (activeTab === "products") {
      return (
        <div className="flex flex-col gap-2">
          {products.map(prod => (
            <button
              key={prod.id}
              onClick={() => handleEntitySelect(prod.id)}
              className="flex items-center justify-between p-4 bg-card border border-border/50 hover:border-primary/30 hover:bg-muted/30 rounded-xl transition-all group text-left"
            >
              <div>
                <span className="text-xs font-mono text-muted-foreground uppercase">{prod.sku}</span>
                <p className="font-display font-bold text-foreground mt-1">{prod.name}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{prod.routing?.length || 0} {t("settings_badge_routing")}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{prod.qcParameters?.length || 0} {t("settings_badge_qc")}</span>
                </div>
              </div>
              <CaretRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      )
    }

    if (activeTab === "machines") {
      return (
        <div className="flex flex-col gap-2">
          {machines.map(mac => (
            <button
              key={mac.id}
              onClick={() => handleEntitySelect(mac.id)}
              className="flex items-center justify-between p-4 bg-card border border-border/50 hover:border-primary/30 hover:bg-muted/30 rounded-xl transition-all group text-left"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground uppercase">{mac.id}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${mac.state === 'RUNNING' ? 'bg-amber-500' : mac.state === 'IDLE' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                </div>
                <p className="font-display font-bold text-foreground">{mac.name}</p>
              </div>
              <CaretRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      )
    }

    if (activeTab === "quality_gates") {
      return (
        <div className="flex flex-col gap-2">
          {qualityGates.map(gate => (
            <button
              key={gate.id}
              onClick={() => handleEntitySelect(gate.id)}
              className="flex items-center justify-between p-4 bg-card border border-border/50 hover:border-primary/30 hover:bg-muted/30 rounded-xl transition-all group text-left"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground uppercase">{gate.id}</span>
                </div>
                <p className="font-display font-bold text-foreground">{gate.name}</p>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary mt-1 block">{gate.inspectionType} • {gate.serviceProvider}</span>
              </div>
              <CaretRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      )
    }

    if (activeTab === "lines") {
      return (
        <div className="flex flex-col gap-2">
          {lines.map(line => (
            <div
              key={line.id}
              className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-xl transition-all"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground uppercase">{line.id}</span>
                </div>
                <p className="font-display font-bold text-foreground">{line.name}</p>
                <div className="flex gap-1 items-center mt-2 overflow-x-auto pb-1 max-w-sm">
                  {line.machineIds.map((mId, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <CaretRight className="w-3 h-3 text-muted-foreground mx-1 shrink-0"/>}
                      <span className="text-[10px] font-mono bg-muted text-foreground px-1.5 py-0.5 rounded whitespace-nowrap">{mId}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }
  }

  // Render Drawer/Modal Content
  const renderDrawerContent = () => {
    if (activeTab === "products" && productForm) {
      const isNew = selectedEntityId === "new"

      return (
        <form onSubmit={handleSaveProduct} className="flex flex-col gap-8 h-full">
          
          <div className="flex items-center gap-2 border-b border-border/50 pb-px mb-4">
            <button 
              type="button"
              onClick={() => setProductActiveTab("profile")}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${productActiveTab === 'profile' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t("settings_subtab_profile")}
            </button>
            <button 
              type="button"
              onClick={() => setProductActiveTab("routing")}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${productActiveTab === 'routing' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t("settings_subtab_routing")}
            </button>
            <button 
              type="button"
              onClick={() => setProductActiveTab("notice")}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${productActiveTab === 'notice' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t("settings_subtab_notice")}
            </button>
          </div>

          {/* Product header with image — visible across all tabs */}
          {productForm.imageUrl || productForm.name ? (
            <div className="flex items-center gap-5 pb-2 border-b border-border/20 mb-2">
              {productForm.imageUrl && (
                <div className="w-20 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
                  <img 
                    src={productForm.imageUrl} 
                    alt={productForm.name || "Product"} 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
              <div>
                <p className="font-display font-bold text-lg text-foreground">{productForm.name || t("settings_subtab_profile")}</p>
                <p className="text-xs font-mono text-muted-foreground">{productForm.sku}</p>
              </div>
            </div>
          ) : null}

          {productActiveTab === "profile" && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Profile Basics */}
              <section className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_sku")}</label>
                    <input 
                      type="text" 
                      value={productForm.sku || ""} 
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      required 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_name")}</label>
                    <input 
                      type="text" 
                      value={productForm.name || ""} 
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_margin")}</label>
                    <input 
                      type="number" 
                      value={productForm.targetMargin || 0} 
                      onChange={(e) => setProductForm({ ...productForm, targetMargin: parseFloat(e.target.value) })}
                      required 
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                    />
                  </div>
                </div>
              </section>

              {/* Cost Summary Box */}
              <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_total_materials")}</span>
                  <span className="text-xl font-mono font-bold text-foreground">{totalMaterialsCost.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_total_ops")}</span>
                  <span className="text-xl font-mono font-bold text-foreground">{totalOpCost.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_cost_price")}</span>
                  <span className="text-xl font-mono font-bold text-foreground">{currentCostPrice.toFixed(2)}</span>
                </div>
                <div className="flex flex-col border-l-2 border-primary/20 pl-4">
                  <span className="text-xs font-bold text-primary uppercase">{t("settings_label_sell_price")}</span>
                  <span className="text-2xl font-mono font-bold text-primary">{currentSuggestedPrice.toFixed(2)}</span>
                </div>
              </section>

              {/* BOM Architect */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">{t("settings_section_bom")}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 h-[34px]">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">{t("settings_label_final_mass")}</label>
                      <input 
                        type="number" 
                        value={bomUnit === 'kg' ? bomSumKg.toFixed(2) : (productForm.finalMass || 100)} 
                        onChange={(e) => setProductForm({ ...productForm, finalMass: parseFloat(e.target.value) })}
                        disabled={bomUnit === 'kg'}
                        required 
                        className={`w-16 bg-transparent focus:outline-none font-mono text-xs font-bold text-right ${bomUnit === 'kg' ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground'}`}
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1 border border-border/50">
                      <button type="button" onClick={() => setBomUnit('kg')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${bomUnit === 'kg' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t("settings_mode_kg")}</button>
                      <button type="button" onClick={() => setBomUnit('pct')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${bomUnit === 'pct' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t("settings_mode_pct")}</button>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setShowAddMaterialModal(true)}
                      className="text-xs text-primary hover:text-primary/80 font-bold transition-colors flex items-center gap-1 whitespace-nowrap"
                    >
                      <Plus weight="bold"/> {t("settings_btn_add_material")}
                    </button>
                  </div>
                </div>
                
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 bg-muted/30 p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-4">{t("settings_th_material")}</div>
                    <div className="col-span-3 text-right">{t("settings_th_qty")}</div>
                    <div className="col-span-2 text-right">{t("settings_th_unit_price")}</div>
                    <div className="col-span-2 text-right">{t("settings_th_cost_price")}</div>
                    <div className="col-span-1 text-right"></div>
                  </div>
                  <div className="divide-y divide-border/50">
                    {bomRows.map((line, idx) => {
                      const mat = materials.find(m => m.id === line.materialId)
                      const unitPrice = mat?.costAvg || 0
                      const computedQty = bomUnit === 'pct' ? (line.quantityPerUnit / 100) * finalMass : line.quantityPerUnit
                      const rowCost = computedQty * unitPrice

                      return (
                        <div key={idx} className="grid grid-cols-12 gap-2 p-4 text-sm items-center bg-card">
                          <div className="col-span-4 flex items-center gap-2 text-foreground font-medium truncate">
                            <Cube className="w-5 h-5 text-muted-foreground shrink-0" weight="duotone" />
                            {mat?.name || line.materialId}
                          </div>
                          <div className="col-span-3 flex items-center justify-end gap-2">
                            <input 
                              type="number" 
                              value={line.quantityPerUnit} 
                              step="0.01" 
                              onChange={(e) => handleUpdateMaterialRowQty(idx, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1.5 bg-background border border-border rounded text-right font-mono text-sm text-foreground" 
                            />
                            <span className="text-xs font-bold text-muted-foreground">{bomUnit === 'pct' ? '%' : 'Kg'}</span>
                          </div>
                          <div className="col-span-2 text-right font-mono text-muted-foreground">
                            {unitPrice.toFixed(2)}
                          </div>
                          <div className="col-span-2 text-right font-mono font-bold text-foreground">
                            {rowCost.toFixed(2)}
                          </div>
                          <div className="col-span-1 text-right">
                            <button 
                              type="button" 
                              onClick={() => handleRemoveMaterialRow(idx)}
                              className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-muted/30 transition-colors"
                            >
                              <Trash className="w-4 h-4 inline-block" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {bomRows.length === 0 && (
                      <div className="p-8 text-center text-sm text-muted-foreground bg-card">{t("settings_bom_empty")}</div>
                    )}
                    <div className="grid grid-cols-12 gap-2 p-4 bg-muted/20 border-t border-border/50">
                      <div className="col-span-9 text-right text-xs font-bold text-muted-foreground uppercase">{t("settings_total_materials_cost")}</div>
                      <div className="col-span-2 text-right font-mono font-bold text-foreground">{totalMaterialsCost.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {productActiveTab === "routing" && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Machine Routing */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">{t("settings_section_routing")}</h3>
                  <button 
                    type="button" 
                    onClick={() => setShowAssignMachineModal(true)}
                    className="text-xs text-primary hover:text-primary/80 font-bold transition-colors flex items-center gap-1"
                  >
                     <Plus weight="bold"/> {t("settings_btn_add_machine")}
                  </button>
                </div>
                
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 bg-muted/30 p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-1">{t("settings_th_seq")}</div>
                    <div className="col-span-3">{t("settings_th_machine")}</div>
                    <div className="col-span-2 text-right">{t("settings_th_time")}</div>
                    <div className="col-span-2 text-right">{t("settings_th_use_pct")}</div>
                    <div className="col-span-2 text-right">{t("settings_th_op_cost")}</div>
                    <div className="col-span-2 text-right">{t("settings_th_actions")}</div>
                  </div>
                  <div className="divide-y divide-border/50">
                    {routingRows.map((route, idx) => {
                      const mac = machines.find(m => m.id === route.machineId)
                      const rowOpCost = (route.usagePercentage / 100) * (mac?.opCostPerHour || 0) * (route.timeInHours || 1)
                      
                      const gateObj = productQualityGateRows.find(g => g.sequenceAfter === route.sequence)
                      const actualGate = gateObj ? qualityGates.find(q => q.id === gateObj.gateId) : null

                      return (
                        <React.Fragment key={idx}>
                          <div className="grid grid-cols-12 gap-2 p-4 text-sm items-center bg-card">
                            <div className="col-span-1 font-mono text-muted-foreground">
                              #{route.sequence}
                            </div>
                            <div className="col-span-3 flex items-center gap-3">
                              <HardDrives className="w-5 h-5 text-muted-foreground shrink-0" weight="duotone" />
                              <div>
                                <p className="font-bold text-foreground">{mac?.name || route.machineId}</p>
                                <p className="text-xs text-muted-foreground">{mac?.type}</p>
                              </div>
                            </div>
                            <div className="col-span-2 text-right">
                            <input 
                              type="number" 
                              value={route.timeInHours} 
                              step="0.1" 
                              onChange={(e) => handleUpdateRoutingTime(idx, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1.5 bg-background border border-border rounded text-right font-mono text-sm text-foreground" 
                            />
                          </div>
                          <div className="col-span-2 text-right">
                            <input 
                              type="number" 
                              value={route.usagePercentage} 
                              step="1" 
                              min="0"
                              max="100"
                              onChange={(e) => handleUpdateRoutingUsage(idx, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1.5 bg-background border border-border rounded text-right font-mono text-sm text-foreground" 
                            />
                          </div>
                          <div className="col-span-2 text-right font-mono font-bold text-foreground">
                            {rowOpCost.toFixed(2)}
                          </div>
                          <div className="col-span-2 flex justify-end gap-1">
                            <button type="button" onClick={() => setAssignGateSequence(route.sequence)} title="Add Quality Gate After" className="p-1.5 text-primary hover:bg-primary/20 rounded-md"><CheckSquareOffset className="w-4 h-4"/></button>
                            <button type="button" onClick={() => handleMoveRouting(idx, 'up')} disabled={idx === 0} className="p-1.5 text-muted-foreground hover:bg-muted rounded-md disabled:opacity-30"><CaretUp className="w-4 h-4"/></button>
                            <button type="button" onClick={() => handleMoveRouting(idx, 'down')} disabled={idx === routingRows.length - 1} className="p-1.5 text-muted-foreground hover:bg-muted rounded-md disabled:opacity-30"><CaretDown className="w-4 h-4"/></button>
                            <button type="button" onClick={() => handleRemoveRouting(idx)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md ml-2"><Trash className="w-4 h-4"/></button>
                          </div>
                        </div>
                        
                        {actualGate && (
                          <div className="grid grid-cols-12 gap-2 p-3 text-sm items-center bg-primary/5 border-t border-border/20">
                            <div className="col-span-1"></div>
                            <div className="col-span-9 flex items-center gap-3">
                              <CheckSquareOffset className="w-5 h-5 text-primary shrink-0" weight="duotone" />
                              <div>
                                <p className="font-bold text-foreground text-sm flex items-center gap-2">
                                  {actualGate.name}
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary text-primary-foreground">{t("settings_badge_quality_gate")}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">{actualGate.inspectionType} • {actualGate.serviceProvider}</p>
                              </div>
                            </div>
                            <div className="col-span-2 flex justify-end">
                              <button type="button" onClick={() => handleRemoveQualityGateFromRouting(route.sequence)} className="p-1 text-red-400 hover:bg-red-500/20 rounded-md"><Trash className="w-4 h-4"/></button>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    )
                  })}
                    {routingRows.length === 0 && (
                      <div className="p-8 text-center text-sm text-muted-foreground bg-card">{t("settings_routing_empty")}</div>
                    )}
                    <div className="grid grid-cols-12 gap-2 p-4 bg-muted/20 border-t border-border/50">
                      <div className="col-span-6 text-right text-xs font-bold text-muted-foreground uppercase">{t("settings_total_op_costs")}</div>
                      <div className="col-span-3 text-right font-mono font-bold text-foreground">{totalOpCost.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* QC Parameters */}
              <section className="flex flex-col gap-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">{t("settings_section_qc")}</h3>
                  <button 
                    type="button" 
                    onClick={handleAddQC}
                    className="text-xs text-primary hover:text-primary/80 font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus weight="bold"/> {t("settings_btn_add_param")}
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {qcRows.map((qc, idx) => (
                    <div key={qc.id} className="p-4 border border-border/50 rounded-xl bg-card flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="col-span-2 md:col-span-2 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">{t("settings_label_param")}</label>
                          <input type="text" value={qc.name} onChange={e => handleUpdateQC(idx, 'name', e.target.value)} className="w-full px-3 py-1.5 bg-background text-foreground border border-border rounded text-sm"/>
                        </div>
                        <div className="col-span-1 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">{t("settings_label_min")}</label>
                          <input type="number" value={qc.minValue} onChange={e => handleUpdateQC(idx, 'minValue', parseFloat(e.target.value)||0)} className="w-full px-3 py-1.5 bg-background text-foreground border border-border rounded font-mono text-sm"/>
                        </div>
                        <div className="col-span-1 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">{t("settings_label_max")}</label>
                          <input type="number" value={qc.maxValue} onChange={e => handleUpdateQC(idx, 'maxValue', parseFloat(e.target.value)||0)} className="w-full px-3 py-1.5 bg-background text-foreground border border-border rounded font-mono text-sm"/>
                        </div>
                        <div className="col-span-1 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">{t("settings_label_unit")}</label>
                          <input type="text" value={qc.unit} onChange={e => handleUpdateQC(idx, 'unit', e.target.value)} className="w-full px-3 py-1.5 bg-background text-foreground border border-border rounded text-sm"/>
                        </div>
                        <div className="col-span-2 md:col-span-2 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">{t("settings_label_tolerance")}</label>
                          <input type="number" step="0.1" value={qc.tolerance} onChange={e => handleUpdateQC(idx, 'tolerance', parseFloat(e.target.value)||0)} className="w-full px-3 py-1.5 bg-background text-foreground border border-border rounded font-mono text-sm"/>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleRemoveQC(idx)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg mt-5"><Trash className="w-5 h-5"/></button>
                    </div>
                  ))}
                    {qcRows.length === 0 && (
                      <div className="p-6 text-center text-sm text-muted-foreground border border-border/50 border-dashed rounded-xl">{t("settings_qc_empty")}</div>
                    )}
                </div>
              </section>

            </div>
          )}

          {productActiveTab === "notice" && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_image_url")}</label>
                  <input 
                    type="file" 
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = (ev) => {
                        const dataUrl = ev.target?.result as string
                        setProductForm({ ...productForm, imageUrl: dataUrl })
                      }
                      reader.readAsDataURL(file)
                    }}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
                  />
                  <span className="text-[10px] text-muted-foreground">{t("settings_image_size_hint")}</span>
                </div>

                {(productForm.imageUrl) && (
                  <div className="relative w-full max-w-[400px] max-h-[300px] rounded-xl overflow-hidden border border-border/50 bg-muted/30">
                    <img 
                      src={productForm.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain max-h-[300px]"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = ''; 
                        (e.target as HTMLImageElement).classList.add('hidden');
                      }}
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setProductForm({ ...productForm, imageUrl: "" })}
                  className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors self-start"
                >
                  {t("settings_btn_remove_image")}
                </button>
              </section>

              <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_notice")}</label>
                  <textarea 
                    value={productForm.notice || ""} 
                    onChange={(e) => setProductForm({ ...productForm, notice: e.target.value })}
                    placeholder={t("settings_notice_placeholder")}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground min-h-[160px] resize-y" 
                  />
                </div>
              </section>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-border/50">
            <button type="submit" className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-2 text-lg">
              <FloppyDisk className="w-6 h-6" />
              {isNew ? t("settings_btn_create_product") : t("settings_btn_save_product")}
            </button>
          </div>
        </form>
      )
    }

    if (activeTab === "machines" && machineForm) {
      const isNew = selectedEntityId === "new"

      return (
        <form onSubmit={handleSaveMachine} className="flex flex-col gap-8 h-full">
          <section className="flex flex-col gap-6">

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_machine_name")}</label>
                <input 
                  type="text" 
                  value={machineForm.name || ""} 
                  onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })}
                  required 
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_type")}</label>
                <input 
                  type="text" 
                  value={machineForm.type || ""} 
                  onChange={(e) => setMachineForm({ ...machineForm, type: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground"
                  placeholder={t("settings_placeholder_type")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_state")}</label>
                <select 
                  value={machineForm.state || "IDLE"} 
                  onChange={(e) => setMachineForm({ ...machineForm, state: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none text-foreground font-bold"
                >
                  <option value="IDLE">{t("settings_state_idle")}</option>
                  <option value="RUNNING">{t("settings_state_running")}</option>
                  <option value="MAINTENANCE">{t("settings_state_maintenance")}</option>
                  <option value="OFFLINE">{t("settings_state_offline")}</option>
                </select>
              </div>
              
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_power")}</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={machineForm.powerRating || 0} 
                      onChange={(e) => setMachineForm({ ...machineForm, powerRating: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                    />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_specs")}</label>
                    <textarea 
                      value={machineForm.technicalSpecs || ""} 
                      onChange={(e) => setMachineForm({ ...machineForm, technicalSpecs: e.target.value })}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground min-h-[80px]" 
                      placeholder={t("settings_placeholder_specs")}
                    />
                  </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_maint_cost")}</label>
                <input 
                  type="number" 
                  step="1" 
                  value={machineForm.maintenanceCostPerHour || 0} 
                  onChange={(e) => setMachineForm({ ...machineForm, maintenanceCostPerHour: parseFloat(e.target.value) || 0 })}
                  required 
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_op_cost")}</label>
                <input 
                  type="number" 
                  step="1" 
                  value={machineForm.opCostPerHour || 0} 
                  onChange={(e) => setMachineForm({ ...machineForm, opCostPerHour: parseFloat(e.target.value) || 0 })}
                  required 
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_throughput")}</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={machineForm.operationRate || 0} 
                  onChange={(e) => setMachineForm({ ...machineForm, operationRate: parseFloat(e.target.value) || 0 })}
                  required 
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
            </div>
          </section>

          <div className="mt-auto pt-6 border-t border-border/50">
            <button type="submit" className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-2 text-lg">
              <FloppyDisk className="w-6 h-6" />
              {isNew ? t("settings_btn_register_machine") : t("settings_btn_update_machine")}
            </button>
          </div>
        </form>
      )
    }

    if (activeTab === "quality_gates" && qualityGateForm) {
      const isNew = selectedEntityId === "new"
      return (
        <form onSubmit={handleSaveQualityGate} className="flex flex-col gap-8 h-full">
          <section className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_gate_name")}</label>
                <input type="text" value={qualityGateForm.name || ""} onChange={(e) => setQualityGateForm({ ...qualityGateForm, name: e.target.value })} required className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_gate_desc")}</label>
                <textarea value={qualityGateForm.description || ""} onChange={(e) => setQualityGateForm({ ...qualityGateForm, description: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground min-h-[80px]" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_gate_type")}</label>
                <input type="text" value={qualityGateForm.type || ""} onChange={(e) => setQualityGateForm({ ...qualityGateForm, type: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" placeholder={t("settings_placeholder_gate_type")} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_inspection")}</label>
                <input type="text" value={qualityGateForm.inspectionType || ""} onChange={(e) => setQualityGateForm({ ...qualityGateForm, inspectionType: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_provider")}</label>
                <input type="text" value={qualityGateForm.serviceProvider || ""} onChange={(e) => setQualityGateForm({ ...qualityGateForm, serviceProvider: e.target.value })} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_op_cost")}</label>
                <input type="number" step="1" value={qualityGateForm.opCostPerHour || 0} onChange={(e) => setQualityGateForm({ ...qualityGateForm, opCostPerHour: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{t("settings_label_throughput")}</label>
                <input type="number" step="0.1" value={qualityGateForm.operationRate || 0} onChange={(e) => setQualityGateForm({ ...qualityGateForm, operationRate: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" />
              </div>
            </div>
          </section>
          <div className="mt-auto pt-6 border-t border-border/50">
            <button type="submit" className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-2 text-lg">
              <FloppyDisk className="w-6 h-6" />
              {isNew ? t("settings_btn_register_gate") : t("settings_btn_update_gate")}
            </button>
          </div>
        </form>
      )
    }

    return null
  }

  return (
    <div className="w-full h-[calc(100dvh-64px)] flex relative overflow-hidden bg-background">
      
      {/* Background/Base View - Entity Lists */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6 }}
          className="max-w-4xl w-full mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-display text-foreground font-bold tracking-tight mb-2">{t("settings_title")}</h1>
              <p className="text-muted-foreground text-lg">{t("settings_desc")}</p>
            </div>
            
            {activeTab !== "lines" && (
              <button onClick={handleCreateNew} className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-lg font-medium hover:bg-foreground/90 transition-colors whitespace-nowrap self-start md:self-auto shadow-md">
                <Plus weight="bold" className="w-4 h-4" />
                {t("settings_btn_create")}
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 mb-6 border-b border-border/50 pb-px">
            <button 
              onClick={() => { setActiveTab("products"); setIsDrawerOpen(false) }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'products' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Package className="w-5 h-5" />
              {t("settings_tab_products")}
            </button>
            <button 
              onClick={() => { setActiveTab("machines"); setIsDrawerOpen(false) }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'machines' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <HardDrives className="w-5 h-5" />
              {t("settings_tab_machines")}
            </button>
            <button 
              onClick={() => { setActiveTab("quality_gates"); setIsDrawerOpen(false) }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'quality_gates' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <CheckSquareOffset className="w-5 h-5" />
              {t("settings_tab_gates")}
            </button>
            <button 
              onClick={() => { setActiveTab("lines"); setIsDrawerOpen(false) }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'lines' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Factory className="w-5 h-5" />
              {t("settings_tab_lines")}
            </button>
          </div>

          {/* List Content */}
          <div className="mb-12">
            {renderList()}
          </div>
        </motion.div>
      </div>

      {/* Centered Large Modal for Configuration */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            {/* Full Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={closeDrawer}
            />
            
            {/* Modal Panel */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-card border border-border shadow-2xl flex flex-col rounded-3xl overflow-hidden pointer-events-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-border/50 bg-muted/10">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  {activeTab === "products" ? t("settings_modal_product") : t("settings_modal_machine")}
                </h2>
                <button 
                  onClick={closeDrawer}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors bg-background border border-border/50 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8">
                {renderDrawerContent()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Material Modal Popup (Nested) */}
      <AnimatePresence>
        {showAddMaterialModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowAddMaterialModal(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-[450px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col pointer-events-auto z-50 overflow-hidden"
            >
              <div className="p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Cube className="w-6 h-6 text-primary" weight="duotone" />
                  </div>
                  <button 
                    onClick={() => setShowAddMaterialModal(false)}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-display font-bold tracking-tight mb-2">{t("settings_modal_bom_title")}</h2>
                
                <div className="flex flex-col gap-5 mt-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase">{t("settings_label_select_material")}</label>
                    <select
                      value={newMaterialId}
                      onChange={(e) => setNewMaterialId(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground appearance-none text-sm font-medium"
                    >
                      <option value="" disabled>{t("settings_placeholder_choose_material")}</option>
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase">{t("settings_label_qty")}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newMaterialQty}
                        onChange={(e) => setNewMaterialQty(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!newMaterialId || newMaterialQty <= 0}
                  onClick={handleAddMaterialRow}
                  className="w-full mt-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all text-sm flex justify-center items-center gap-2"
                >
                  {t("settings_btn_add_to_bom")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Machine Modal Popup (Nested) */}
      <AnimatePresence>
        {showAssignMachineModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowAssignMachineModal(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-[450px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col pointer-events-auto z-50 overflow-hidden"
            >
              <div className="p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HardDrives className="w-6 h-6 text-primary" weight="duotone" />
                  </div>
                  <button 
                    onClick={() => setShowAssignMachineModal(false)}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-display font-bold tracking-tight mb-2">{t("settings_modal_routing_title")}</h2>
                
                <div className="flex flex-col gap-5 mt-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase">{t("settings_label_select_machine")}</label>
                    <select
                      value={newRoutingMachineId}
                      onChange={(e) => setNewRoutingMachineId(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground appearance-none text-sm font-medium"
                    >
                      <option value="" disabled>{t("settings_placeholder_choose_machine")}</option>
                      {machines.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase">{t("settings_label_hours")}</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={newRoutingTime}
                        onChange={(e) => setNewRoutingTime(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground text-sm font-mono"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase">{t("settings_label_use_pct")}</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={newRoutingUsage}
                        onChange={(e) => setNewRoutingUsage(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!newRoutingMachineId}
                  onClick={handleAddRouting}
                  className="w-full mt-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all text-sm flex justify-center items-center gap-2"
                >
                  {t("settings_btn_append")}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Assign Gate Modal */}
        {assignGateSequence !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
              onClick={() => setAssignGateSequence(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-[450px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col pointer-events-auto z-50 overflow-hidden"
            >
              <div className="p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CheckSquareOffset className="w-6 h-6 text-primary" weight="duotone" />
                  </div>
                  <button 
                    onClick={() => setAssignGateSequence(null)}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-display font-bold tracking-tight mb-2">{t("settings_modal_gate_title")}</h2>
                <p className="text-muted-foreground text-sm">{t("settings_modal_gate_desc")} #{assignGateSequence}</p>
                
                <div className="flex flex-col gap-5 mt-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase">{t("settings_label_select_gate")}</label>
                    <select
                      id="qualityGateSelect"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground appearance-none text-sm font-medium"
                      defaultValue=""
                    >
                      <option value="" disabled>{t("settings_placeholder_choose_gate")}</option>
                      {qualityGates.map(g => (
                        <option key={g.id} value={g.id}>{g.name} ({g.type})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase">{t("settings_label_hours")}</label>
                    <input
                      id="qualityGateTime"
                      type="number"
                      step="0.05"
                      min="0"
                      defaultValue={0.25}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground text-sm font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const select = document.getElementById('qualityGateSelect') as HTMLSelectElement
                    const timeInput = document.getElementById('qualityGateTime') as HTMLInputElement
                    if (select && select.value) {
                      const timeHours = timeInput ? parseFloat(timeInput.value) || 0.25 : 0.25
                      setProductQualityGateRows(prev => {
                        const filtered = prev.filter(p => p.sequenceAfter !== assignGateSequence)
                        return [...filtered, { sequenceAfter: assignGateSequence, gateId: select.value, timeInHours: timeHours }]
                      })
                      setAssignGateSequence(null)
                    }
                  }}
                  className="w-full mt-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all text-sm flex justify-center items-center gap-2"
                >
                  {t("settings_btn_assign_gate")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  )
}
