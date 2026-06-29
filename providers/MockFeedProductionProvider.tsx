"use client"

import React, { createContext, useContext, useMemo, useState, ReactNode } from "react"
import { useAuth } from "./AuthProvider"
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
  Agency,
  Employee,
  ThirdParty,
  MachineAssignment,
  FinishedGoodsTransaction,
  INITIAL_MATERIALS,
  INITIAL_MACHINES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_BOMS,
  INITIAL_LINES,
  INITIAL_LEDGER,
  INITIAL_QUALITY_GATES,
  INITIAL_ADDITIONAL_COSTS,
  INITIAL_AGENCIES,
  INITIAL_EMPLOYEES,
  INITIAL_THIRD_PARTIES,
  INITIAL_MACHINE_ASSIGNMENTS,
  INITIAL_FINISHED_GOODS_TRANSACTIONS,
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

  // Org/agency context (from AuthProvider)
  currentAgency: Agency | null

  // Filtered lists by auth context
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

  // New CRUD for multi-tenant
  agencies: Agency[]
  createAgency: (data: Omit<Agency, "id">) => Agency
  updateAgency: (id: string, updates: Partial<Agency>) => void

  employees: Employee[]
  createEmployee: (data: Omit<Employee, "id">) => Employee
  updateEmployee: (id: string, updates: Partial<Employee>) => void

  thirdParties: ThirdParty[]
  createThirdParty: (data: Omit<ThirdParty, "id">) => ThirdParty
  updateThirdParty: (id: string, updates: Partial<ThirdParty>) => void

  machineAssignments: MachineAssignment[]
  assignMachineToOperator: (machineId: string, operatorId: string, agencyId: string) => void
  removeMachineAssignment: (machineId: string) => void

  finishedGoodsTransactions: FinishedGoodsTransaction[]
  recordFinishedGoodsTransaction: (entry: Omit<FinishedGoodsTransaction, "id">) => void
}

const MockFeedContext = createContext<MockContextState | undefined>(undefined)

