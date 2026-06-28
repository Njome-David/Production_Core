// lib/mock-db.ts

export type UserRole = "Manager" | "Operator"

export interface ActiveSession {
  user_id: string
  role: UserRole
  org_id: string
  active_station?: string
  station_type?: "machine" | "gate"
}

// ===== ADDITIONAL COSTS =====
export interface AdditionalCost {
  id: string
  name: string
  estimatedValue: number
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
export interface QCParameter {
  id: string
  name: string
  minValue: number
  maxValue: number
  unit: string
  tolerance: number
}

export interface RoutingStep {
  machineId: string
  sequence: number
  usagePercentage: number
  timeInHours: number
}

export interface Product {
  id: string
  name: string
  sku: string
  price: number // Target Selling Price
  targetMargin?: number
  finalMass?: number
  measureUnit?: string
  additionalCosts?: { costId: string; provisionalValue: number }[]
  imageUrl?: string
  notice?: string
  assignedLineIds: string[]
  qcParameters?: QCParameter[]
  routing?: RoutingStep[]
  qualityGates?: { sequenceAfter: number; gateId: string; timeInHours?: number }[]
}

export interface BOMLine {
  materialId: string
  quantityPerUnit: number
}

export interface BOM {
  id: string
  productId: string
  unit: 'kg' | 'pct'
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
  opCostPerHour: number
  operationRate: number // Batches per hour
  type?: string
  powerRating?: number // in kW
  technicalSpecs?: string
}

export interface QualityGate {
  id: string
  name: string
  description: string
  type: string
  inspectionType: string
  serviceProvider: string
  opCostPerHour: number
  operationRate: number // Batches per hour
}

export interface ProductionLine {
  id: string
  name: string
  orgId: string
  machineIds: string[]
  productIds: string[]
}

// ===== MANUFACTURING ORDERS =====
export type MOStatus = "PROGRAMMED" | "PENDING" | "IN_PROGRESS" | "WAITING" | "COMPLETED" | "FINAL"

export interface ManufacturingOrder {
  id: string
  productId: string
  targetQty: number
  status: MOStatus
  lineId: string
  machineId?: string
  currentGateId?: string
  programmedDate?: string // ISO date string if PROGRAMMED
  startedAt?: string // ISO timestamp
  completedAt?: string // ISO timestamp
  actualMaterialConsumed?: Record<string, number>
  actualAdditionalCosts?: Record<string, number>
  scrapLogged?: number
  qcStatus?: "UNDONE" | "DONE"
  passedQCBatches?: number
  comments?: { timestamp: string, text: string }[]
  currentSequence?: number
}

// ===== SEED DATA =====
export const INITIAL_ADDITIONAL_COSTS: AdditionalCost[] = [
  { id: "add_cost_1", name: "Frais de Transport", estimatedValue: 15.0 },
  { id: "add_cost_2", name: "Frais d'Emballage Suppl.", estimatedValue: 5.0 },
  { id: "add_cost_3", name: "Assurance", estimatedValue: 10.0 }
]

export const INITIAL_MATERIALS: Material[] = [
  { id: "mat_1", sku: "OAK-LUMBER-01", name: "Oak Lumber Timber", category: "raw", unit: "Meters", costAvg: 12.50, balanceVolume: 1450, threshold: 2000, maxValue: 5000 },
  { id: "mat_2", sku: "POLY-BOND-02", name: "Industrial Poly-Bond", category: "component", unit: "Liters", costAvg: 45.10, balanceVolume: 14.50, threshold: 50, maxValue: 100 },
  { id: "mat_3", sku: "STEEL-FAST-03", name: "Steel Fastener Pegs", category: "component", unit: "Units", costAvg: 0.12, balanceVolume: 120, threshold: 500, maxValue: 2000 },
  // Provenderie Materials
  { id: "mat_prov_1", sku: "MAIS-01", name: "Maïs Grain", category: "raw", unit: "Kg", costAvg: 150.00, balanceVolume: 5000, threshold: 1000, maxValue: 10000 },
  { id: "mat_prov_2", sku: "SOJA-01", name: "Tourteau de Soja", category: "raw", unit: "Kg", costAvg: 300.00, balanceVolume: 2000, threshold: 500, maxValue: 5000 },
  { id: "mat_prov_3", sku: "SON-01", name: "Son de Blé", category: "raw", unit: "Kg", costAvg: 100.00, balanceVolume: 1500, threshold: 300, maxValue: 3000 },
  { id: "mat_prov_4", sku: "ARACH-01", name: "Tourteau d'Arachide", category: "raw", unit: "Kg", costAvg: 250.00, balanceVolume: 800, threshold: 200, maxValue: 2000 },
]

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: "prod_1", 
    name: "Premium Oak Table Top", 
    sku: "SKU-OAK-01", 
    price: 450.00, 
    targetMargin: 30,
    finalMass: 15,
    measureUnit: "units",
    additionalCosts: [{ costId: "add_cost_1", provisionalValue: 15.0 }, { costId: "add_cost_3", provisionalValue: 10.0 }],
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
    notice: "Handle with care. Store in dry environment. Maximum stacking height: 4 units.",
    assignedLineIds: ["line_1"],
    qcParameters: [
      { id: "qc_1", name: "Moisture Content", minValue: 6, maxValue: 8, unit: "%", tolerance: 0.5 },
      { id: "qc_2", name: "Surface Smoothness", minValue: 90, maxValue: 100, unit: "GU", tolerance: 2 }
    ],
    routing: [
      { machineId: "mac_saw_1", sequence: 1, usagePercentage: 100, timeInHours: 2 },
      { machineId: "mac_cnc_1", sequence: 2, usagePercentage: 100, timeInHours: 4 }
    ]
  },
  { 
    id: "prod_2", 
    name: "Minimalist Pine Chair", 
    sku: "SKU-PINE-02", 
    price: 200.00, 
    targetMargin: 25,
    finalMass: 5,
    measureUnit: "units",
    additionalCosts: [{ costId: "add_cost_2", provisionalValue: 5.0 }],
    imageUrl: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=300&fit=crop",
    notice: "Assembly required. Check all joints before use.",
    assignedLineIds: ["line_2"],
    qcParameters: [],
    routing: [
      { machineId: "mac_cnc_1", sequence: 1, usagePercentage: 100, timeInHours: 1 },
      { machineId: "mac_spray_1", sequence: 2, usagePercentage: 100, timeInHours: 2.5 }
    ]
  },
  // Provenderie Products
  {
    id: "prod_bottleneck",
    name: "Flat Pack Shelf Kit",
    sku: "SKU-BN-01",
    price: 85.00,
    targetMargin: 28,
    finalMass: 3.5,
    measureUnit: "kits",
    additionalCosts: [],
    imageUrl: "https://images.unsplash.com/photo-1597072689227-88922c6e7f66?w=400&h=300&fit=crop",
    notice: "Assembly required. Contains small parts. Max load: 15kg per shelf.",
    assignedLineIds: ["line_2"],
    qcParameters: [
      { id: "qc_bn_1", name: "Edge Finish", minValue: 0, maxValue: 0.5, unit: "mm", tolerance: 0.1 }
    ],
    routing: [
      { machineId: "mac_saw_1", sequence: 1, usagePercentage: 100, timeInHours: 0.3 },
      { machineId: "mac_cnc_1", sequence: 2, usagePercentage: 100, timeInHours: 0.5 },
      { machineId: "mac_spray_1", sequence: 3, usagePercentage: 100, timeInHours: 0.4 }
    ]
  },
  {
    id: "prod_prov_1",
    name: "Provende Volaille Démarrage",
    sku: "PRV-VOL-DEM",
    price: 350.00, // FCFA per kg
    targetMargin: 20,
    finalMass: 50, // 50kg bag
    measureUnit: "Kg",
    additionalCosts: [{ costId: "add_cost_1", provisionalValue: 20.0 }],
    imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400&h=300&fit=crop",
    notice: "Usage: Complete feed for chicks 0-8 weeks. Store in cool, dry place. Do not feed to adult poultry.",
    assignedLineIds: ["line_prov"],
    qcParameters: [
      { id: "qc_prov_1", name: "Taux de Protéines", minValue: 21, maxValue: 23, unit: "%", tolerance: 0.5 }
    ],
    qualityGates: [
      { sequenceAfter: 2, gateId: "gate_prov_qc", timeInHours: 0.25 }
    ],
    routing: [
      { machineId: "mac_prov_1", sequence: 1, usagePercentage: 100, timeInHours: 0.5 }, // Broyeur
      { machineId: "mac_prov_2", sequence: 2, usagePercentage: 100, timeInHours: 1 },   // Mélangeur
      { machineId: "mac_prov_3", sequence: 3, usagePercentage: 100, timeInHours: 0.5 }  // Ensacheuse
    ]
  }
]

