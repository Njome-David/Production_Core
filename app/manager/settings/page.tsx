"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { Gear, Plus, Package, Factory, HardDrives, CaretRight, X, FloppyDisk, Drop, Cube, Trash } from "@phosphor-icons/react"

type ConfigTab = "products" | "lines" | "machines"

export default function SettingsPage() {
  const { 
    products, 
    lines, 
    machines, 
    boms, 
    materials,
    updateProduct,
    addProduct,
    updateBOM,
    addBOM,
    updateLine,
    addLine,
    updateMachine,
    addMachine
  } = useMockData()
  
  const [activeTab, setActiveTab] = useState<ConfigTab>("products")
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Local form states
  const [productForm, setProductForm] = useState<any>(null)
  const [bomRows, setBomRows] = useState<Array<{ materialId: string, quantityPerUnit: number }>>([])
  const [lineForm, setLineForm] = useState<any>(null)
  const [machineForm, setMachineForm] = useState<any>(null)

  // Sub-modal states
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false)
  const [newMaterialId, setNewMaterialId] = useState("")
  const [newMaterialQty, setNewMaterialQty] = useState(1.5)

  const [showAssignMachineModal, setShowAssignMachineModal] = useState(false)
  const [newMachineId, setNewMachineId] = useState("")

  // Synchronize state when selection changes
  React.useEffect(() => {
    if (!selectedEntityId) return

    if (activeTab === "products") {
      const isNew = selectedEntityId === "new"
      const prod = isNew 
        ? { id: `prod_${Date.now()}`, sku: "SKU-NEW", name: "", price: 12000, unit: "batches", qcRequired: false, targetProtein: 16.5, targetMoisture: 12.0, acceptableWeightVariance: 2.0 }
        : products.find(p => p.id === selectedEntityId)
      
      setProductForm(prod ? { ...prod } : null)
      
      const bom = isNew ? null : boms.find(b => b.productId === selectedEntityId)
      setBomRows(bom ? [...bom.lines] : [])
    } else if (activeTab === "lines") {
      const isNew = selectedEntityId === "new"
      const ln = isNew
        ? { id: `line_${Date.now()}`, name: "", machineIds: [] }
        : lines.find(l => l.id === selectedEntityId)
      
      setLineForm(ln ? { ...ln } : null)
    } else if (activeTab === "machines") {
      const isNew = selectedEntityId === "new"
      const mac = isNew
        ? { id: `mac_${Date.now()}`, name: "", type: "MIXER", state: "IDLE", maintenanceCostPerHour: 1500, productionRatePerHour: 20 }
        : machines.find(m => m.id === selectedEntityId)
      
      setMachineForm(mac ? { ...mac } : null)
    }
  }, [selectedEntityId, activeTab, products, boms, lines, machines])

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
      const existingIdx = prev.findIndex(r => r.materialId === newMaterialId)
      if (existingIdx >= 0) {
        const updated = [...prev]
        updated[existingIdx].quantityPerUnit += newMaterialQty
        return updated
      }
      return [...prev, { materialId: newMaterialId, quantityPerUnit: newMaterialQty }]
    })
    setShowAddMaterialModal(false)
    setNewMaterialId("")
    setNewMaterialQty(1.5)
  }

  // Machine Routing Handlers
  const handleRemoveMachineFromLine = (mId: string) => {
    if (!lineForm) return
    setLineForm({
      ...lineForm,
      machineIds: lineForm.machineIds.filter((id: string) => id !== mId)
    })
  }

  const handleAddMachineToLine = () => {
    if (!newMachineId || !lineForm) return
    if (lineForm.machineIds.includes(newMachineId)) {
      setShowAssignMachineModal(false)
      return
    }
    setLineForm({
      ...lineForm,
      machineIds: [...lineForm.machineIds, newMachineId]
    })
    setShowAssignMachineModal(false)
    setNewMachineId("")
  }

  // Submit/Save Handlers
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productForm) return

    const isNew = selectedEntityId === "new"
    if (isNew) {
      addProduct(productForm)
      addBOM({
        id: `bom_${Date.now()}`,
        productId: productForm.id,
        lines: bomRows
      })
    } else {
      updateProduct(productForm.id, productForm)
      const existingBom = boms.find(b => b.productId === productForm.id)
      if (existingBom) {
        updateBOM(existingBom.id, { lines: bomRows })
      } else {
        addBOM({
          id: `bom_${Date.now()}`,
          productId: productForm.id,
          lines: bomRows
        })
      }
    }
    closeDrawer()
  }

  const handleSaveLine = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lineForm) return

    const isNew = selectedEntityId === "new"
    if (isNew) {
      addLine(lineForm)
    } else {
      updateLine(lineForm.id, lineForm)
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
            <button
              key={line.id}
              onClick={() => handleEntitySelect(line.id)}
              className="flex items-center justify-between p-4 bg-card border border-border/50 hover:border-primary/30 hover:bg-muted/30 rounded-xl transition-all group text-left"
            >
              <div>
                <span className="text-xs font-mono text-muted-foreground uppercase">{line.id}</span>
                <p className="font-display font-bold text-foreground mt-1">{line.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{line.machineIds.length} Machines</span>
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
  }

  // Render Right Drawer Content
  const renderDrawerContent = () => {
    if (activeTab === "products" && productForm) {
      const isNew = selectedEntityId === "new"

      return (
        <form onSubmit={handleSaveProduct} className="flex flex-col gap-8 h-full">
          {/* Profile */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Product Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">SKU</label>
                <input 
                  type="text" 
                  value={productForm.sku || ""} 
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  required 
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Target Price</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={productForm.price || 0} 
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                    required 
                    className="w-full pl-3 pr-14 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">FCFA</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Display Name</label>
                <input 
                  type="text" 
                  value={productForm.name || ""} 
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required 
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" 
                />
              </div>
            </div>
          </section>

          {/* QC Parameters */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Quality Control Parameters</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={productForm.qcRequired || false} 
                  onChange={(e) => setProductForm({ ...productForm, qcRequired: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary" 
                />
                <span className="text-sm font-medium text-foreground">Require QC</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Target Protein (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={productForm.targetProtein || 0} 
                  onChange={(e) => setProductForm({ ...productForm, targetProtein: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Target Moisture (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={productForm.targetMoisture || 0} 
                  onChange={(e) => setProductForm({ ...productForm, targetMoisture: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Weight Variance Tolerance (±%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={productForm.acceptableWeightVariance || 0} 
                  onChange={(e) => setProductForm({ ...productForm, acceptableWeightVariance: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
            </div>
          </section>

          {/* BOM Architect */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">BOM Architect</h3>
              <button 
                type="button" 
                onClick={() => setShowAddMaterialModal(true)}
                className="text-xs text-primary hover:text-primary/80 font-bold transition-colors"
              >
                + Add Material
              </button>
            </div>
            
            <div className="border border-border/50 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 bg-muted/30 p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-6">Material</div>
                <div className="col-span-4 text-right">Qty/Unit (Kg)</div>
                <div className="col-span-2 text-right">Action</div>
              </div>
              <div className="divide-y divide-border/50">
                {bomRows.map((line, idx) => {
                  const mat = materials.find(m => m.id === line.materialId)
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-3 text-sm items-center bg-card">
                      <div className="col-span-6 flex items-center gap-2 text-foreground font-medium truncate">
                        <Cube className="w-4 h-4 text-muted-foreground shrink-0" />
                        {mat?.name || line.materialId}
                      </div>
                      <div className="col-span-4 text-right">
                        <input 
                          type="number" 
                          value={line.quantityPerUnit} 
                          step="0.01" 
                          onChange={(e) => handleUpdateMaterialRowQty(idx, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-background border border-border rounded text-right font-mono text-sm text-foreground" 
                        />
                      </div>
                      <div className="col-span-2 text-right">
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
                  <div className="p-6 text-center text-sm text-muted-foreground bg-card">No BOM components.</div>
                )}
              </div>
            </div>
          </section>

          <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 mt-auto">
            <FloppyDisk className="w-5 h-5" />
            {isNew ? "Create Product" : "Save Profile"}
          </button>
        </form>
      )
    }

    if (activeTab === "lines" && lineForm) {
      const isNew = selectedEntityId === "new"

      return (
        <form onSubmit={handleSaveLine} className="flex flex-col gap-8 h-full">
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Line Configuration</h3>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Line Name</label>
              <input 
                type="text" 
                value={lineForm.name || ""} 
                onChange={(e) => setLineForm({ ...lineForm, name: e.target.value })}
                required 
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" 
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Machine Routing</h3>
              <button 
                type="button" 
                onClick={() => setShowAssignMachineModal(true)}
                className="text-xs text-primary hover:text-primary/80 font-bold transition-colors"
              >
                + Assign Machine
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {lineForm.machineIds.map((mId: string) => {
                const mac = machines.find(m => m.id === mId)
                return (
                  <div key={mId} className="p-3 bg-card border border-border/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HardDrives className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{mac?.name || mId}</p>
                        <p className="text-xs text-muted-foreground font-mono">{mId}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMachineFromLine(mId)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
              {lineForm.machineIds.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground border border-border/50 border-dashed rounded-lg bg-card">No machines assigned.</div>
              )}
            </div>
          </section>

          <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 mt-auto">
            <FloppyDisk className="w-5 h-5" />
            {isNew ? "Create Line" : "Update Line Routing"}
          </button>
        </form>
      )
    }

    if (activeTab === "machines" && machineForm) {
      const isNew = selectedEntityId === "new"

      return (
        <form onSubmit={handleSaveMachine} className="flex flex-col gap-8 h-full">
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Machine Configuration</h3>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Machine Name</label>
              <input 
                type="text" 
                value={machineForm.name || ""} 
                onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })}
                required 
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Type</label>
                <select 
                  value={machineForm.type || "MIXER"} 
                  onChange={(e) => setMachineForm({ ...machineForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none text-foreground"
                >
                  <option value="MIXER">Mixer</option>
                  <option value="PELLETIZER">Pelletizer</option>
                  <option value="PACKAGER">Packager</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">State</label>
                <select 
                  value={machineForm.state || "IDLE"} 
                  onChange={(e) => setMachineForm({ ...machineForm, state: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none text-foreground"
                >
                  <option value="IDLE">Idle</option>
                  <option value="RUNNING">Running</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Maint. Cost/Hr (FCFA)</label>
                <input 
                  type="number" 
                  step="1" 
                  value={machineForm.maintenanceCostPerHour || 0} 
                  onChange={(e) => setMachineForm({ ...machineForm, maintenanceCostPerHour: parseFloat(e.target.value) || 0 })}
                  required 
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Prod. Rate/Hr (Batches)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={machineForm.productionRatePerHour || 0} 
                  onChange={(e) => setMachineForm({ ...machineForm, productionRatePerHour: parseFloat(e.target.value) || 0 })}
                  required 
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
            </div>
          </section>

          <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 mt-auto">
            <FloppyDisk className="w-5 h-5" />
            {isNew ? "Create Machine" : "Update Machine"}
          </button>
        </form>
      )
    }

    return null
  }

  return (
    <div className="w-full h-[calc(100dvh-64px)] flex relative overflow-hidden bg-background">
      
      {/* Left Column - Entity Lists */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6 }}
          className="max-w-4xl w-full mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-display text-foreground font-bold tracking-tight mb-2">Config Studio</h1>
              <p className="text-muted-foreground text-lg">System-wide parameters, user roles, and machine routing logic.</p>
            </div>
            
            <button onClick={handleCreateNew} className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-lg font-medium hover:bg-foreground/90 transition-colors whitespace-nowrap self-start md:self-auto">
              <Plus weight="bold" className="w-4 h-4" />
              Create New
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-px">
            <button 
              onClick={() => { setActiveTab("products"); setIsDrawerOpen(false) }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'products' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Package className="w-4 h-4" />
              Product Profiles
            </button>
            <button 
              onClick={() => { setActiveTab("lines"); setIsDrawerOpen(false) }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'lines' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Factory className="w-4 h-4" />
              Production Lines
            </button>
            <button 
              onClick={() => { setActiveTab("machines"); setIsDrawerOpen(false) }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'machines' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <HardDrives className="w-4 h-4" />
              Machine Roster
            </button>
          </div>

          {/* List Content */}
          <div className="mb-12">
            {renderList()}
          </div>
        </motion.div>
      </div>

      {/* Right Column - Slide-out Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Full Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md pointer-events-auto"
              onClick={closeDrawer}
            />
            
            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[450px] h-full bg-card border-l border-border shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-background/50">
                <h2 className="text-xl font-display font-bold text-foreground">
                  {activeTab === "products" ? "Edit Product" : activeTab === "lines" ? "Edit Line" : "Edit Machine"}
                </h2>
                <button 
                  onClick={closeDrawer}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-card">
                {renderDrawerContent()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Material Modal Popup */}
      <AnimatePresence>
        {showAddMaterialModal && (
          <div className="fixed inset-0 z-[200] flex justify-end pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-md pointer-events-auto"
              onClick={() => setShowAddMaterialModal(false)}
            />
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative w-full max-w-[450px] h-full bg-card border-l border-border shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto z-50"
            >
              <div className="flex-1 overflow-y-auto p-8 flex flex-col h-full justify-between">
                <div>
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
                  
                  <h2 className="text-2xl font-display font-bold tracking-tight mb-2">Add Feedstock Material</h2>
                  <p className="text-muted-foreground text-sm mb-8">
                    Select a raw component and define its proportion per batch.
                  </p>
                  
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">Select Material</label>
                      <select
                        value={newMaterialId}
                        onChange={(e) => setNewMaterialId(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none text-sm"
                      >
                        <option value="" disabled>-- Choose a Material --</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">Quantity per Batch (Kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={newMaterialQty}
                        onChange={(e) => setNewMaterialQty(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-sm font-mono"
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
                  Add to Formulation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Machine Modal Popup */}
      <AnimatePresence>
        {showAssignMachineModal && (
          <div className="fixed inset-0 z-[200] flex justify-end pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-md pointer-events-auto"
              onClick={() => setShowAssignMachineModal(false)}
            />
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative w-full max-w-[450px] h-full bg-card border-l border-border shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto z-50"
            >
              <div className="flex-1 overflow-y-auto p-8 flex flex-col h-full justify-between">
                <div>
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
                  
                  <h2 className="text-2xl font-display font-bold tracking-tight mb-2">Assign Processing Unit</h2>
                  <p className="text-muted-foreground text-sm mb-8">
                    Select a workstation to add to the line's machine sequence.
                  </p>
                  
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">Select Machine</label>
                      <select
                        value={newMachineId}
                        onChange={(e) => setNewMachineId(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none text-sm"
                      >
                        <option value="" disabled>-- Choose a Machine --</option>
                        {machines.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!newMachineId}
                  onClick={handleAddMachineToLine}
                  className="w-full mt-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all text-sm flex justify-center items-center gap-2"
                >
                  Assign to Line
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  )
}
