// lib/mock-db.ts — Seed data + backward-compat re-exports

export * from "./types"

// ===== SEED USERS =====
import { ALL_PERMISSIONS, DEFAULT_ROLES } from "./permissions"
import type {
  User, Organization, Agency, Employee, ThirdParty, Permission, CustomRole,
  Subscription, MachineAssignment, FinishedGoodsTransaction,
  AdditionalCost, Material, InventoryLedgerEntry, Product, BOMLine, BOM,
  QCParameter, RoutingStep, Machine, MachineState, QualityGate, ProductionLine,
  ManufacturingOrder, MOStatus,
} from "./types"

export const INITIAL_USERS: User[] = [
  { id: "usr_dvd_99", name: "David Vance", email: "david@alpha-feed.com", password: "password", phone: "+237 677 123 456", jobTitle: "CEO & Founder", status: "active" },
  { id: "usr_mkg_01", name: "Marie Kamga", email: "marie@alpha-feed.com", password: "password123", phone: "+237 699 789 012", jobTitle: "Responsable d'Agence", status: "active" },
  { id: "usr_pbl_01", name: "Paul Biya", email: "paul@alpha-feed.com", password: "password123", phone: "+237 677 345 678", jobTitle: "Responsable d'Agence", status: "active" },
  { id: "usr_jnk_01", name: "Jean Nkwi", email: "jean@alpha-feed.com", password: "password123", phone: "+237 655 901 234", jobTitle: "Opérateur de Production", status: "active" },
  { id: "usr_fat_01", name: "Fatima Ahmadou", email: "fatima@alpha-feed.com", password: "password123", phone: "+237 677 567 890", jobTitle: "Opératrice de Production", status: "active" },
]

export const INITIAL_ORGANIZATIONS: Organization[] = [
  { id: "org_alpha_feed", name: "Alpha Feed & Manufacturing", industry: "Agroalimentaire & Transformation", country: "Cameroun", currency: "XAF", ownerId: "usr_dvd_99", subscriptionPlan: "professional", subscriptionStatus: "active", createdAt: "2025-01-15T08:00:00Z" },
]

export const INITIAL_AGENCIES: Agency[] = [
  { id: "agence_main", orgId: "org_alpha_feed", name: "Agence de Yaoundé", managerId: "usr_mkg_01", isFabricationPoint: true, isSalesPoint: true, address: "Boulevard de la Réunification", city: "Yaoundé", phone: "+237 677 123 001", status: "active", createdAt: "2025-01-15T09:00:00Z" },
  { id: "agence_fab", orgId: "org_alpha_feed", name: "Unité de Production de Douala", managerId: "usr_pbl_01", isFabricationPoint: true, isSalesPoint: false, address: "Zone Industrielle de Bassa", city: "Douala", phone: "+237 677 123 002", status: "active", createdAt: "2025-03-01T08:00:00Z" },
  { id: "agence_vente", orgId: "org_alpha_feed", name: "Point de Vente Mfoundi", managerId: undefined, isFabricationPoint: false, isSalesPoint: true, address: "Marché Mfoundi", city: "Yaoundé", phone: "+237 677 123 003", status: "active", createdAt: "2025-06-01T08:00:00Z" },
]

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: "emp_dvd_01", userId: "usr_dvd_99", orgId: "org_alpha_feed", agencyId: "agence_main", role: "owner", jobTitle: "CEO & Fondateur", phone: "+237 677 123 456", status: "active", startedAt: "2025-01-15T08:00:00Z" },
  { id: "emp_mkg_01", userId: "usr_mkg_01", orgId: "org_alpha_feed", agencyId: "agence_main", role: "manager", jobTitle: "Responsable d'Agence", phone: "+237 699 789 012", status: "active", startedAt: "2025-01-15T08:00:00Z" },
  { id: "emp_pbl_01", userId: "usr_pbl_01", orgId: "org_alpha_feed", agencyId: "agence_fab", role: "manager", jobTitle: "Responsable d'Agence", phone: "+237 677 345 678", status: "active", startedAt: "2025-03-01T08:00:00Z" },
  { id: "emp_jnk_01", userId: "usr_jnk_01", orgId: "org_alpha_feed", agencyId: "agence_main", role: "operator", jobTitle: "Opérateur de Production", phone: "+237 655 901 234", status: "active", startedAt: "2025-02-01T08:00:00Z" },
  { id: "emp_fat_01", userId: "usr_fat_01", orgId: "org_alpha_feed", agencyId: "agence_fab", role: "operator", jobTitle: "Opératrice de Production", phone: "+237 677 567 890", status: "active", startedAt: "2025-03-15T08:00:00Z" },
]