export const INITIAL_BOMS: BOM[] = [
  {
    id: "bom_1",
    productId: "prod_1",
    unit: "kg",
    lines: [
      { materialId: "mat_1", quantityPerUnit: 2.50 },
      { materialId: "mat_2", quantityPerUnit: 0.40 },
    ]
  },
  {
    id: "bom_bn_1",
    productId: "prod_bottleneck",
    unit: "kg",
    lines: [
      { materialId: "mat_1", quantityPerUnit: 1.2 },
      { materialId: "mat_2", quantityPerUnit: 0.15 },
      { materialId: "mat_3", quantityPerUnit: 8 },
    ]
  },
  {
    id: "bom_prov_1",
    productId: "prod_prov_1",
    unit: "pct",
    lines: [
      { materialId: "mat_prov_1", quantityPerUnit: 50 }, // 50% Maïs
      { materialId: "mat_prov_2", quantityPerUnit: 21 }, // 21% Soja
      { materialId: "mat_prov_3", quantityPerUnit: 14 }, // 14% Son
      { materialId: "mat_prov_4", quantityPerUnit: 15 }, // 15% Arachide
    ]
  }
]

export const INITIAL_MACHINES: Machine[] = [
  { id: "mac_cnc_1", name: "CNC Router 1", description: "High-precision 5-axis CNC", state: "IDLE", maintenanceCostPerHour: 120.00, opCostPerHour: 80, operationRate: 5, type: "MIXER", powerRating: 15, technicalSpecs: "Spindle speed: 24000 RPM" },
  { id: "mac_saw_1", name: "Saw Bench Alpha", description: "Industrial table saw", state: "IDLE", maintenanceCostPerHour: 80.00, opCostPerHour: 45, operationRate: 8, type: "PELLETIZER", powerRating: 5, technicalSpecs: "Blade diameter: 400mm" },
  { id: "mac_spray_1", name: "Paint Spray Booth", description: "Automated coating system", state: "IDLE", maintenanceCostPerHour: 150.00, opCostPerHour: 60, operationRate: 4, type: "PACKAGER", powerRating: 12, technicalSpecs: "Airflow: 10000 m3/h" },
  // Provenderie Machines
  { id: "mac_prov_1", name: "Broyeur à Marteaux", description: "Réduit les grains en farine", state: "IDLE", maintenanceCostPerHour: 200.00, opCostPerHour: 5000, operationRate: 20, type: "PELLETIZER", powerRating: 45, technicalSpecs: "Capacité: 5 T/h" },
  { id: "mac_prov_2", name: "Mélangeur Horizontal", description: "Homogénéise les farines", state: "IDLE", maintenanceCostPerHour: 150.00, opCostPerHour: 3000, operationRate: 15, type: "MIXER", powerRating: 30, technicalSpecs: "Capacité: 2 T/h" },
  { id: "mac_prov_3", name: "Ensacheuse Industrielle", description: "Conditionnement en sacs de 50kg", state: "IDLE", maintenanceCostPerHour: 80.00, opCostPerHour: 1500, operationRate: 30, type: "PACKAGER", powerRating: 5, technicalSpecs: "Vitesse: 600 sacs/h" },
]

