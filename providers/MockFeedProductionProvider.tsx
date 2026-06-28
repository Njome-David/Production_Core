"use client"

import React, { createContext, useContext, useMemo, useState, ReactNode } from "react"
import { 
  ActiveSession, 
  Material, 
  Machine, 
  Product, 
  ManufacturingOrder, 
  BOM,
  ProductionLine,
  InventoryLedgerEntry,
  MOStatus,
  MachineState,
  QualityGate,
  AdditionalCost,
  INITIAL_MATERIALS, 
  INITIAL_MACHINES, 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS,
  INITIAL_BOMS,
  INITIAL_LINES,
  INITIAL_LEDGER,
  INITIAL_QUALITY_GATES,
  INITIAL_ADDITIONAL_COSTS
} from "@/lib/mock-db"

export interface ActiveManufacturingOrder extends ManufacturingOrder {
  productName: string
  routing: string
  bom: BOM | null
}

interface MockContextState {
  activeSession: ActiveSession | null
  setActiveSession: React.Dispatch<React.SetStateAction<ActiveSession | null>>
  
  activeUnit: "units" | "tons" | "kg"
  setActiveUnit: React.Dispatch<React.SetStateAction<"units" | "tons" | "kg">>

  materials: Material[]
  updateMaterialBalance: (id: string, qty: number) => void
  recordInventoryTransaction: (entry: Omit<InventoryLedgerEntry, "id" | "timestamp">) => void
  addMaterial: (material: Material) => void
  inventoryLedger: InventoryLedgerEntry[]

  machines: Machine[]
  updateMachineState: (id: string, state: MachineState) => void
  addMachine: (machine: Machine) => void
  updateMachine: (id: string, updates: Partial<Machine>) => void
  
  qualityGates: QualityGate[]
  addQualityGate: (gate: QualityGate) => void
  updateQualityGate: (id: string, updates: Partial<QualityGate>) => void
  
  products: Product[]
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void

  boms: BOM[]
  addBOM: (bom: BOM) => void
  updateBOM: (id: string, updates: Partial<BOM>) => void

  lines: ProductionLine[]
  addLine: (line: ProductionLine) => void
  updateLine: (id: string, updates: Partial<ProductionLine>) => void

  additionalCosts: AdditionalCost[]
  addAdditionalCost: (cost: AdditionalCost) => void
  updateAdditionalCost: (id: string, updates: Partial<AdditionalCost>) => void

  
  orders: ManufacturingOrder[]
  addOrder: (order: ManufacturingOrder) => void
  setMOStatus: (id: string, status: MOStatus) => void
  updateMO: (id: string, updates: Partial<ManufacturingOrder>) => void
  
  activeMOs: ActiveManufacturingOrder[]
  globalInventory: { id: string; category: string; quantity: number }[]
}

const MockFeedContext = createContext<MockContextState | undefined>(undefined)

