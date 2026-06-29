// lib/types.ts

// ===== SESSION (existing, backward compat) =====
export type SessionRole = "Manager" | "Operator"

export interface ActiveSession {
  user_id: string
  role: SessionRole
  org_id: string
  active_station?: string
  station_type?: "machine" | "gate"
}

// ===== NEW APP ROLES =====
export type AppRole = "owner" | "manager" | "operator"

// ===== USER & ORGANIZATION =====
export interface User {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  jobTitle?: string
  status: "active" | "inactive"
}

export interface Organization {
  id: string
  name: string
  industry: string
  country: string
  currency: string
  ownerId: string
  subscriptionPlan: "starter" | "professional" | "enterprise"
  subscriptionStatus: "active" | "expired" | "cancelled"
  createdAt: string
}

export interface Agency {
  id: string
  orgId: string
  name: string
  managerId?: string
  isFabricationPoint: boolean
  isSalesPoint: boolean
  address?: string
  city?: string
  phone?: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Employee {
  id: string
  userId: string
  orgId: string
  agencyId: string
  role: string // AppRole | custom role id
  jobTitle: string
  phone?: string
  status: "active" | "inactive"
  startedAt: string
}

// ===== THIRD PARTIES =====
export interface ThirdParty {
  id: string
  orgId: string
  name: string
  type: "supplier" | "client"
  email?: string
  phone?: string
  address?: string
  website?: string
  associatedMaterials?: string[]
  associatedProducts?: string[]
  notes?: string
}

// ===== PERMISSIONS & ROLES =====
export interface Permission {
  id: string
  key: string
  label: string
  description: string
  category: string
}

export interface CustomRole {
  id: string
  orgId: string
  name: string
  permissions: string[]
  isDefault: boolean
}

// ===== SUBSCRIPTION =====
export interface Subscription {
  id: string
  orgId: string
  plan: "starter" | "professional" | "enterprise"
  billing: "monthly" | "annual"
  startDate: string
  endDate: string
  status: "active" | "expired" | "cancelled"
  paymentMethod?: string
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
  category: "raw" | "component"
  unit: string
  costAvg: number
  balanceVolume: number
  threshold: number
  maxValue: number
  orgId: string
}

export interface InventoryLedgerEntry {
  id: string
  materialId: string
  timestamp: string
  type: "REFILL" | "CONSUMPTION" | "SCRAP"
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
  price: number
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
  agencyId: string
}

export interface BOMLine {
  materialId: string
  quantityPerUnit: number
}

export interface BOM {
  id: string
  productId: string
  unit: "kg" | "pct"
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
  operationRate: number
  type?: string
  powerRating?: number
  technicalSpecs?: string
  agencyId: string
}

export interface QualityGate {
  id: string
  name: string
  description: string
  type: string
  inspectionType: string
  serviceProvider: string
  opCostPerHour: number
  operationRate: number
}

export interface ProductionLine {
  id: string
  name: string
  agencyId: string
  machineIds: string[]
  productIds: string[]
}

// ===== MACHINE ASSIGNMENTS =====
export interface MachineAssignment {
  machineId: string
  operatorId: string
  agencyId: string
}

// ===== FINISHED GOODS =====
export interface FinishedGoodsTransaction {
  id: string
  productId: string
  agencyId: string
  quantity: number
  type: "production" | "sale" | "return"
  timestamp: string
  referenceOrderId?: string
  buyerId?: string
  unitPrice?: number
  totalValue?: number
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
  programmedDate?: string
  startedAt?: string
  completedAt?: string
  actualMaterialConsumed?: Record<string, number>
  actualAdditionalCosts?: Record<string, number>
  scrapLogged?: number
  qcStatus?: "UNDONE" | "DONE"
  passedQCBatches?: number
  comments?: { timestamp: string; text: string }[]
  currentSequence?: number
  originAgencyId: string
}