export const INITIAL_QUALITY_GATES: QualityGate[] = [
  { id: "gate_qc_1", name: "Optical QC Scanner", description: "Vision-based defect detection", type: "VISUAL", inspectionType: "Automated Visual Inspection", serviceProvider: "Internal QA", opCostPerHour: 150, operationRate: 30 },
  { id: "gate_prov_qc", name: "Laboratoire Contrôle Qualité", description: "Vérification des taux protéiques", type: "CHEMICAL", inspectionType: "Analyse Chimique", serviceProvider: "Labo Interne", opCostPerHour: 250, operationRate: 10 }
]

export const INITIAL_LINES: ProductionLine[] = [
  {
    id: "line_1",
    name: "Heavy Machining Track 01",
    orgId: "org_alpha_feed",
    machineIds: ["mac_saw_1", "mac_cnc_1"],
    productIds: ["prod_1"]
  },
  {
    id: "line_2",
    name: "Custom Finishing Track",
    orgId: "org_alpha_feed",
    machineIds: ["mac_cnc_1", "mac_spray_1"],
    productIds: ["prod_1", "prod_2", "prod_bottleneck"]
  },
  {
    id: "line_prov",
    name: "Ligne Provenderie Principale",
    orgId: "org_alpha_feed",
    machineIds: ["mac_prov_1", "mac_prov_2", "mac_prov_3"],
    productIds: ["prod_prov_1"]
  }
]

