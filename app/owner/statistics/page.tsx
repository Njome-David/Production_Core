"use client"

import React, { useMemo, useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/providers/AuthProvider"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { ChartLineUp,   TrendUp, Gear, Cube } from "@phosphor-icons/react"
import { useLanguage } from "@/providers/LanguageProvider"

export default function OwnerStatistics() {
  const { activeOrg } = useAuth()
  const {
    orders, products, machines, materials,
    agencies, finishedGoodsTransactions,
  } = useMockData()

  const { t } = useLanguage()

  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const [filterAgency, setFilterAgency] = useState("all")

  const nowRef = useRef<number>(0)
  useEffect(() => {
    nowRef.current = Date.now()
  }, [])
  
  const periodCutoff = period === "7d" ? nowRef.current - 7 * 86400000
    : period === "30d" ? nowRef.current - 30 * 86400000
    : period === "90d" ? nowRef.current - 90 * 86400000
    : 0

  const filteredFT = useMemo(() => {
    return finishedGoodsTransactions.filter(t => {
      if (filterAgency !== "all" && t.agencyId !== filterAgency) return false
      if (periodCutoff > 0 && new Date(t.timestamp).getTime() < periodCutoff) return false
      return true
    })
  }, [finishedGoodsTransactions, filterAgency, periodCutoff])

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (filterAgency !== "all") {
        const agency = agencies.find(a => a.id === o.originAgencyId)
        if (!agency || agency.orgId !== activeOrg?.org.id) return false
        if (o.originAgencyId !== filterAgency) return false
      }
      if (periodCutoff > 0 && o.startedAt && new Date(o.startedAt).getTime() < periodCutoff) return false
      return true
    })
  }, [orders, filterAgency, periodCutoff, agencies, activeOrg])

  const totalRevenue = filteredFT.filter(t => t.type === "sale").reduce((s, t) => s + (t.totalValue ?? 0), 0)
  const totalProduction = filteredFT.filter(t => t.type === "production").reduce((s, t) => s + t.quantity, 0)
  const completionRate = filteredOrders.length > 0
    ? (filteredOrders.filter(o => o.status === "COMPLETED" || o.status === "FINAL").length / filteredOrders.length * 100).toFixed(0)
    : "—"

  // Machines state pie
  const machineStates = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const m of machines) {
      counts[m.state] = (counts[m.state] ?? 0) + 1
    }
    return counts
  }, [machines])

  // Revenue by month
  const revenueByMonth = useMemo(() => {
    const months: Record<string, number> = {}
    for (const t of filteredFT) {
      if (t.type !== "sale") continue
      const m = t.timestamp.slice(0, 7)
      months[m] = (months[m] ?? 0) + (t.totalValue ?? 0)
    }
    return Object.entries(months).sort().slice(-6)
  }, [filteredFT])

  const maxRev = Math.max(...revenueByMonth.map(([, v]) => v), 1)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">{t("owner_statistics_title")}</h1>
        <div className="flex items-center gap-3">
          <select value={filterAgency} onChange={e => setFilterAgency(e.target.value)}
            className="h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none">
            <option value="all">{t("owner_statistics_all_agencies")}</option>
            {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <div className="flex bg-muted rounded-lg p-0.5">
            {(["7d", "30d", "90d", "all"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}>
                {p === "all" ? t("owner_statistics_all") : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={TrendUp} label="CA" value={`${(totalRevenue / 1000).toFixed(1)}k FCFA`} />
        <StatCard icon={Cube} label="Production" value={`${totalProduction} u`} />
        <StatCard icon={ChartLineUp} label="Taux complétion" value={`${completionRate}%`} />
        <StatCard icon={Gear} label="Machines" value={`${machines.length}`} />
      </div>

      {/* Revenue chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-display font-bold text-foreground mb-4">{t("owner_statistics_monthly_revenue")}</h2>
        <div className="flex items-end gap-3 h-40 min-h-[160px] border border-border/50 rounded-lg bg-background/40 p-3">
          {revenueByMonth.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée de chiffre d’affaires pour cette période.</p>
          ) : revenueByMonth.map(([month, val]) => {
            const h = (val / maxRev) * 100
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex h-full min-h-[110px] w-full items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${Math.max(h, 8)}%` }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-10 bg-gradient-to-t from-primary to-primary/70 rounded-t-md shadow-sm"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">{month.slice(5)}</span>
                <span className="text-[10px] text-muted-foreground">{(val / 1000).toFixed(0)}k</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Machine states */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-display font-bold text-foreground mb-4">{t("owner_statistics_machine_states")}</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(machineStates).map(([state, count]) => {
              const total = Object.values(machineStates).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? (count / total) * 100 : 0
              const colors: Record<string, string> = {
                IDLE: "bg-muted", RUNNING: "bg-emerald-500", WAITING: "bg-amber-500", MAINTENANCE: "bg-red-500",
              }
              return (
                <div key={state} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${colors[state] ?? "bg-muted"}`} />
                  <span className="text-xs text-muted-foreground flex-1">{state}</span>
                  <span className="text-xs font-mono text-foreground">{count}</span>
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[state] ?? "bg-muted"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-display font-bold text-foreground mb-4">{t("owner_statistics_stock_alerts")}</h2>
          {materials.filter(m => m.balanceVolume <= m.threshold).length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("owner_statistics_all_stocks_sufficient")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {materials.filter(m => m.balanceVolume <= m.threshold).map(m => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{m.name}</span>
                  <span className="text-red-500 font-mono">{m.balanceVolume} / {m.threshold} {m.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-[11px] font-mono text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xl font-display font-bold text-foreground">{value}</span>
    </div>
  )
}