export const INITIAL_PERMISSIONS: Permission[] = ALL_PERMISSIONS

export const INITIAL_CUSTOM_ROLES: CustomRole[] = [
  { id: "role_manager", orgId: "org_alpha_feed", ...DEFAULT_ROLES[0] },
  { id: "role_operator", orgId: "org_alpha_feed", ...DEFAULT_ROLES[1] },
  { id: "role_custom_1", orgId: "org_alpha_feed", name: "Superviseur", permissions: ["product:read", "employee:read", "stock:read_raw", "stock:read_finished", "machine:read", "orders:read", "orders:create", "statistics:view"], isDefault: false },
]

export const INITIAL_THIRD_PARTIES: ThirdParty[] = [
  { id: "tp_sup_1", orgId: "org_alpha_feed", name: "Bois et Matériaux SARL", type: "supplier", email: "contact@boismateriaux.cm", phone: "+237 677 111 111", address: "Douala, Zone Indusrielle", associatedMaterials: ["mat_1", "mat_2", "mat_3"] },
  { id: "tp_sup_2", orgId: "org_alpha_feed", name: "Agri-Appro Cameroun", type: "supplier", email: "ventes@agriappro.cm", phone: "+237 677 222 222", address: "Yaoundé, Mvog-Mbi", associatedMaterials: ["mat_prov_1", "mat_prov_2", "mat_prov_3", "mat_prov_4"] },
  { id: "tp_cli_1", orgId: "org_alpha_feed", name: "Mobilier Urbain SA", type: "client", email: "achats@mobilierurbain.cm", phone: "+237 677 333 333", address: "Yaoundé, Bastos", associatedProducts: ["prod_1", "prod_2", "prod_bottleneck"] },
  { id: "tp_cli_2", orgId: "org_alpha_feed", name: "Ferme Avicole du Sud", type: "client", email: "info@fermeavicole.cm", phone: "+237 677 444 444", address: "Ebolowa, Centre-Ville", associatedProducts: ["prod_prov_1"] },
]

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: "sub_org_1", orgId: "org_alpha_feed", plan: "professional", billing: "annual", startDate: "2025-01-15T08:00:00Z", endDate: "2026-01-15T08:00:00Z", status: "active", paymentMethod: "•••• 4242" },
]

export const INITIAL_MACHINE_ASSIGNMENTS: MachineAssignment[] = [
  { machineId: "mac_cnc_1", operatorId: "usr_jnk_01", agencyId: "agence_main" },
  { machineId: "mac_saw_1", operatorId: "usr_jnk_01", agencyId: "agence_main" },
  { machineId: "mac_prov_1", operatorId: "usr_fat_01", agencyId: "agence_fab" },
  { machineId: "mac_prov_2", operatorId: "usr_fat_01", agencyId: "agence_fab" },
]

export const INITIAL_FINISHED_GOODS_TRANSACTIONS: FinishedGoodsTransaction[] = [
  { id: "fgt_1", productId: "prod_1", agencyId: "agence_main", quantity: 100, type: "production", timestamp: "2026-05-01T16:00:00Z", referenceOrderId: "mo_101", unitPrice: 450, totalValue: 45000 },
  { id: "fgt_2", productId: "prod_prov_1", agencyId: "agence_fab", quantity: 200, type: "production", timestamp: "2026-05-02T14:00:00Z", referenceOrderId: "mo_prov_1", unitPrice: 350, totalValue: 70000 },
  { id: "fgt_3", productId: "prod_bottleneck", agencyId: "agence_main", quantity: 50, type: "sale", timestamp: "2026-05-03T10:00:00Z", buyerId: "tp_cli_1", unitPrice: 85, totalValue: 4250 },
]