export const INITIAL_ORDERS: ManufacturingOrder[] = [
  { id: "mo_101", productId: "prod_1", targetQty: 100, status: "FINAL", lineId: "line_1", startedAt: "2026-05-01T08:00:00Z", completedAt: "2026-05-01T16:00:00Z", qcStatus: "DONE", passedQCBatches: 100, currentSequence: 2, actualAdditionalCosts: { "add_cost_1": 1500, "add_cost_3": 1000 } },
  { id: "mo_102", productId: "prod_1", targetQty: 50, status: "IN_PROGRESS", lineId: "line_1", machineId: "mac_saw_1", startedAt: new Date(Date.now() - 3600000).toISOString(), qcStatus: "UNDONE", currentSequence: 1 },
  { id: "mo_104", productId: "prod_1", targetQty: 250, status: "PENDING", lineId: "line_1", qcStatus: "UNDONE", currentSequence: 1 },
  // Bottleneck Orders (all use mac_cnc_1 to create contention)
  { id: "mo_bn_1", productId: "prod_bottleneck", targetQty: 50, status: "FINAL", lineId: "line_2", machineId: "mac_cnc_1", startedAt: new Date(Date.now() - 36000000).toISOString(), completedAt: new Date(Date.now() - 28800000).toISOString(), qcStatus: "DONE", passedQCBatches: 50, currentSequence: 2, actualAdditionalCosts: {} },
  { id: "mo_bn_2", productId: "prod_bottleneck", targetQty: 30, status: "IN_PROGRESS", lineId: "line_2", machineId: "mac_cnc_1", startedAt: new Date(Date.now() - 3600000).toISOString(), qcStatus: "UNDONE", currentSequence: 2 },
  { id: "mo_bn_3", productId: "prod_bottleneck", targetQty: 60, status: "PENDING", lineId: "line_2", machineId: "mac_cnc_1", qcStatus: "UNDONE", currentSequence: 2 },
  { id: "mo_bn_4", productId: "prod_bottleneck", targetQty: 40, status: "PENDING", lineId: "line_2", machineId: "mac_saw_1", qcStatus: "UNDONE", currentSequence: 1 },
  // Provenderie Orders
  { id: "mo_prov_1", productId: "prod_prov_1", targetQty: 200, status: "IN_PROGRESS", lineId: "line_prov", machineId: "mac_prov_1", startedAt: new Date(Date.now() - 7200000).toISOString(), qcStatus: "UNDONE", currentSequence: 1 },
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