export function MockFeedProductionProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [activeUnit, setActiveUnit] = useState<"units" | "tons" | "kg">("units")
  
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS)
  const [inventoryLedger, setInventoryLedger] = useState<InventoryLedgerEntry[]>(INITIAL_LEDGER)
  
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [boms, setBoms] = useState<BOM[]>(INITIAL_BOMS)
  const [orders, setOrders] = useState<ManufacturingOrder[]>(INITIAL_ORDERS)
  const [qualityGates, setQualityGates] = useState<QualityGate[]>(INITIAL_QUALITY_GATES)
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>(INITIAL_ADDITIONAL_COSTS)

  const [lines, setLines] = useState<ProductionLine[]>(INITIAL_LINES)

  const activeMOs = useMemo(() => {
    return orders.map(order => {
      const product = products.find(p => p.id === order.productId)
      const line = lines.find(l => l.id === order.lineId)
      const bom = boms.find(b => b.productId === order.productId) || null

      return {
        ...order,
        productName: product?.name ?? "Unknown Product",
        routing: line?.name ?? "Unassigned Line",
        bom,
      }
    })
  }, [orders, products, lines, boms])

  const globalInventory = useMemo(() => {
    return materials.map(m => ({ id: m.id, category: m.category === 'raw' ? 'Bulk Solid' : 'Component', quantity: m.balanceVolume }))
  }, [materials])

  const updateMaterialBalance = (id: string, qty: number) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, balanceVolume: m.balanceVolume + qty } : m))
  }

  const recordInventoryTransaction = (entry: Omit<InventoryLedgerEntry, "id" | "timestamp">) => {
    const newEntry: InventoryLedgerEntry = {
      ...entry,
      id: `ledg_${Date.now()}`,
      timestamp: new Date().toISOString()
    }
    setInventoryLedger(prev => [newEntry, ...prev])

    // Update Moving Average if REFILL
    if (entry.type === "REFILL") {
      setMaterials(prev => prev.map(m => {
        if (m.id === entry.materialId) {
          const currentTotalValue = m.balanceVolume * m.costAvg
          const newTotalValue = entry.totalValue
          const newTotalVolume = m.balanceVolume + entry.quantity
          const newAvgCost = newTotalVolume > 0 ? (currentTotalValue + newTotalValue) / newTotalVolume : m.costAvg
          
          return {
            ...m,
            balanceVolume: newTotalVolume,
            costAvg: newAvgCost
          }
        }
        return m
      }))
    } else {
      updateMaterialBalance(entry.materialId, -entry.quantity)
    }
  }

  const updateMachineState = (id: string, state: MachineState) => {
    setMachines(prev => prev.map(m => m.id === id ? { ...m, state } : m))
  }

  const setMOStatus = (id: string, status: MOStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const updates: Partial<ManufacturingOrder> = { status }
        if (status === "IN_PROGRESS" && !order.startedAt) updates.startedAt = new Date().toISOString()
        if (status === "COMPLETED" && !order.completedAt) updates.completedAt = new Date().toISOString()
        return { ...order, ...updates }
      }
      return order
    }))
  }

  const updateMO = (id: string, updates: Partial<ManufacturingOrder>) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, ...updates } : order))
  }

  const addOrder = (order: ManufacturingOrder) => {
    setOrders(prev => [...prev, order])
  }

  const addMaterial = (material: Material) => setMaterials(prev => [...prev, material])
  const addMachine = (machine: Machine) => setMachines(prev => [...prev, machine])
  const updateMachine = (id: string, updates: Partial<Machine>) => setMachines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  const addQualityGate = (gate: QualityGate) => setQualityGates(prev => [...prev, gate])
  const updateQualityGate = (id: string, updates: Partial<QualityGate>) => setQualityGates(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
  const addProduct = (product: Product) => setProducts(prev => [...prev, product])
  const updateProduct = (id: string, updates: Partial<Product>) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  const addBOM = (bom: BOM) => setBoms(prev => [...prev, bom])
  const updateBOM = (id: string, updates: Partial<BOM>) => setBoms(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  const addLine = (line: ProductionLine) => setLines(prev => [...prev, line])
  const updateLine = (id: string, updates: Partial<ProductionLine>) => setLines(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
  const addAdditionalCost = (cost: AdditionalCost) => setAdditionalCosts(prev => [...prev, cost])
  const updateAdditionalCost = (id: string, updates: Partial<AdditionalCost>) => setAdditionalCosts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))


  return (
    <MockFeedContext.Provider value={{
      activeSession,
      setActiveSession,
      activeUnit,
      setActiveUnit,
      materials,
      updateMaterialBalance,
      recordInventoryTransaction,
      addMaterial,
      inventoryLedger,
      machines,
      updateMachineState,
      addMachine,
      updateMachine,
      qualityGates,
      addQualityGate,
      updateQualityGate,
      products,
      addProduct,
      updateProduct,
      boms,
      addBOM,
      updateBOM,
      lines,
      addLine,
      updateLine,
      additionalCosts,
      addAdditionalCost,
      updateAdditionalCost,
      activeMOs,
      globalInventory,
      orders,
      addOrder,
      setMOStatus,
      updateMO
    }}>
      {children}
    </MockFeedContext.Provider>
  )
}

export function useMockData() {
  const context = useContext(MockFeedContext)
  if (context === undefined) {
    throw new Error("useMockData must be used within a MockFeedProductionProvider")
  }
  return context
}
