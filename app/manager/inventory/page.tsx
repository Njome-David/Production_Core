"use client"

import React, { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Archive, Plus, Cube, WarningCircle, CheckCircle, Warning, FileText, DownloadSimple, X, Package, CurrencyDollar, Users } from "@phosphor-icons/react"
import { useAuth } from "@/providers/AuthProvider"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"

type InvTab = "materials" | "finished"

export default function InventoryPage() {
  const { t } = useLanguage()
  const {
    materials, recordInventoryTransaction, inventoryLedger, addMaterial,
    products, finishedGoodsTransactions, thirdParties,
    currentAgency,
    recordFinishedGoodsTransaction,
  } = useMockData()
  const [activeTab, setActiveTab] = useState<InvTab>("materials")

  // ── Materials state ──
  const [showRefillModal, setShowRefillModal] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
  const [refillQty, setRefillQty] = useState<number>(0)
  const [costMode, setCostMode] = useState<"total" | "per_unit">("total")
  const [costValue, setCostValue] = useState<number>(0)
  const [showShortfallOnly, setshowShortfallOnly] = useState(false)
  const [showProvisionModal, setShowProvisionModal] = useState(false)
  const [newMatName, setNewMatName] = useState("")
  const [newMatThreshold, setNewMatThreshold] = useState<number>(1000)
  const [newMatMax, setNewMatMax] = useState<number>(10000)
  const [newMatUnit, setNewMatUnit] = useState<string>("Kg")
  const [newMatCost, setNewMatCost] = useState<number>(350)

  // ── Finished goods state ──
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [saleProductId, setSaleProductId] = useState("")
  const [saleQty, setSaleQty] = useState<number>(0)
  const [saleBuyerId, setSaleBuyerId] = useState("")

  // ── Computed finished goods stock ──
  const finishedStock = useMemo(() => {
    const stock: Record<string, { productId: string; quantity: number; totalValue: number }> = {}
    for (const txn of finishedGoodsTransactions) {
      if (txn.type === "production") {
        stock[txn.productId] ??= { productId: txn.productId, quantity: 0, totalValue: 0 }
        stock[txn.productId].quantity += txn.quantity
        stock[txn.productId].totalValue += txn.totalValue ?? 0
      } else if (txn.type === "sale") {
        stock[txn.productId] ??= { productId: txn.productId, quantity: 0, totalValue: 0 }
        stock[txn.productId].quantity -= txn.quantity
        stock[txn.productId].totalValue -= txn.totalValue ?? 0
      }
    }
    return Object.values(stock).filter(s => s.quantity > 0 || s.totalValue > 0)
  }, [finishedGoodsTransactions])

  const saleHistory = useMemo(() => {
    return finishedGoodsTransactions
      .filter(t => t.type === "sale")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [finishedGoodsTransactions])

  const clients = thirdParties.filter(tp => tp.type === "client")

  // ── Material handlers ──
  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMatName || newMatThreshold <= 0 || newMatMax <= 0) return

    const slug = newMatName.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const generatedId = `mat_${slug}`
    const generatedSku = `SKU-${newMatName.toUpperCase().substring(0, 3)}-${Math.floor(100 + Math.random() * 900)}`

    addMaterial({
      id: generatedId,
      sku: generatedSku,
      name: newMatName,
      category: "raw",
      balanceVolume: 0,
      threshold: newMatThreshold,
      maxValue: newMatMax,
      unit: newMatUnit,
      costAvg: newMatCost,
      orgId: "org_alpha_feed"
    })

    setShowProvisionModal(false)
    setNewMatName("")
    setNewMatThreshold(1000)
    setNewMatMax(10000)
    setNewMatCost(350)
  }

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMaterialId || refillQty <= 0 || costValue <= 0) return

    const totalValue = costMode === "total" ? costValue : costValue * refillQty
    const unitCost = costMode === "per_unit" ? costValue : costValue / refillQty

    recordInventoryTransaction({
      materialId: selectedMaterialId,
      type: "REFILL",
      quantity: refillQty,
      unitCost,
      totalValue
    })

    setShowRefillModal(false)
    setRefillQty(0)
    setCostValue(0)
  }

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!saleProductId || saleQty <= 0) return

    const stock = finishedStock.find(s => s.productId === saleProductId)
    if (!stock || saleQty > stock.quantity) return

    const avgValue = stock.totalValue / stock.quantity
    recordFinishedGoodsTransaction({
      productId: saleProductId,
      quantity: saleQty,
      type: "sale",
      agencyId: currentAgency?.id ?? "",
      totalValue: avgValue * saleQty,
      buyerId: saleBuyerId || undefined,
      timestamp: new Date().toISOString(),
    })

    setShowSaleModal(false)
    setSaleProductId("")
    setSaleQty(0)
    setSaleBuyerId("")
  }

  const getStatusIndicator = (qty: number, threshold: number, maxValue: number) => {
    if (qty <= threshold) return { icon: <WarningCircle weight="fill" className="text-red-500 w-5 h-5" />, label: t("inv_status_shortfall"), color: "text-red-500", bg: "bg-red-500/10" }
    if (qty <= threshold * 1.5) return { icon: <Warning weight="fill" className="text-amber-500 w-5 h-5" />, label: t("inv_status_warning"), color: "text-amber-500", bg: "bg-amber-500/10" }
    if (qty >= maxValue * 0.9) return { icon: <Archive weight="fill" className="text-sky-500 w-5 h-5" />, label: t("inv_status_oversaturated"), color: "text-sky-500", bg: "bg-sky-500/10" }
    return { icon: <CheckCircle weight="fill" className="text-emerald-500 w-5 h-5" />, label: t("inv_status_healthy"), color: "text-emerald-500", bg: "bg-emerald-500/10" }
  }

  const displayedMaterials = showShortfallOnly
    ? materials.filter(m => m.balanceVolume <= m.threshold)
    : materials

  return (
    <div className="w-full flex flex-col gap-8 pb-12 relative min-h-[calc(100dvh-64px)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6 }}
          className="max-w-xl"
        >
          <h1 className="text-4xl font-display text-foreground font-bold tracking-tight mb-2">{t("inv_title")}</h1>
          <p className="text-muted-foreground text-lg">{t("inv_desc")}</p>
        </motion.div>

        <div className="flex gap-2">
          {activeTab === "materials" && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setshowShortfallOnly(!showShortfallOnly)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-colors ${showShortfallOnly ? 'bg-red-500 text-white' : 'bg-card border border-border text-foreground hover:bg-muted'}`}
              >
                <Archive weight="bold" className="w-5 h-5" />
                {t("inv_filter_low")}
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowProvisionModal(true)}
                className="flex items-center gap-2 bg-card border border-border text-foreground px-5 py-3 rounded-xl font-bold hover:bg-muted transition-colors"
              >
                <Plus weight="bold" className="w-5 h-5" />
                {t("inv_btn_provision")}
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowRefillModal(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:bg-primary/90 transition-colors"
              >
                <DownloadSimple weight="bold" className="w-5 h-5" />
                {t("inv_btn_refill")}
              </motion.button>
            </>
          )}
          {activeTab === "finished" && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowSaleModal(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:bg-primary/90 transition-colors"
            >
              <CurrencyDollar weight="bold" className="w-5 h-5" />
              {t("manager_inventory_finished_sale_btn")}
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-xl p-1 w-fit border border-border/50">
        <button onClick={() => setActiveTab("materials")}
          className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === "materials" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          <Cube className="w-4 h-4 inline-block mr-2" />
          Matières premières
        </button>
        <button onClick={() => setActiveTab("finished")}
          className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === "finished" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          <Package className="w-4 h-4 inline-block mr-2" />
          {t("manager_inventory_finished_tab")}
        </button>
      </div>

      {/* ──────────────── MATERIALS TAB ──────────────── */}
      {activeTab === "materials" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm"
            >
              <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                <h3 className="font-display text-foreground font-bold text-lg">{t("inv_balance")}</h3>
              </div>
              <div className="flex flex-col divide-y divide-border/50">
                {displayedMaterials.map(mat => {
                  const status = getStatusIndicator(mat.balanceVolume, mat.threshold, mat.maxValue)
                  const fillPercentage = Math.min(100, Math.max(0, (mat.balanceVolume / mat.maxValue) * 100))
                  return (
                    <div key={mat.id} className="p-6 hover:bg-muted/10 transition-colors flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full md:w-1/3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Cube className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-display font-bold text-foreground truncate">{mat.name}</span>
                            <span className="text-xs font-mono text-muted-foreground uppercase">{mat.sku}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end w-full md:w-1/3">
                          <div className="flex items-baseline gap-1">
                            <span className="font-mono text-2xl text-foreground font-bold">{Math.round(mat.balanceVolume).toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground">{mat.unit}</span>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">{t("inv_avg_cost")} <span className="font-mono text-foreground">{Math.round(mat.costAvg).toLocaleString()} FCFA</span> / {mat.unit}</span>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-1/3 justify-end">
                          <div className={`px-2.5 py-1 rounded flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                            {status.icon}
                            <span className="text-xs font-mono font-bold">{status.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-mono w-10 text-right shrink-0">0</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/50 z-10" style={{ left: `${Math.min(100, (mat.threshold / mat.maxValue) * 100)}%` }} />
                          <div className={`h-full transition-all duration-1000 ${fillPercentage < 25 ? 'bg-red-500' : fillPercentage < 50 ? 'bg-amber-500' : fillPercentage >= 90 ? 'bg-sky-500' : 'bg-emerald-500'}`} style={{ width: `${fillPercentage}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono w-10 shrink-0">{t("inv_max")}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-4">
            <motion.div className="flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden h-full shadow-sm">
              <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                <h3 className="font-display text-foreground font-bold text-lg">{t("inv_ledger")}</h3>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {inventoryLedger.map(entry => {
                  const mat = materials.find(m => m.id === entry.materialId)
                  const isRefill = entry.type === "REFILL"
                  return (
                    <div key={entry.id} className="p-4 border-b border-border/30 last:border-0 flex flex-col gap-2 hover:bg-muted/10 transition-colors rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {isRefill ? <DownloadSimple className="w-4 h-4 text-emerald-500" /> : <Archive className="w-4 h-4 text-amber-500" />}
                          <span className="font-medium text-sm text-foreground">{mat?.name || entry.materialId}</span>
                        </div>
                        <span className={`font-mono text-sm font-bold ${isRefill ? 'text-emerald-500' : 'text-foreground'}`}>
                          {isRefill ? '+' : '-'}{entry.quantity} {mat?.unit || 'Units'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="font-mono">{new Date(entry.timestamp).toLocaleDateString()}</span>
                        {isRefill && <span className="font-mono">{Math.round(entry.totalValue).toLocaleString()} FCFA total</span>}
                      </div>
                    </div>
                  )
                })}
                {inventoryLedger.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">{t("inv_ledger_empty")}</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ──────────────── FINISHED GOODS TAB ──────────────── */}
      {activeTab === "finished" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stock list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm"
            >
              <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                <h3 className="font-display text-foreground font-bold text-lg">{t("manager_inventory_finished_stock_title")}</h3>
              </div>
              <div className="flex flex-col divide-y divide-border/50">
                {finishedStock.map(item => {
                  const prod = products.find(p => p.id === item.productId)
                  return (
                    <div key={item.productId} className="p-6 hover:bg-muted/10 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-display font-bold text-foreground">{prod?.name || item.productId}</p>
                          <p className="text-xs text-muted-foreground font-mono">{prod?.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-mono text-xl font-bold text-foreground">{item.quantity}</p>
                          <p className="text-xs text-muted-foreground">{prod?.measureUnit || t("manager_inventory_finished_unit")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm text-foreground">{(item.totalValue / item.quantity).toFixed(0)} FCFA/u</p>
                          <p className="text-xs text-muted-foreground">{Math.round(item.totalValue).toLocaleString()} FCFA total</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {finishedStock.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground text-sm">
                    {t("manager_inventory_finished_empty")}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Sale history */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm"
            >
              <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                <h3 className="font-display text-foreground font-bold text-lg">{t("manager_inventory_finished_sales_title")}</h3>
                <CurrencyDollar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col divide-y divide-border/50">
                {saleHistory.slice(0, 10).map(txn => {
                  const prod = products.find(p => p.id === txn.productId)
                  const buyer = thirdParties.find(tp => tp.id === txn.buyerId)
                  return (
                    <div key={txn.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                          <CurrencyDollar className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{prod?.name || txn.productId}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(txn.timestamp).toLocaleDateString("fr-FR")}
                            {buyer && ` — ${buyer.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-foreground">-{txn.quantity} {prod?.measureUnit || "u"}</p>
                        <p className="text-xs text-muted-foreground">{txn.totalValue?.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  )
                })}
                {saleHistory.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">{t("manager_inventory_finished_sales_empty")}</div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right column: summary */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <motion.div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-foreground font-bold text-lg mb-4">{t("manager_inventory_finished_summary_title")}</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("manager_inventory_finished_summary_products")}</span>
                  <p className="text-3xl font-display font-bold text-foreground mt-1">{finishedStock.length}</p>
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("manager_inventory_finished_summary_quantity")}</span>
                  <p className="text-3xl font-display font-bold text-foreground mt-1">
                    {finishedStock.reduce((s, i) => s + i.quantity, 0)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("manager_inventory_finished_summary_value")}</span>
                  <p className="text-2xl font-display font-bold text-emerald-500 mt-1">
                    {finishedStock.reduce((s, i) => s + i.totalValue, 0).toLocaleString()} FCFA
                  </p>
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("manager_inventory_finished_summary_sales")}</span>
                  <p className="text-2xl font-display font-bold text-foreground mt-1">
                    {saleHistory.length} {t("manager_inventory_finished_summary_transaction_label")}{saleHistory.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      <AnimatePresence>
        {showRefillModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowRefillModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-lg pointer-events-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-8 overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <DownloadSimple className="w-6 h-6 text-emerald-500" weight="bold" />
                  </div>
                  <button onClick={() => setShowRefillModal(false)} className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-2xl font-display font-bold tracking-tight mb-2">{t("inv_refill_title")}</h2>
                <p className="text-muted-foreground text-sm mb-8">{t("inv_refill_desc")}</p>
                <form onSubmit={handleRefillSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("inv_refill_label_material")}</label>
                    <select value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none" required>
                      <option value="" disabled>{t("inv_refill_placeholder_material")}</option>
                      {materials.filter(mat => mat.balanceVolume < mat.maxValue * 0.9).map(mat => (
                        <option key={mat.id} value={mat.id}>{mat.name} ({mat.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("inv_refill_label_qty")}</label>
                    <div className="relative">
                      <input type="number" min="0.1" step="0.1" value={refillQty || ""}
                        onChange={(e) => setRefillQty(parseFloat(e.target.value))} placeholder="0.00"
                        className="w-full pl-4 pr-12 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground font-mono" required />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{t("inv_refill_unit")}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-4 bg-muted/30 border border-border/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("inv_refill_label_cost_mode")}</label>
                      <div className="flex bg-background border border-border rounded-lg p-1">
                        <button type="button" onClick={() => setCostMode("total")}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${costMode === 'total' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                          {t("inv_refill_option_invoice")}
                        </button>
                        <button type="button" onClick={() => setCostMode("per_unit")}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${costMode === 'per_unit' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                          {t("inv_refill_option_perunit")}
                        </button>
                      </div>
                    </div>
                    <div className="relative mt-2">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">FCFA</span>
                      <input type="number" min="0.01" step="0.01" value={costValue || ""}
                        onChange={(e) => setCostValue(parseFloat(e.target.value))} placeholder="0.00"
                        className="w-full px-4 pr-16 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground font-mono" required />
                    </div>
                  </div>
                  <button type="submit" disabled={!selectedMaterialId || refillQty <= 0 || costValue <= 0}
                    className="w-full mt-2 py-3.5 bg-emerald-500 text-emerald-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]">
                    {t("inv_refill_submit")}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {showProvisionModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowProvisionModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-lg pointer-events-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-8 overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Cube className="w-6 h-6 text-primary" weight="bold" />
                  </div>
                  <button onClick={() => setShowProvisionModal(false)} className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground tracking-tight mb-2">{t("inv_provision_title")}</h2>
                <p className="text-muted-foreground text-sm mb-6">{t("inv_provision_desc")}</p>
                <form onSubmit={handleProvisionSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("inv_provision_label_name")}</label>
                    <input type="text" value={newMatName} onChange={(e) => setNewMatName(e.target.value)}
                      placeholder={t("inv_provision_placeholder_name")}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm font-medium" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("inv_provision_label_threshold")}</label>
                      <input type="number" value={newMatThreshold || ""} onChange={(e) => setNewMatThreshold(parseFloat(e.target.value))}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm font-mono" required />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("inv_provision_label_max")}</label>
                      <input type="number" value={newMatMax || ""} onChange={(e) => setNewMatMax(parseFloat(e.target.value))}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm font-mono" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("inv_provision_label_unit")}</label>
                      <input type="text" value={newMatUnit} onChange={(e) => setNewMatUnit(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm" required />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("inv_provision_label_cost")}</label>
                      <input type="number" value={newMatCost || ""} onChange={(e) => setNewMatCost(parseFloat(e.target.value))}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm font-mono" required />
                    </div>
                  </div>
                  <button type="submit" disabled={!newMatName || newMatThreshold <= 0 || newMatMax <= 0}
                    className="w-full mt-2 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]">
                    {t("inv_provision_submit")}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {showSaleModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowSaleModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-lg pointer-events-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-8 overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CurrencyDollar className="w-6 h-6 text-emerald-500" weight="bold" />
                  </div>
                  <button onClick={() => setShowSaleModal(false)} className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground tracking-tight mb-2">{t("manager_inventory_finished_sale_title")}</h2>
                <p className="text-muted-foreground text-sm mb-6">{t("manager_inventory_finished_sale_desc")}</p>
                <form onSubmit={handleSaleSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("manager_inventory_finished_sale_label_product")}</label>
                    <select value={saleProductId} onChange={(e) => setSaleProductId(e.target.value)}
                      className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none" required>
                      <option value="" disabled>{t("manager_inventory_finished_sale_placeholder_product")}</option>
                      {finishedStock.map(item => {
                        const prod = products.find(p => p.id === item.productId)
                        return (
                          <option key={item.productId} value={item.productId}>
                            {prod?.name || item.productId} ({item.quantity} {t("manager_inventory_finished_sale_in_stock")})
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("manager_inventory_finished_sale_label_qty")}</label>
                    <input type="number" min="1" step="1" value={saleQty || ""}
                      onChange={(e) => setSaleQty(parseFloat(e.target.value) || 0)}
                      className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t("manager_inventory_finished_sale_label_buyer")} <span className="text-muted-foreground/60 font-normal normal-case">{t("manager_inventory_finished_sale_optional")}</span></label>
                    <select value={saleBuyerId} onChange={(e) => setSaleBuyerId(e.target.value)}
                      className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                      <option value="">{t("manager_inventory_finished_sale_placeholder_buyer")}</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {saleProductId && saleQty > 0 && (() => {
                    const stock = finishedStock.find(s => s.productId === saleProductId)
                    if (!stock || saleQty > stock.quantity) return (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-600 font-medium">
                        {t("manager_inventory_finished_sale_stock_insufficient")} ({stock?.quantity ?? 0} {t("manager_inventory_finished_sale_available")}{saleQty > (stock?.quantity ?? 0) ? "s" : ""})
                      </div>
                    )
                    const unitPrice = stock.totalValue / stock.quantity
                    return (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-foreground">{t("manager_inventory_finished_sale_total_estimated")}</span>
                        <span className="font-mono font-bold text-emerald-600">{(unitPrice * saleQty).toLocaleString()} FCFA</span>
                      </div>
                    )
                  })()}
                  <button type="submit" disabled={!saleProductId || saleQty <= 0}
                    className="w-full h-12 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <CurrencyDollar className="w-4 h-4" /> {t("manager_inventory_finished_sale_submit")}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