export function MockFeedProductionProvider({ children }: { children: ReactNode }) {
  const { activeOrg } = useAuth()
  const currentOrg = activeOrg?.org ?? null
  const currentAgency = activeOrg?.agencies[0] ?? null

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

  // New multi-tenant state
  const [agencies, setAgencies] = useState<Agency[]>(INITIAL_AGENCIES)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>(INITIAL_THIRD_PARTIES)
  const [machineAssignments, setMachineAssignments] = useState<MachineAssignment[]>(INITIAL_MACHINE_ASSIGNMENTS)
  const [finishedGoodsTransactions, setFinishedGoodsTransactions] = useState<FinishedGoodsTransaction[]>(INITIAL_FINISHED_GOODS_TRANSACTIONS)

  // ── Filtered data by auth context ──
  const filteredMaterials = useMemo(() => {
    if (!currentOrg) return materials
    return materials.filter(m => m.orgId === currentOrg.id)
  }, [materials, currentOrg])

  const filteredMachines = useMemo(() => {
    if (!currentAgency) return currentOrg ? machines.filter(m => {
      const agency = agencies.find(a => a.id === m.agencyId)
      return agency?.orgId === currentOrg.id
    }) : machines
    return machines.filter(m => m.agencyId === currentAgency.id)
  }, [machines, currentOrg, currentAgency, agencies])

  const filteredProducts = useMemo(() => {
    if (!currentAgency) return currentOrg ? products.filter(p => {
      const agency = agencies.find(a => a.id === p.agencyId)
      return agency?.orgId === currentOrg.id
    }) : products
    return products.filter(p => p.agencyId === currentAgency.id)
  }, [products, currentOrg, currentAgency, agencies])

  const filteredLines = useMemo(() => {
    if (!currentAgency) return currentOrg ? lines.filter(l => {
      const agency = agencies.find(a => a.id === l.agencyId)
      return agency?.orgId === currentOrg.id
    }) : lines
    return lines.filter(l => l.agencyId === currentAgency.id)
  }, [lines, currentOrg, currentAgency, agencies])

  const filteredOrders = useMemo(() => {
    if (!currentAgency) return currentOrg ? orders.filter(o => {
      const agency = agencies.find(a => a.id === o.originAgencyId)
      return agency?.orgId === currentOrg.id
    }) : orders
    return orders.filter(o => o.originAgencyId === currentAgency.id)
  }, [orders, currentOrg, currentAgency, agencies])

  const filteredAgencies = useMemo(() => {
    if (!currentOrg) return agencies
    return agencies.filter(a => a.orgId === currentOrg.id)
  }, [agencies, currentOrg])

  const filteredEmployees = useMemo(() => {
    if (!currentOrg) return employees
    return employees.filter(e => e.orgId === currentOrg.id)
  }, [employees, currentOrg])

  const filteredThirdParties = useMemo(() => {
    if (!currentOrg) return thirdParties
    return thirdParties.filter(tp => tp.orgId === currentOrg.id)
  }, [thirdParties, currentOrg])

  const activeMOs = useMemo(() => {
    return filteredOrders.map(order => {
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
  }, [filteredOrders, products, lines, boms])

  const globalInventory = useMemo(() => {
    return filteredMaterials.map(m => ({
      id: m.id,
      category: m.category === 'raw' ? 'Bulk Solid' : 'Component',
      quantity: m.balanceVolume,
    }))
  }, [filteredMaterials])

  // ── Existing CRUD ──
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
    if (entry.type === "REFILL") {
      setMaterials(prev => prev.map(m => {
        if (m.id === entry.materialId) {
          const currentTotalValue = m.balanceVolume * m.costAvg
          const newTotalValue = entry.totalValue
          const newTotalVolume = m.balanceVolume + entry.quantity
          const newAvgCost = newTotalVolume > 0 ? (currentTotalValue + newTotalValue) / newTotalVolume : m.costAvg
          return { ...m, balanceVolume: newTotalVolume, costAvg: newAvgCost }
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

  const addOrder = (order: ManufacturingOrder) => setOrders(prev => [...prev, order])
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

  // ── New multi-tenant CRUD ──
  const createAgency = (data: Omit<Agency, "id">): Agency => {
    const agency: Agency = { ...data, id: `agence_${Date.now()}` }
    setAgencies(prev => [...prev, agency])
    return agency
  }

  const updateAgency = (id: string, updates: Partial<Agency>) => {
    setAgencies(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const createEmployee = (data: Omit<Employee, "id">): Employee => {
    const emp: Employee = { ...data, id: `emp_${Date.now()}` }
    setEmployees(prev => [...prev, emp])
    return emp
  }

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  const createThirdParty = (data: Omit<ThirdParty, "id">): ThirdParty => {
    const tp: ThirdParty = { ...data, id: `tp_${Date.now()}` }
    setThirdParties(prev => [...prev, tp])
    return tp
  }

  const updateThirdParty = (id: string, updates: Partial<ThirdParty>) => {
    setThirdParties(prev => prev.map(tp => tp.id === id ? { ...tp, ...updates } : tp))
  }

  const assignMachineToOperator = (machineId: string, operatorId: string, agencyId: string) => {
    setMachineAssignments(prev => {
      const existing = prev.findIndex(a => a.machineId === machineId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { machineId, operatorId, agencyId }
        return updated
      }
      return [...prev, { machineId, operatorId, agencyId }]
    })
  }

  const removeMachineAssignment = (machineId: string) => {
    setMachineAssignments(prev => prev.filter(a => a.machineId !== machineId))
  }

  const recordFinishedGoodsTransaction = (entry: Omit<FinishedGoodsTransaction, "id">) => {
    const txn: FinishedGoodsTransaction = { ...entry, id: `fgt_${Date.now()}` }
    setFinishedGoodsTransactions(prev => [txn, ...prev])
  }

  return (
    <MockFeedContext.Provider value={{
      activeSession,
      setActiveSession,
      activeUnit,
      setActiveUnit,

      currentAgency,
      materials: filteredMaterials,
      updateMaterialBalance,
      recordInventoryTransaction,
      addMaterial,
      inventoryLedger,
      machines: filteredMachines,
      updateMachineState,
      addMachine,
      updateMachine,
      qualityGates,
      addQualityGate,
      updateQualityGate,
      products: filteredProducts,
      addProduct,
      updateProduct,
      boms,
      addBOM,
      updateBOM,
      lines: filteredLines,
      addLine,
      updateLine,
      additionalCosts,
      addAdditionalCost,
      updateAdditionalCost,
      orders: filteredOrders,
      addOrder,
      setMOStatus,
      updateMO,
      activeMOs,
      globalInventory,

      agencies: filteredAgencies,
      createAgency,
      updateAgency,
      employees: filteredEmployees,
      createEmployee,
      updateEmployee,
      thirdParties: filteredThirdParties,
      createThirdParty,
      updateThirdParty,
      machineAssignments,
      assignMachineToOperator,
      removeMachineAssignment,
      finishedGoodsTransactions,
      recordFinishedGoodsTransaction,
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