// ===== EXISTING SEED DATA (preserved, with new fields) =====

export const INITIAL_ADDITIONAL_COSTS: AdditionalCost[] = [
  { id: "add_cost_1", name: "Frais de Transport", estimatedValue: 15.0 },
  { id: "add_cost_2", name: "Frais d'Emballage Suppl.", estimatedValue: 5.0 },
  { id: "add_cost_3", name: "Assurance", estimatedValue: 10.0 },
]

export const INITIAL_MATERIALS: Material[] = [
  { id: "mat_1", sku: "OAK-LUMBER-01", name: "Oak Lumber Timber", category: "raw", unit: "Meters", costAvg: 12.50, balanceVolume: 1450, threshold: 2000, maxValue: 5000, orgId: "org_alpha_feed" },
  { id: "mat_2", sku: "POLY-BOND-02", name: "Industrial Poly-Bond", category: "component", unit: "Liters", costAvg: 45.10, balanceVolume: 14.50, threshold: 50, maxValue: 100, orgId: "org_alpha_feed" },
  { id: "mat_3", sku: "STEEL-FAST-03", name: "Steel Fastener Pegs", category: "component", unit: "Units", costAvg: 0.12, balanceVolume: 120, threshold: 500, maxValue: 2000, orgId: "org_alpha_feed" },
  { id: "mat_prov_1", sku: "MAIS-01", name: "Maïs Grain", category: "raw", unit: "Kg", costAvg: 150.00, balanceVolume: 5000, threshold: 1000, maxValue: 10000, orgId: "org_alpha_feed" },
  { id: "mat_prov_2", sku: "SOJA-01", name: "Tourteau de Soja", category: "raw", unit: "Kg", costAvg: 300.00, balanceVolume: 2000, threshold: 500, maxValue: 5000, orgId: "org_alpha_feed" },
  { id: "mat_prov_3", sku: "SON-01", name: "Son de Blé", category: "raw", unit: "Kg", costAvg: 100.00, balanceVolume: 1500, threshold: 300, maxValue: 3000, orgId: "org_alpha_feed" },
  { id: "mat_prov_4", sku: "ARACH-01", name: "Tourteau d'Arachide", category: "raw", unit: "Kg", costAvg: 250.00, balanceVolume: 800, threshold: 200, maxValue: 2000, orgId: "org_alpha_feed" },
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
      { id: "qc_2", name: "Surface Smoothness", minValue: 90, maxValue: 100, unit: "GU", tolerance: 2 },
    ],
    routing: [
      { machineId: "mac_saw_1", sequence: 1, usagePercentage: 100, timeInHours: 2 },
      { machineId: "mac_cnc_1", sequence: 2, usagePercentage: 100, timeInHours: 4 },
    ],
    agencyId: "agence_main",
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
      { machineId: "mac_spray_1", sequence: 2, usagePercentage: 100, timeInHours: 2.5 },
    ],
    agencyId: "agence_main",
  },
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
      { id: "qc_bn_1", name: "Edge Finish", minValue: 0, maxValue: 0.5, unit: "mm", tolerance: 0.1 },
    ],
    routing: [
      { machineId: "mac_saw_1", sequence: 1, usagePercentage: 100, timeInHours: 0.3 },
      { machineId: "mac_cnc_1", sequence: 2, usagePercentage: 100, timeInHours: 0.5 },
      { machineId: "mac_spray_1", sequence: 3, usagePercentage: 100, timeInHours: 0.4 },
    ],
    agencyId: "agence_main",
  },
  {
    id: "prod_prov_1",
    name: "Provende Volaille Démarrage",
    sku: "PRV-VOL-DEM",
    price: 350.00,
    targetMargin: 20,
    finalMass: 50,
    measureUnit: "Kg",
    additionalCosts: [{ costId: "add_cost_1", provisionalValue: 20.0 }],
    imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400&h=300&fit=crop",
    notice: "Usage: Complete feed for chicks 0-8 weeks. Store in cool, dry place. Do not feed to adult poultry.",
    assignedLineIds: ["line_prov"],
    qcParameters: [
      { id: "qc_prov_1", name: "Taux de Protéines", minValue: 21, maxValue: 23, unit: "%", tolerance: 0.5 },
    ],
    qualityGates: [
      { sequenceAfter: 2, gateId: "gate_prov_qc", timeInHours: 0.25 },
    ],
    routing: [
      { machineId: "mac_prov_1", sequence: 1, usagePercentage: 100, timeInHours: 0.5 },
      { machineId: "mac_prov_2", sequence: 2, usagePercentage: 100, timeInHours: 1 },
      { machineId: "mac_prov_3", sequence: 3, usagePercentage: 100, timeInHours: 0.5 },
    ],
    agencyId: "agence_fab",
  },
]

