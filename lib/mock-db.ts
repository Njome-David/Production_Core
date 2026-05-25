// lib/mock-db.ts

export type UserRole = "Manager" | "Operator"

export interface ActiveSession {
  user_id: string
  role: UserRole
  org_id: string
}

// ===== INVENTORY & MATERIALS =====
export interface Material {
  id: string
  sku: string
  name: string
  category: 'raw' | 'component'
  unit: string
  costAvg: number // Current weighted moving average cost
  balanceVolume: number
  threshold: number
  maxValue: number
}

export interface InventoryLedgerEntry {
  id: string
  materialId: string
  timestamp: string
  type: 'REFILL' | 'CONSUMPTION' | 'SCRAP'
  quantity: number
  unitCost: number
  totalValue: number
}

// ===== PRODUCTS & BOMS =====
export interface Product {
  id: string
  name: string
  sku: string
  price: number // Target Selling Price
  assignedLineIds: string[]
}

export interface BOMLine {
  materialId: string
  quantityPerUnit: number
}

export interface BOM {
  id: string
  productId: string
  lines: BOMLine[]
}

// ===== MACHINES & LINES =====
export type MachineState = "IDLE" | "RUNNING" | "WAITING" | "MAINTENANCE"

export interface Machine {
  id: string
  name: string
  description: string
  state: MachineState
  maintenanceCostPerHour: number
  operationRate: number // Batches per hour
  isQualityCheckService: boolean
  type?: string
}

export interface ProductionLine {
  id: string
  name: string
  orgId: string
  machineIds: string[]
  productIds: string[]
}

// ===== MANUFACTURING ORDERS =====
export type MOStatus = "PROGRAMMED" | "PENDING" | "IN_PROGRESS" | "WAITING" | "COMPLETED"

export interface ManufacturingOrder {
  id: string
  productId: string
  targetQty: number
  status: MOStatus
  lineId: string
  machineId?: string
  programmedDate?: string // ISO date string if PROGRAMMED
  startedAt?: string // ISO timestamp
  completedAt?: string // ISO timestamp
  actualMaterialConsumed?: Record<string, number>
  scrapLogged?: number
  qcStatus?: "UNDONE" | "DONE"
  passedQCBatches?: number
  comments?: { timestamp: string, text: string }[]
}

// ===== SEED DATA =====
export const INITIAL_MATERIALS: Material[] = [
  { id: "mat_1", sku: "OAK-LUMBER-01", name: "Oak Lumber Timber", category: "raw", unit: "Meters", costAvg: 12.50, balanceVolume: 1450, threshold: 2000, maxValue: 5000 },
  { id: "mat_2", sku: "POLY-BOND-02", name: "Industrial Poly-Bond", category: "component", unit: "Liters", costAvg: 45.10, balanceVolume: 14.50, threshold: 50, maxValue: 100 },
  { id: "mat_3", sku: "STEEL-FAST-03", name: "Steel Fastener Pegs", category: "component", unit: "Units", costAvg: 0.12, balanceVolume: 120, threshold: 500, maxValue: 2000 },
]

export const INITIAL_PRODUCTS: Product[] = [
  { id: "prod_1", name: "Premium Oak Table Top", sku: "SKU-OAK-01", price: 450.00, assignedLineIds: ["line_1", "line_2"] },
  { id: "prod_2", name: "Minimalist Pine Chair", sku: "SKU-PINE-02", price: 200.00, assignedLineIds: ["line_2"] },
]

export const INITIAL_BOMS: BOM[] = [
  {
    id: "bom_1",
    productId: "prod_1",
    lines: [
      { materialId: "mat_1", quantityPerUnit: 2.50 },
      { materialId: "mat_2", quantityPerUnit: 0.40 },
    ]
  }
]

export const INITIAL_MACHINES: Machine[] = [
  { id: "mac_cnc_1", name: "CNC Router 1", description: "High-precision 5-axis CNC", state: "IDLE", maintenanceCostPerHour: 120.00, operationRate: 5, isQualityCheckService: false, type: "MIXER" },
  { id: "mac_saw_1", name: "Saw Bench Alpha", description: "Industrial table saw", state: "IDLE", maintenanceCostPerHour: 80.00, operationRate: 8, isQualityCheckService: false, type: "PELLETIZER" },
  { id: "mac_spray_1", name: "Paint Spray Booth", description: "Automated coating system", state: "IDLE", maintenanceCostPerHour: 150.00, operationRate: 4, isQualityCheckService: false, type: "PACKAGER" },
  { id: "mac_qc_1", name: "Optical QC Scanner", description: "Vision-based defect detection", state: "IDLE", maintenanceCostPerHour: 50.00, operationRate: 10, isQualityCheckService: true, type: "MIXER" },
]

export const INITIAL_LINES: ProductionLine[] = [
  {
    id: "line_1",
    name: "Heavy Machining Track 01",
    orgId: "org_alpha_feed", // or any default org
    machineIds: ["mac_saw_1", "mac_cnc_1"],
    productIds: ["prod_1"]
  },
  {
    id: "line_2",
    name: "Custom Finishing Track",
    orgId: "org_alpha_feed",
    machineIds: ["mac_cnc_1", "mac_spray_1"],
    productIds: ["prod_1", "prod_2"]
  }
]

export const INITIAL_ORDERS: ManufacturingOrder[] = [
  { id: "mo_101", productId: "prod_1", targetQty: 100, status: "COMPLETED", lineId: "line_1", startedAt: "2026-05-01T08:00:00Z", completedAt: "2026-05-01T16:00:00Z", qcStatus: "DONE", passedQCBatches: 100 },
  { id: "mo_102", productId: "prod_1", targetQty: 50, status: "IN_PROGRESS", lineId: "line_1", machineId: "mac_saw_1", startedAt: new Date(Date.now() - 3600000).toISOString(), qcStatus: "UNDONE" },
  { id: "mo_104", productId: "prod_1", targetQty: 250, status: "PENDING", lineId: "line_1", qcStatus: "UNDONE" }, // Shortage pending
]

export const INITIAL_LEDGER: InventoryLedgerEntry[] = [
  {
    id: "ledg_1",
    materialId: "mat_1",
    timestamp: "2026-04-15T10:00:00Z",
    type: "REFILL",
    quantity: 1000,
    unitCost: 12.00,
    totalValue: 12000.00
  },
  {
    id: "ledg_2",
    materialId: "mat_1",
    timestamp: "2026-04-20T09:00:00Z",
    type: "REFILL",
    quantity: 450,
    unitCost: 13.61, // Brought average up
    totalValue: 6124.50
  }
]
