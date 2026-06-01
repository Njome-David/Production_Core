"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { Plus, Package, Factory, HardDrives, CaretRight, X, FloppyDisk, Cube, Trash, ShieldCheck, Robot, WarningCircle } from "@phosphor-icons/react"
import { buildMachineAlert } from "@/lib/production-calculations"
import { BOMLine, Machine, Product, ProductionLine } from "@/lib/mock-db"

type ConfigTab = "products" | "lines" | "machines" | "roles"
type ProductForm = Product & { targetProtein?: number; targetMoisture?: number }
type LineForm = ProductionLine
type MachineForm = Machine

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
  const [productForm, setProductForm] = useState<ProductForm | null>(null)
  const [bomRows, setBomRows] = useState<Array<{ materialId: string, quantityPerUnit: number, note?: string }>>([])
  const [lineForm, setLineForm] = useState<LineForm | null>(null)
  const [machineForm, setMachineForm] = useState<MachineForm | null>(null)

  // Sub-modal states
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false)
  const [newMaterialId, setNewMaterialId] = useState("")
  const [newMaterialQty, setNewMaterialQty] = useState(1.5)

  const [showAssignMachineModal, setShowAssignMachineModal] = useState(false)
  const [newMachineId, setNewMachineId] = useState("")

  const loadDrawerState = (tab: ConfigTab, id: string, forceNew = false) => {
    if (tab === "products") {
      const prod: ProductForm | undefined = forceNew 
        ? { id, sku: "SKU-NEW", name: "", price: 0, targetMarginPercent: 25, laborCostPerBatch: 0, fixedLaunchCost: 0, assignedLineIds: [], profileLocked: false, aiEnabled: false, qcRequired: false, qualityControls: [] }
        : products.find(p => p.id === id)
      
      setProductForm(prod ? { ...prod } : null)
      
      const bom = forceNew ? null : boms.find(b => b.productId === id)
      setBomRows(bom ? [...bom.lines] : [])
    } else if (tab === "lines") {
      const ln: LineForm | undefined = forceNew
        ? { id, name: "", orgId: "org_alpha_feed", machineIds: [], productIds: [] }
        : lines.find(l => l.id === id)
      
      setLineForm(ln ? { ...ln } : null)
    } else if (tab === "machines") {
      const mac: MachineForm | undefined = forceNew
        ? { id, name: "", description: "", type: "MIXER", state: "IDLE", maintenanceCostPerHour: 1500, hourlyCost: 2500, depreciationCostPerHour: 300, netBookValue: 0, availabilityPercent: 95, utilizationPercent: 0, priority: "MEDIUM", scheduleWindow: "08:00-17:00", operationRate: 20, isQualityCheckService: false, trackingMetrics: ["OEE"] }
        : machines.find(m => m.id === id)
      
      setMachineForm(mac ? { ...mac } : null)
    }
  }

  // Handlers
  const handleEntitySelect = (id: string) => {
    setSelectedEntityId(id)
    loadDrawerState(activeTab, id)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedEntityId(null)
  }

  const handleCreateNew = () => {
    const prefix = activeTab === "products" ? "prod" : activeTab === "lines" ? "line" : "mac"
    const generatedId = `${prefix}_${Date.now()}`
    setSelectedEntityId("new")
    loadDrawerState(activeTab, generatedId, true)
    setIsDrawerOpen(true)
  }

  // BOM Material Row Handlers
  const handleRemoveMaterialRow = (idx: number) => {
    setBomRows(prev => prev.filter((_, i) => i !== idx))
  }

  const handleUpdateMaterialRowQty = (idx: number, qty: number) => {
    setBomRows(prev => prev.map((row, i) => i === idx ? { ...row, quantityPerUnit: qty } : row))
  }

  const handleUpdateMaterialRowNote = (idx: number, note: string) => {
    setBomRows(prev => prev.map((row, i) => i === idx ? { ...row, note } : row))
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
        lines: bomRows as BOMLine[]
      })
    } else {
      updateProduct(productForm.id, productForm)
      const existingBom = boms.find(b => b.productId === productForm.id)
      if (existingBom) {
        updateBOM(existingBom.id, { lines: bomRows as BOMLine[] })
      } else {
        addBOM({
          id: `bom_${Date.now()}`,
          productId: productForm.id,
          lines: bomRows as BOMLine[]
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

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { role: "Manager", scope: "Orders, costs, inventory, machines", locked: true },
          { role: "Operator", scope: "Station execution and QC input", locked: true },
          { role: "Expert Produit", scope: "Product profiles, BOM, quality controls, AI checks", locked: false },
        ].map(role => (
          <div key={role.role} className="p-5 bg-card border border-border/50 rounded-xl flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" weight="duotone" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground">{role.role}</p>
              <p className="text-sm text-muted-foreground mt-1">{role.scope}</p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{role.locked ? "Core role" : "New configurable role"}</span>
          </div>
        ))}
      </div>
    )
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
                <label className="text-xs font-bold text-muted-foreground uppercase">Target Margin</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={productForm.targetMarginPercent || 0} 
                    onChange={(e) => setProductForm({ ...productForm, targetMarginPercent: parseFloat(e.target.value) })}
                    required 
                    className="w-full pl-3 pr-14 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">%</span>
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
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Labor Cost/Batch</label>
                <input 
                  type="number" 
                  value={productForm.laborCostPerBatch || 0} 
                  onChange={(e) => setProductForm({ ...productForm, laborCostPerBatch: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Launch Cost</label>
                <input 
                  type="number" 
                  value={productForm.fixedLaunchCost || 0} 
                  onChange={(e) => setProductForm({ ...productForm, fixedLaunchCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Lifecycle Governance</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="p-3 rounded-lg border border-border/50 bg-card flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={productForm.profileLocked || false} onChange={(e) => setProductForm({ ...productForm, profileLocked: e.target.checked })} />
                <span className="text-sm text-foreground">Lock profile</span>
              </label>
              <label className="p-3 rounded-lg border border-border/50 bg-card flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={productForm.aiEnabled || false} onChange={(e) => setProductForm({ ...productForm, aiEnabled: e.target.checked })} />
                <Robot className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">AI checks</span>
              </label>
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
                <label className="text-xs font-bold text-muted-foreground uppercase">Quality Control Elements</label>
                <textarea 
                  rows={4}
                  value={(productForm.qualityControls || []).join("\n")} 
                  onChange={(e) => setProductForm({ ...productForm, qualityControls: e.target.value.split("\n").map(item => item.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" 
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
                <div className="col-span-4">Material</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Qty/Unit</div>
                <div className="col-span-2">Note</div>
                <div className="col-span-2 text-right">Action</div>
              </div>
              <div className="divide-y divide-border/50">
                {bomRows.map((line, idx) => {
                  const mat = materials.find(m => m.id === line.materialId)
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-3 text-sm items-center bg-card">
                      <div className="col-span-4 flex items-center gap-2 text-foreground font-medium truncate">
                        <Cube className="w-4 h-4 text-muted-foreground shrink-0" />
                        {mat?.name || line.materialId}
                      </div>
                      <div className="col-span-2 text-right font-mono text-red-500">
                        {Math.round(mat?.costAvg ?? 0).toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right">
                        <input 
                          type="number" 
                          value={line.quantityPerUnit} 
                          step="0.01" 
                          onChange={(e) => handleUpdateMaterialRowQty(idx, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-background border border-border rounded text-right font-mono text-sm text-foreground" 
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="text" 
                          value={line.note || ""} 
                          onChange={(e) => handleUpdateMaterialRowNote(idx, e.target.value)}
                          className="w-full px-2 py-1 bg-background border border-border rounded text-xs text-foreground" 
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
                  onChange={(e) => setMachineForm({ ...machineForm, state: e.target.value as Machine["state"] })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none text-foreground"
                >
                  <option value="IDLE">Idle</option>
                  <option value="RUNNING">Running</option>
                  <option value="MAINTENANCE">Maintenance</option>
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
                  value={machineForm.operationRate || 0} 
                  onChange={(e) => setMachineForm({ ...machineForm, operationRate: parseFloat(e.target.value) || 0 })}
                  required 
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" 
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Cost, Duration & Planning</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Usage Cost/Hr</label>
                <input type="number" value={machineForm.hourlyCost || 0} onChange={(e) => setMachineForm({ ...machineForm, hourlyCost: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Depreciation/Hr</label>
                <input type="number" value={machineForm.depreciationCostPerHour || 0} onChange={(e) => setMachineForm({ ...machineForm, depreciationCostPerHour: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Net Book Value</label>
                <input type="number" value={machineForm.netBookValue || 0} onChange={(e) => setMachineForm({ ...machineForm, netBookValue: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-red-500" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Schedule Window</label>
                <input type="text" value={machineForm.scheduleWindow || ""} onChange={(e) => setMachineForm({ ...machineForm, scheduleWindow: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground" />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Metrics & Alerts</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Availability (%)</label>
                <input type="number" min="0" max="100" value={machineForm.availabilityPercent || 0} onChange={(e) => setMachineForm({ ...machineForm, availabilityPercent: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Utilization (%)</label>
                <input type="number" min="0" max="100" value={machineForm.utilizationPercent || 0} onChange={(e) => setMachineForm({ ...machineForm, utilizationPercent: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm font-mono text-foreground" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Priority</label>
                <select value={machineForm.priority || "MEDIUM"} onChange={(e) => setMachineForm({ ...machineForm, priority: e.target.value as Machine["priority"] })} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm appearance-none text-foreground">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <label className="p-3 rounded-lg border border-border/50 bg-card flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={machineForm.isQualityCheckService || false} onChange={(e) => setMachineForm({ ...machineForm, isQualityCheckService: e.target.checked })} />
                <span className="text-sm text-foreground">QC service</span>
              </label>
            </div>
            <textarea
              rows={3}
              value={(machineForm.trackingMetrics || []).join("\n")}
              onChange={(e) => setMachineForm({ ...machineForm, trackingMetrics: e.target.value.split("\n").map(item => item.trim()).filter(Boolean) })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground"
            />
            {buildMachineAlert(machineForm) && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2">
                <WarningCircle className="w-4 h-4" weight="fill" />
                {buildMachineAlert(machineForm)}
              </div>
            )}
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
            
            {activeTab !== "roles" && (
              <button onClick={handleCreateNew} className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-lg font-medium hover:bg-foreground/90 transition-colors whitespace-nowrap self-start md:self-auto">
                <Plus weight="bold" className="w-4 h-4" />
                Create New
              </button>
            )}
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
            <button 
              onClick={() => { setActiveTab("roles"); setIsDrawerOpen(false) }}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'roles' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <ShieldCheck className="w-4 h-4" />
              Roles
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
	                    Select a workstation to add to the line&apos;s machine sequence.
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
