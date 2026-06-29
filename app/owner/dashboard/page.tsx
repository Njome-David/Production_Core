"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/providers/AuthProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { INITIAL_SUBSCRIPTIONS, INITIAL_FINISHED_GOODS_TRANSACTIONS, INITIAL_AGENCIES, INITIAL_EMPLOYEES, INITIAL_USERS } from "@/lib/mock-db"
import type { ManufacturingOrder } from "@/lib/mock-db"
import {
  CurrencyDollar,
  TrendDown,
  TrendUp,
  Package,
  Users,
  Buildings,
  Hourglass,
  WarningCircle,
  ActivityIcon,
  ArrowRight,
} from "@phosphor-icons/react"
import Link from "next/link"

export default function OwnerDashboard() {
  const { activeOrg } = useAuth()
  const { t } = useLanguage()
  const {
    orders,
    products,
    materials,
    agencies,
    employees,
    finishedGoodsTransactions,
  } = useMockData()
  const { t: _t } = useLanguage()

  const orgId = activeOrg?.org.id ?? ""
  const org = activeOrg?.org

  // ── KPIs ──
  const kpis = useMemo(() => {
    const completedOrders = orders.filter(o => o.status === "COMPLETED" || o.status === "FINAL")
    const totalRevenue = finishedGoodsTransactions
      .filter(t => t.type === "sale")
      .reduce((sum, t) => sum + (t.totalValue ?? 0), 0)
    const productionValue = finishedGoodsTransactions
      .filter(t => t.type === "production")
      .reduce((sum, t) => sum + (t.totalValue ?? 0), 0)
    const totalCost = orders.reduce((sum, o) => sum + (o.actualMaterialConsumed ? Object.values(o.actualMaterialConsumed).reduce((a, b) => a + b, 0) : 0), 0)
    const margin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100) : 0
    const activeOrders = orders.filter(o => o.status === "IN_PROGRESS" || o.status === "PENDING").length
    const lowStockMaterials = materials.filter(m => m.balanceVolume <= m.threshold).length

    return { totalRevenue, productionValue, totalCost, margin, activeOrders, lowStockMaterials }
  }, [orders, finishedGoodsTransactions, materials])

  // ── Production par mois ──
  const monthlyProduction = useMemo(() => {
    const months: Record<string, number> = {}
    for (const t of finishedGoodsTransactions) {
      if (t.type !== "production") continue
      const m = t.timestamp.slice(0, 7)
      months[m] = (months[m] ?? 0) + t.quantity
    }
    return Object.entries(months).sort().slice(-6)
  }, [finishedGoodsTransactions])

  // ── CA par agence (barres simulées) ──
  const revenueByAgency = useMemo(() => {
    return agencies.map(a => {
      const rev = finishedGoodsTransactions
        .filter(t => t.agencyId === a.id && t.type === "sale")
        .reduce((s, t) => s + (t.totalValue ?? 0), 0)
      return { name: a.name, revenue: rev }
    })
  }, [agencies, finishedGoodsTransactions])

  // ── Order status distribution ──
  const orderStatuses = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const o of orders) {
      counts[o.status] = (counts[o.status] ?? 0) + 1
    }
    return counts
  }, [orders])

  // ── {t("owner_dashboard_activity_title")} ──
  const recentActivity = useMemo(() => {
    const items: { time: string; text: string }[] = []
    for (const transaction of finishedGoodsTransactions.slice(0, 5)) {
      const p = products.find(p => p.id === transaction.productId)
      items.push({
        time: new Date(transaction.timestamp).toLocaleDateString("fr-FR"),
        text: `${transaction.type === "production" ? t("owner_dashboard_production") : transaction.type === "sale" ? t("owner_dashboard_sale") : t("owner_dashboard_return")} — ${p?.name ?? transaction.productId} (${transaction.quantity} ${p?.measureUnit ?? "u"})`,
      })
    }
    for (const o of orders.slice(0, 3)) {
      const p = products.find(p => p.id === o.productId)
      items.push({
        time: o.startedAt ? new Date(o.startedAt).toLocaleDateString("fr-FR") : "—",
        text: `OF ${o.id}: ${p?.name ?? o.productId} → ${o.status}`,
      })
    }
    return items.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8)
  }, [finishedGoodsTransactions, orders, products])

  const subscription = INITIAL_SUBSCRIPTIONS.find(s => s.orgId === orgId)

  const maxRev = Math.max(...revenueByAgency.map(r => r.revenue), 1)

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
          {_t("owner_dashboard_title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {org?.name} &middot; {agencies.length} {_t("owner_dashboard_agency_label")}{agencies.length > 1 ? "s" : ""} &middot; {employees.length} {_t("owner_dashboard_employee_label")}{employees.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard icon={CurrencyDollar} label="CA total" value={`${(kpis.totalRevenue / 1000).toFixed(1)}k`} />
        <KpiCard icon={TrendDown} label={t("owner_dashboard_kpi_margin")} value={`${kpis.margin.toFixed(0)}%`} color="text-emerald-500" />
        <KpiCard icon={Package} label={t("owner_dashboard_kpi_active_orders")} value={String(kpis.activeOrders)} />
        <KpiCard icon={Users} label={t("owner_dashboard_kpi_employees")} value={String(employees.length)} />
        <KpiCard icon={Buildings} label={t("owner_dashboard_kpi_agencies")} value={String(agencies.length)} />
         <KpiCard
           icon={WarningCircle}
           label={t("owner_dashboard_kpi_low_stock")}
           value={String(kpis.lowStockMaterials)}
           color={kpis.lowStockMaterials > 0 ? "text-red-500" : "text-muted-foreground"}
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CA par agence */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-display font-bold text-foreground mb-4">CA par agence</h2>
          <div className="flex flex-col gap-3">
            {revenueByAgency.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>
            ) : revenueByAgency.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-32 truncate">{a.name}</span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden min-w-0">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max((a.revenue / maxRev) * 100, 6)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <span className="text-xs font-mono text-foreground w-20 text-right">
                  {a.revenue.toLocaleString()} FCFA
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status distribution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-display font-bold text-foreground mb-4">{t("owner_dashboard_work_orders_title")}</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(orderStatuses).map(([status, count]) => {
              const total = Object.values(orderStatuses).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? (count / total) * 100 : 0
              const colors: Record<string, string> = {
                PROGRAMMED: "bg-blue-500",
                PENDING: "bg-amber-500",
                IN_PROGRESS: "bg-indigo-500",
                WAITING: "bg-orange-500",
                COMPLETED: "bg-emerald-500",
                FINAL: "bg-emerald-600",
              }
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${colors[status] ?? "bg-muted"}`} />
                  <span className="text-xs text-muted-foreground flex-1">{status}</span>
                  <span className="text-xs font-mono text-foreground">{count}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">{pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Monthly production + Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production / mois */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-display font-bold text-foreground mb-4">{t("owner_dashboard_monthly_production_title")}</h2>
          <div className="flex items-end gap-3 h-40 min-h-[160px] border border-border/50 rounded-lg bg-background/40 p-3">
            {monthlyProduction.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune production récente.</p>
            ) : monthlyProduction.map(([month, qty]) => {
              const max = Math.max(...monthlyProduction.map(([, q]) => q), 1)
              const h = (qty / max) * 100
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex h-full min-h-[110px] w-full items-end justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(h, 8)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="w-full max-w-8 bg-gradient-to-t from-primary to-primary/70 rounded-t-md shadow-sm"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{month.slice(5)}</span>
                  <span className="text-[10px] text-muted-foreground">{qty}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-display font-bold text-foreground mb-4">{t("owner_dashboard_activity_title")}</h2>
          <div className="flex flex-col gap-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <ActivityIcon className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">{item.time}</span>
                  <p className="text-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription alert */}
      {subscription && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hourglass className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("owner_dashboard_subscription_plan")} {subscription.plan} — {t("owner_dashboard_subscription_ends")} {new Date(subscription.endDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("owner_dashboard_subscription_billing")} {subscription.billing === "annual" ? t("owner_dashboard_subscription_billing_annual") : t("owner_dashboard_subscription_billing_monthly")}
              </p>
            </div>
          </div>
          <Link
            href="/owner/profile"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            Gérer <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Low stock alerts */}
      {materials.filter(m => m.balanceVolume <= m.threshold).length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <WarningCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-foreground">Alertes de stock</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {materials.filter(m => m.balanceVolume <= m.threshold).slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{m.name}</span>
                <span className="text-red-500 font-mono">{m.balanceVolume} / {m.threshold} {m.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color ?? "text-muted-foreground"}`} />
        <span className="text-[11px] font-mono text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-xl font-display font-bold ${color ?? "text-foreground"}`}>{value}</span>
    </div>
  )
}
