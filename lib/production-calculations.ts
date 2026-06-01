import { BOM, Machine, Material, Product, ProductionLine } from "@/lib/mock-db"

export interface ProductionCostInput {
  productId: string
  lineId: string
  targetQty: number
  products: Product[]
  boms: BOM[]
  materials: Material[]
  lines: ProductionLine[]
  machines: Machine[]
}

export function calculateProductionCost(input: ProductionCostInput) {
  const product = input.products.find(p => p.id === input.productId)
  const bom = input.boms.find(b => b.productId === input.productId)
  const line = input.lines.find(l => l.id === input.lineId)

  const materialBreakdown = bom?.lines.map(bomLine => {
    const material = input.materials.find(m => m.id === bomLine.materialId)
    const requiredQty = bomLine.quantityPerUnit * input.targetQty
    const unitCost = material?.costAvg ?? 0

    return {
      ...bomLine,
      material,
      requiredQty,
      unitCost,
      totalCost: requiredQty * unitCost,
      projectedBalance: (material?.balanceVolume ?? 0) - requiredQty,
      hasShortage: material ? material.balanceVolume < requiredQty : true,
    }
  }) ?? []

  const materialsCost = materialBreakdown.reduce((sum, item) => sum + item.totalCost, 0)

  const machineBreakdown = line?.machineIds.map(machineId => {
    const machine = input.machines.find(m => m.id === machineId)
    const runtimeHours = machine?.operationRate ? input.targetQty / machine.operationRate : 0
    const hourlyCost = (machine?.hourlyCost ?? 0) + (machine?.maintenanceCostPerHour ?? 0) + (machine?.depreciationCostPerHour ?? 0)

    return {
      machine,
      runtimeHours,
      hourlyCost,
      totalCost: runtimeHours * hourlyCost,
      alert: machine ? buildMachineAlert(machine) : "Machine missing from roster.",
    }
  }) ?? []

  const machineCost = machineBreakdown.reduce((sum, item) => sum + item.totalCost, 0)
  const laborCost = (product?.laborCostPerBatch ?? 0) * input.targetQty
  const fixedLaunchCost = product?.fixedLaunchCost ?? 0
  const totalCost = fixedLaunchCost + materialsCost + machineCost + laborCost
  const targetMarginPercent = product?.targetMarginPercent ?? 0
  // Selling price is derived from full manufacturing cost so launch decisions include materials, labor, machines and depreciation.
  const targetSellingPrice = targetMarginPercent >= 100 ? totalCost : totalCost / (1 - targetMarginPercent / 100)
  const marginValue = targetSellingPrice - totalCost

  const missingPricingDetails = [
    !product ? "Product profile" : null,
    !bom || bom.lines.length === 0 ? "BOM composition" : null,
    !line ? "Production line" : null,
    product && product.targetMarginPercent <= 0 ? "Target margin %" : null,
    product && product.laborCostPerBatch < 0 ? "Labor cost" : null,
    ...materialBreakdown.filter(item => !item.material || item.unitCost <= 0).map(item => item.material?.name ?? item.materialId),
    ...machineBreakdown.filter(item => !item.machine || item.hourlyCost <= 0 || item.runtimeHours <= 0).map(item => item.machine?.name ?? "Machine cost"),
  ].filter(Boolean) as string[]

  return {
    product,
    bom,
    line,
    materialBreakdown,
    machineBreakdown,
    materialsCost,
    machineCost,
    laborCost,
    fixedLaunchCost,
    totalCost,
    targetSellingPrice,
    targetMarginPercent,
    marginValue,
    hasShortage: materialBreakdown.some(item => item.hasShortage),
    missingPricingDetails,
    isLaunchReady: missingPricingDetails.length === 0 && !materialBreakdown.some(item => item.hasShortage),
  }
}

export function getProjectedStock(material: Material, committedDemand = 0) {
  const forecast = material.forecastConsumption ?? 0
  const projectedBalance = material.balanceVolume - forecast - committedDemand
  const fillPercent = material.maxValue > 0 ? Math.min(100, Math.max(0, (projectedBalance / material.maxValue) * 100)) : 0

  return {
    forecast,
    projectedBalance,
    fillPercent,
    isBelowThreshold: projectedBalance <= material.threshold,
  }
}

export function buildMachineAlert(machine: Machine) {
  if (machine.priority === "HIGH" && machine.availabilityPercent < 85) return "High priority and limited availability."
  if (machine.state === "MAINTENANCE") return "Machine is in maintenance."
  if (machine.utilizationPercent > 90) return "Utilization is near saturation."
  return null
}