export const INITIAL_BOMS: BOM[] = [
  {
    id: "bom_1",
    productId: "prod_1",
    unit: "kg",
    lines: [
      { materialId: "mat_1", quantityPerUnit: 2.50 },
      { materialId: "mat_2", quantityPerUnit: 0.40 },
    ],
  },
  {
    id: "bom_bn_1",
    productId: "prod_bottleneck",
    unit: "kg",
    lines: [
      { materialId: "mat_1", quantityPerUnit: 1.2 },
      { materialId: "mat_2", quantityPerUnit: 0.15 },
      { materialId: "mat_3", quantityPerUnit: 8 },
    ],
  },
  {
    id: "bom_prov_1",
    productId: "prod_prov_1",
    unit: "pct",
    lines: [
      { materialId: "mat_prov_1", quantityPerUnit: 50 },
      { materialId: "mat_prov_2", quantityPerUnit: 21 },
      { materialId: "mat_prov_3", quantityPerUnit: 14 },
      { materialId: "mat_prov_4", quantityPerUnit: 15 },
    ],
  },
]

export const INITIAL_MACHINES: Machine[] = [
  { id: "mac_cnc_1", name: "CNC Router 1", description: "High-precision 5-axis CNC", state: "IDLE", maintenanceCostPerHour: 120.00, opCostPerHour: 80, operationRate: 5, type: "MIXER", powerRating: 15, technicalSpecs: "Spindle speed: 24000 RPM", agencyId: "agence_main" },
  { id: "mac_saw_1", name: "Saw Bench Alpha", description: "Industrial table saw", state: "IDLE", maintenanceCostPerHour: 80.00, opCostPerHour: 45, operationRate: 8, type: "PELLETIZER", powerRating: 5, technicalSpecs: "Blade diameter: 400mm", agencyId: "agence_main" },
  { id: "mac_spray_1", name: "Paint Spray Booth", description: "Automated coating system", state: "IDLE", maintenanceCostPerHour: 150.00, opCostPerHour: 60, operationRate: 4, type: "PACKAGER", powerRating: 12, technicalSpecs: "Airflow: 10000 m3/h", agencyId: "agence_main" },
  { id: "mac_prov_1", name: "Broyeur à Marteaux", description: "Réduit les grains en farine", state: "IDLE", maintenanceCostPerHour: 200.00, opCostPerHour: 5000, operationRate: 20, type: "PELLETIZER", powerRating: 45, technicalSpecs: "Capacité: 5 T/h", agencyId: "agence_fab" },
  { id: "mac_prov_2", name: "Mélangeur Horizontal", description: "Homogénéise les farines", state: "IDLE", maintenanceCostPerHour: 150.00, opCostPerHour: 3000, operationRate: 15, type: "MIXER", powerRating: 30, technicalSpecs: "Capacité: 2 T/h", agencyId: "agence_fab" },
  { id: "mac_prov_3", name: "Ensacheuse Industrielle", description: "Conditionnement en sacs de 50kg", state: "IDLE", maintenanceCostPerHour: 80.00, opCostPerHour: 1500, operationRate: 30, type: "PACKAGER", powerRating: 5, technicalSpecs: "Vitesse: 600 sacs/h", agencyId: "agence_fab" },
]

