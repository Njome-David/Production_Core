"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { ChartLineUp, CurrencyDollar, FileText, ArrowUpRight, ArrowDownRight, Package } from "@phosphor-icons/react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { useMockData } from "@/providers/MockFeedProductionProvider"

export default function InsightsPage() {
  const { inventoryLedger, activeMOs, materials, products } = useMockData()

  // Calculate Insights
  const insights = useMemo(() => {
    const totalRefillCost = inventoryLedger
      .filter(l => l.type === "REFILL")
      .reduce((sum, l) => sum + l.totalValue, 0)
      
    const completedOrders = activeMOs.filter(mo => mo.status === "COMPLETED")
    
    // Estimate cost of completed orders
    const estimatedCostOfGoods = completedOrders.reduce((sum, mo) => {
      const bom = mo.bom
      if (!bom) return sum
      const materialCosts = bom.lines.reduce((matSum, line) => {
        const material = materials.find(m => m.id === line.materialId)
        if (!material) return matSum
        return matSum + (line.quantityPerUnit * mo.targetQty * material.costAvg)
      }, 0)
      return sum + materialCosts
    }, 0)
    
    // Estimated revenue
    const estimatedRevenue = completedOrders.reduce((sum, mo) => {
      const product = products.find(p => p.id === mo.productId)
      if (!product) return sum
      return sum + (product.price * mo.targetQty)
    }, 0)

    const grossMargin = estimatedRevenue - estimatedCostOfGoods

    return {
      totalRefillCost,
      completedOrdersCount: completedOrders.length,
      estimatedCostOfGoods,
      estimatedRevenue,
      grossMargin
    }
  }, [inventoryLedger, activeMOs, materials, products])

  const perProductInsights = useMemo(() => {
    const productStats: Record<string, { name: string, totalProduced: number, revenue: number, cost: number }> = {}
    
    products.forEach(p => {
      productStats[p.id] = { name: p.name, totalProduced: 0, revenue: 0, cost: 0 }
    })
    
    activeMOs.filter(mo => mo.status === "COMPLETED").forEach(mo => {
      if (productStats[mo.productId]) {
        productStats[mo.productId].totalProduced += mo.targetQty
        
        // Revenue
        const product = products.find(p => p.id === mo.productId)
        if (product) {
          productStats[mo.productId].revenue += product.price * mo.targetQty
        }
        
        // Cost
        const bom = mo.bom
        if (bom) {
          const matCost = bom.lines.reduce((sum, line) => {
            const mat = materials.find(m => m.id === line.materialId)
            return sum + (mat ? line.quantityPerUnit * mo.targetQty * mat.costAvg : 0)
          }, 0)
          productStats[mo.productId].cost += matCost
        }
      }
    })
    
    return Object.values(productStats).map(stat => ({
      ...stat,
      margin: stat.revenue - stat.cost,
      marginPct: stat.revenue > 0 ? ((stat.revenue - stat.cost) / stat.revenue) * 100 : 0
    }))
  }, [activeMOs, products, materials])

  // Aggregated chart data: single waterfall view
  const aggregatedChartData = [
    { name: 'Revenue', value: insights.estimatedRevenue, fill: '#3B82F6' },
    { name: 'COGS', value: insights.estimatedCostOfGoods, fill: '#F59E0B' },
    { name: 'Margin', value: insights.grossMargin, fill: '#10B981' },
  ]

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6 }}
          className="max-w-xl"
        >
          <h1 className="text-4xl font-display text-foreground font-bold tracking-tight mb-2">Financial Insights</h1>
          <p className="text-muted-foreground text-lg">Yield analysis, resource consumption costs, and operational variance reporting.</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="p-6 border border-border rounded-2xl bg-card flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center mb-2">
            <CurrencyDollar className="w-5 h-5 text-emerald-600" weight="duotone" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Estimated Revenue</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl text-foreground font-display font-bold">{insights.estimatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FCFA</span>
          </div>
        </div>

        <div className="p-6 border border-border rounded-2xl bg-card flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center mb-2">
            <ChartLineUp className="w-5 h-5 text-amber-600" weight="duotone" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Cost of Goods (COGS)</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl text-foreground font-display font-bold">{insights.estimatedCostOfGoods.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FCFA</span>
          </div>
        </div>
        
        <div className="p-6 border border-border rounded-2xl bg-card flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center mb-2">
            <ArrowUpRight className="w-5 h-5 text-primary" weight="duotone" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Gross Margin</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl text-foreground font-display font-bold">{insights.grossMargin.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FCFA</span>
          </div>
        </div>

        <div className="p-6 border border-border rounded-2xl bg-card flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center mb-2">
            <Package className="w-5 h-5 text-indigo-600" weight="duotone" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Completed MOs</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl text-foreground font-display font-bold">{insights.completedOrdersCount}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.2 }}
          className="flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <h3 className="font-display text-foreground font-bold text-lg">Recent Purchasing Ledger</h3>
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
             {inventoryLedger.filter(l => l.type === "REFILL").slice(0, 10).map(entry => {
                const mat = materials.find(m => m.id === entry.materialId)
                return (
                  <div key={entry.id} className="p-4 border-b border-border/30 last:border-0 flex flex-col gap-1 hover:bg-muted/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm text-foreground">{mat?.name || entry.materialId}</span>
                      <span className="font-mono text-sm font-bold text-foreground">
                        {entry.totalValue.toFixed(0)} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span className="font-mono">{new Date(entry.timestamp).toLocaleString()}</span>
                      <span className="font-mono">{entry.quantity} {mat?.unit || 'Units'} at {(entry.totalValue / entry.quantity).toFixed(0)} FCFA/{mat?.unit || 'Unit'}</span>
                    </div>
                  </div>
                )
             })}
             {inventoryLedger.filter(l => l.type === "REFILL").length === 0 && (
               <div className="p-8 text-center text-sm text-muted-foreground">No recent purchasing records.</div>
             )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.3 }}
          className="flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <h3 className="font-display text-foreground font-bold text-lg">Margin Visualizer</h3>
            <ChartLineUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[400px]">
            {insights.completedOrdersCount > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                <BarChart data={aggregatedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.75rem', fontSize: '12px', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(value: number) => [`${value.toLocaleString()} FCFA`, undefined]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={80}>
                    {aggregatedChartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                <ChartLineUp className="w-12 h-12 opacity-20" />
                <span className="text-sm font-medium">No completed orders to calculate margins.</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Per Product Table Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.4 }}
        className="flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm mt-8"
      >
        <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <h3 className="font-display text-foreground font-bold text-lg">Detailed Per-Product Financials</h3>
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b border-border/40 text-muted-foreground text-xs uppercase font-mono tracking-wider">
                <th className="py-4 px-6 font-semibold">Product</th>
                <th className="py-4 px-6 font-semibold">Total Produced</th>
                <th className="py-4 px-6 font-semibold text-right">Revenue</th>
                <th className="py-4 px-6 font-semibold text-right">COGS</th>
                <th className="py-4 px-6 font-semibold text-right">Gross Margin</th>
                <th className="py-4 px-6 font-semibold text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {perProductInsights.map((stat, idx) => {
                const unitPrice = stat.totalProduced > 0 ? stat.revenue / stat.totalProduced : 0
                const costPerUnit = stat.totalProduced > 0 ? stat.cost / stat.totalProduced : 0
                return (
                  <tr key={idx} className={`hover:bg-muted/5 transition-colors group ${stat.totalProduced === 0 ? 'opacity-50' : ''}`}>
                    <td className="py-4 px-6 font-medium text-foreground">{stat.name}</td>
                    <td className="py-4 px-6 font-mono text-muted-foreground">{stat.totalProduced.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono text-right font-bold text-foreground">{stat.revenue.toLocaleString()} FCFA</td>
                    <td className="py-4 px-6 font-mono text-right text-amber-500">{stat.cost.toLocaleString()} FCFA</td>
                    <td className="py-4 px-6 font-mono text-right font-bold text-emerald-500">{stat.margin.toLocaleString()} FCFA</td>
                    <td className="py-4 px-6 font-mono text-right font-bold text-primary">{stat.marginPct.toFixed(1)}%</td>
                  </tr>
                )
              })}
              {perProductInsights.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                    No production data available for detailed analysis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
