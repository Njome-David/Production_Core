import { Product, BOM, Material, Machine, QualityGate } from "@/lib/mock-db"

export function computeProductUnitCost(
  product: Product,
  boms: BOM[],
  materials: Material[],
  machines: Machine[],
  qualityGates: QualityGate[],
): number {
  const bom = boms.find(b => b.productId === product.id)
  let materialsCost = 0
  if (bom) {
    const bomSumKg = bom.lines.reduce((acc, row) => acc + row.quantityPerUnit, 0)
    const finalMass = bom.unit === "kg" ? bomSumKg : (product.finalMass || 100)
    bom.lines.forEach(row => {
      const mat = materials.find(m => m.id === row.materialId)
      if (mat) {
        const qty = bom.unit === "pct" ? (row.quantityPerUnit / 100) * finalMass : row.quantityPerUnit
        materialsCost += qty * mat.costAvg
      }
    })
  }

  let opCost = 0
  if (product.routing) {
    product.routing.forEach(row => {
      const mac = machines.find(m => m.id === row.machineId)
      const macOpCost = mac?.opCostPerHour || 0
      opCost += (row.usagePercentage / 100) * macOpCost * (row.timeInHours || 1)

      if (product.qualityGates) {
        const gateEntry = product.qualityGates.find(g => g.sequenceAfter === row.sequence)
        if (gateEntry) {
          const gate = qualityGates.find(q => q.id === gateEntry.gateId)
          const gateHours = gateEntry.timeInHours || 0.25
          opCost += (gate?.opCostPerHour || 0) * gateHours
        }
      }
    })
  }

  let addlCost = 0
  if (product.additionalCosts) {
    product.additionalCosts.forEach(row => {
      addlCost += row.provisionalValue
    })
  }

  return materialsCost + opCost + addlCost
}

export function computeSellingPrice(
  product: Product,
  boms: BOM[],
  materials: Material[],
  machines: Machine[],
  qualityGates: QualityGate[],
): number {
  const unitCost = computeProductUnitCost(product, boms, materials, machines, qualityGates)
  const margin = product.targetMargin || 30
  return unitCost * (100 + margin) / 100
}