export const INITIAL_QUALITY_GATES: QualityGate[] = [
  { id: "gate_qc_1", name: "Optical QC Scanner", description: "Vision-based defect detection", type: "VISUAL", inspectionType: "Automated Visual Inspection", serviceProvider: "Internal QA", opCostPerHour: 150, operationRate: 30 },
  { id: "gate_prov_qc", name: "Laboratoire Contrôle Qualité", description: "Vérification des taux protéiques", type: "CHEMICAL", inspectionType: "Analyse Chimique", serviceProvider: "Labo Interne", opCostPerHour: 250, operationRate: 10 },
]

export const INITIAL_LINES: ProductionLine[] = [
  { id: "line_1", name: "Heavy Machining Track 01", agencyId: "agence_main", machineIds: ["mac_saw_1", "mac_cnc_1"], productIds: ["prod_1"] },
  { id: "line_2", name: "Custom Finishing Track", agencyId: "agence_main", machineIds: ["mac_cnc_1", "mac_spray_1"], productIds: ["prod_1", "prod_2", "prod_bottleneck"] },
  { id: "line_prov", name: "Ligne Provenderie Principale", agencyId: "agence_fab", machineIds: ["mac_prov_1", "mac_prov_2", "mac_prov_3"], productIds: ["prod_prov_1"] },
]

export const INITIAL_ORDERS: ManufacturingOrder[] = [
  { id: "mo_101", productId: "prod_1", targetQty: 100, status: "FINAL", lineId: "line_1", startedAt: "2026-05-01T08:00:00Z", completedAt: "2026-05-01T16:00:00Z", qcStatus: "DONE", passedQCBatches: 100, currentSequence: 2, actualAdditionalCosts: { "add_cost_1": 1500, "add_cost_3": 1000 }, originAgencyId: "agence_main" },
  { id: "mo_102", productId: "prod_1", targetQty: 50, status: "IN_PROGRESS", lineId: "line_1", machineId: "mac_saw_1", startedAt: new Date(Date.now() - 3600000).toISOString(), qcStatus: "UNDONE", currentSequence: 1, originAgencyId: "agence_main" },
  { id: "mo_104", productId: "prod_1", targetQty: 250, status: "PENDING", lineId: "line_1", qcStatus: "UNDONE", currentSequence: 1, originAgencyId: "agence_main" },
  { id: "mo_bn_1", productId: "prod_bottleneck", targetQty: 500, status: "FINAL", lineId: "line_2", machineId: "mac_cnc_1", startedAt: new Date(Date.now() - 36000000).toISOString(), completedAt: new Date(Date.now() - 28800000).toISOString(), qcStatus: "DONE", passedQCBatches: 500, currentSequence: 2, actualAdditionalCosts: {}, originAgencyId: "agence_main" },
  { id: "mo_bn_2", productId: "prod_bottleneck", targetQty: 300, status: "IN_PROGRESS", lineId: "line_2", machineId: "mac_cnc_1", startedAt: new Date(Date.now() - 3600000).toISOString(), qcStatus: "UNDONE", currentSequence: 2, originAgencyId: "agence_main" },
  { id: "mo_bn_3", productId: "prod_bottleneck", targetQty: 500, status: "PENDING", lineId: "line_2", machineId: "mac_cnc_1", qcStatus: "UNDONE", currentSequence: 2, originAgencyId: "agence_main" },
  { id: "mo_bn_4", productId: "prod_bottleneck", targetQty: 300, status: "PENDING", lineId: "line_2", machineId: "mac_saw_1", qcStatus: "UNDONE", currentSequence: 1, originAgencyId: "agence_main" },
  { id: "mo_prov_1", productId: "prod_prov_1", targetQty: 200, status: "IN_PROGRESS", lineId: "line_prov", machineId: "mac_prov_1", startedAt: new Date(Date.now() - 7200000).toISOString(), qcStatus: "UNDONE", currentSequence: 1, originAgencyId: "agence_fab" },
]

export const INITIAL_LEDGER: InventoryLedgerEntry[] = [
  { id: "ledg_1", materialId: "mat_1", timestamp: "2026-04-15T10:00:00Z", type: "REFILL", quantity: 1000, unitCost: 12.00, totalValue: 12000.00 },
  { id: "ledg_2", materialId: "mat_1", timestamp: "2026-04-20T09:00:00Z", type: "REFILL", quantity: 450, unitCost: 13.61, totalValue: 6124.50 },
]
