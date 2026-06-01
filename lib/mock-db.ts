// lib/mock-db.ts

export type UserRole = "Manager" | "Operator" | "Expert Produit"

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
  forecastConsumption?: number
  note?: string
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
  price: number // Current selling price kept for historical orders and reporting.
  targetMarginPercent: number
  laborCostPerBatch: number
  fixedLaunchCost: number
  assignedLineIds: string[]
  profileLocked?: boolean
  aiEnabled?: boolean
  qcRequired?: boolean
  qualityControls?: string[]
}

export interface BOMLine {
  materialId: string
  quantityPerUnit: number
  note?: string
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
  hourlyCost: number
  depreciationCostPerHour: number
  netBookValue: number
  availabilityPercent: number
  utilizationPercent: number
  priority: "LOW" | "MEDIUM" | "HIGH"
  scheduleWindow?: string
  operationRate: number // Batches per hour
  isQualityCheckService: boolean
  type?: string
  trackingMetrics?: string[]
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
  { id: "mat_1", sku: "OAK-LUMBER-01", name: "Oak Lumber Timber", category: "raw", unit: "Meters", costAvg: 12.50, balanceVolume: 1450, threshold: 2000, maxValue: 5000, forecastConsumption: 420, note: "Supplier price valid until next purchase cycle." },
  { id: "mat_2", sku: "POLY-BOND-02", name: "Industrial Poly-Bond", category: "component", unit: "Liters", costAvg: 45.10, balanceVolume: 14.50, threshold: 50, maxValue: 100, forecastConsumption: 18, note: "Check humidity before launch." },
  { id: "mat_3", sku: "STEEL-FAST-03", name: "Steel Fastener Pegs", category: "component", unit: "Units", costAvg: 0.12, balanceVolume: 120, threshold: 500, maxValue: 2000, forecastConsumption: 250, note: "Use reinforced packaging." },
]

export const INITIAL_PRODUCTS: Product[] = [
  { id: "prod_1", name: "Premium Oak Table Top", sku: "SKU-OAK-01", price: 450.00, targetMarginPercent: 28, laborCostPerBatch: 65, fixedLaunchCost: 5000, assignedLineIds: ["line_1", "line_2"], profileLocked: true, aiEnabled: true, qcRequired: true, qualityControls: ["Moisture within tolerance", "Surface defect scan", "Weight variance <= 2%"] },
  { id: "prod_2", name: "Minimalist Pine Chair", sku: "SKU-PINE-02", price: 200.00, targetMarginPercent: 24, laborCostPerBatch: 40, fixedLaunchCost: 3500, assignedLineIds: ["line_2"], profileLocked: false, aiEnabled: false, qcRequired: true, qualityControls: ["Joint strength check", "Packaging scan"] },
]

export const INITIAL_BOMS: BOM[] = [
  {
    id: "bom_1",
    productId: "prod_1",
    lines: [
      { materialId: "mat_1", quantityPerUnit: 2.50 },
      { materialId: "mat_2", quantityPerUnit: 0.40, note: "Apply after sanding to reduce rework." },
    ]
  }
]

export const INITIAL_MACHINES: Machine[] = [
  { id: "mac_cnc_1", name: "CNC Router 1", description: "High-precision 5-axis CNC", state: "IDLE", maintenanceCostPerHour: 120.00, hourlyCost: 220, depreciationCostPerHour: 35, netBookValue: 1750000, availabilityPercent: 92, utilizationPercent: 68, priority: "HIGH", scheduleWindow: "06:00-18:00", operationRate: 5, isQualityCheckService: false, type: "MIXER", trackingMetrics: ["OEE", "Spindle hours", "Scrap rate"] },
  { id: "mac_saw_1", name: "Saw Bench Alpha", description: "Industrial table saw", state: "IDLE", maintenanceCostPerHour: 80.00, hourlyCost: 160, depreciationCostPerHour: 22, netBookValue: 820000, availabilityPercent: 88, utilizationPercent: 74, priority: "MEDIUM", scheduleWindow: "07:00-17:00", operationRate: 8, isQualityCheckService: false, type: "PELLETIZER", trackingMetrics: ["OEE", "Blade wear", "Downtime"] },
  { id: "mac_spray_1", name: "Paint Spray Booth", description: "Automated coating system", state: "IDLE", maintenanceCostPerHour: 150.00, hourlyCost: 260, depreciationCostPerHour: 45, netBookValue: 1320000, availabilityPercent: 81, utilizationPercent: 53, priority: "HIGH", scheduleWindow: "08:00-16:00", operationRate: 4, isQualityCheckService: false, type: "PACKAGER", trackingMetrics: ["Coverage", "VOC level", "Rework rate"] },
  { id: "mac_qc_1", name: "Optical QC Scanner", description: "Vision-based defect detection", state: "IDLE", maintenanceCostPerHour: 50.00, hourlyCost: 95, depreciationCostPerHour: 18, netBookValue: 560000, availabilityPercent: 96, utilizationPercent: 38, priority: "LOW", scheduleWindow: "Always available", operationRate: 10, isQualityCheckService: true, type: "MIXER", trackingMetrics: ["Defect capture", "False positives", "Scan queue"] },
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
