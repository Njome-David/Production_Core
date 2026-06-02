"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Archive, Plus, Cube, WarningCircle, CheckCircle, Warning, FileText, DownloadSimple, X } from "@phosphor-icons/react"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { useLanguage } from "@/providers/LanguageProvider"
import { t } from "@/lib/i18n"
import { getProjectedStock } from "@/lib/production-calculations"

export default function InventoryPage() {
  const { materials, recordInventoryTransaction, inventoryLedger, addMaterial, activeMOs, boms } = useMockData()
  const { language } = useLanguage()
  const [showRefillModal, setShowRefillModal] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("")
  const [refillQty, setRefillQty] = useState<number>(0)
  const [costMode, setCostMode] = useState<"total" | "per_unit">("total")
  const [costValue, setCostValue] = useState<number>(0)
  const [showShortfallOnly, setshowShortfallOnly] = useState(false)

  // Provisioning state
  const [showProvisionModal, setShowProvisionModal] = useState(false)
  const [newMatName, setNewMatName] = useState("")
  const [newMatThreshold, setNewMatThreshold] = useState<number>(1000)
  const [newMatMax, setNewMatMax] = useState<number>(10000)
  const [newMatUnit, setNewMatUnit] = useState<string>("Kg")
  const [newMatCost, setNewMatCost] = useState<number>(350)
  const [newMatNote, setNewMatNote] = useState("")

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
      note: newMatNote
    })

    setShowProvisionModal(false)
    setNewMatName("")
    setNewMatThreshold(1000)
    setNewMatMax(10000)
    setNewMatCost(350)
    setNewMatNote("")
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

  const getStatusIndicator = (qty: number, threshold: number, maxValue: number) => {
    if (qty <= threshold) return { icon: <WarningCircle weight="fill" className="text-red-500 w-5 h-5" />, label: t(language, 'shortfall'), color: "text-red-500", bg: "bg-red-500/10" }
    if (qty <= threshold * 1.5) return { icon: <Warning weight="fill" className="text-amber-500 w-5 h-5" />, label: t(language, 'warning'), color: "text-amber-500", bg: "bg-amber-500/10" }
    if (qty >= maxValue * 0.9) return { icon: <Archive weight="fill" className="text-sky-500 w-5 h-5" />, label: t(language, 'oversaturated'), color: "text-sky-500", bg: "bg-sky-500/10" }
    return { icon: <CheckCircle weight="fill" className="text-emerald-500 w-5 h-5" />, label: t(language, 'healthy-stock'), color: "text-emerald-500", bg: "bg-emerald-500/10" }
  }

  const displayedMaterials = showShortfallOnly
    ? materials.filter(m => m.balanceVolume <= m.threshold)
    : materials

  const committedDemandByMaterial = React.useMemo(() => {
    return activeMOs
      .filter(mo => mo.status === "PENDING" || mo.status === "IN_PROGRESS")
      .reduce<Record<string, number>>((acc, mo) => {
        const bom = boms.find(item => item.productId === mo.productId)
        bom?.lines.forEach(line => {
          acc[line.materialId] = (acc[line.materialId] ?? 0) + line.quantityPerUnit * mo.targetQty
        })
        return acc
      }, {})
  }, [activeMOs, boms])

  return (
    <div className="w-full flex flex-col gap-8 pb-12 relative min-h-[calc(100dvh-64px)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6 }}
          className="max-w-xl"
        >
          <h1 className="text-4xl font-display text-foreground font-bold tracking-tight mb-2">{t(language, 'inventory-ledger')}</h1>
          <p className="text-muted-foreground text-lg">{t(language, 'inventory-desc')}</p>
        </motion.div>

        <div className="flex gap-2">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setshowShortfallOnly(!showShortfallOnly)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-colors ${showShortfallOnly ? 'bg-red-500 text-white' : 'bg-card border border-border text-foreground hover:bg-muted'}`}
          >
            <Archive weight="bold" className="w-5 h-5" />
            {t(language, 'low-stock-only')}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowProvisionModal(true)}
            className="flex items-center gap-2 bg-card border border-border text-foreground px-5 py-3 rounded-xl font-bold hover:bg-muted transition-colors"
          >
            <Plus weight="bold" className="w-5 h-5" />
            {t(language, 'provision-material')}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowRefillModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:bg-primary/90 transition-colors"
          >
            <DownloadSimple weight="bold" className="w-5 h-5" />
            {t(language, 'log-refill')}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Material Balance Ledger */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.1 }}
            className="flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden shadow-sm"
          >
            <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <h3 className="font-display text-foreground font-bold text-lg">{t(language, 'raw-material')}</h3>
            </div>

            <div className="flex flex-col divide-y divide-border/50">
              {displayedMaterials.map(mat => {
                const status = getStatusIndicator(mat.balanceVolume, mat.threshold, mat.maxValue)
                const fillPercentage = Math.min(100, Math.max(0, (mat.balanceVolume / mat.maxValue) * 100))
                const projection = getProjectedStock(mat, committedDemandByMaterial[mat.id] ?? 0)

                return (
                  <div key={mat.id} className="p-6 hover:bg-muted/10 transition-colors flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                      {/* Name & SKU */}
                      <div className="flex items-center gap-4 w-full md:w-1/3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Cube className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-foreground truncate">{mat.name}</span>
                          <span className="text-xs font-mono text-muted-foreground uppercase">{mat.sku}</span>
                        </div>
                      </div>

                      {/* Stock Info */}
                      <div className="flex flex-col items-end w-full md:w-1/3">
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono text-2xl text-foreground font-bold">{Math.round(mat.balanceVolume).toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">{mat.unit}</span>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">{t(language, 'avg-cost')} <span className="font-mono text-foreground">{Math.round(mat.costAvg).toLocaleString()} FCFA</span> / {mat.unit}</span>
                        <span className="text-xs text-muted-foreground">{t(language, 'threshold')} <span className="font-mono text-red-500">{Math.round(mat.threshold).toLocaleString()}</span> / {t(language, 'max')} <span className="font-mono text-red-500">{Math.round(mat.maxValue).toLocaleString()}</span></span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-3 w-full md:w-1/3 justify-end">
                        <div className={`px-2.5 py-1 rounded flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                          {status.icon}
                          <span className="text-xs font-mono font-bold">{status.label}</span>
                        </div>
                      </div>

                    </div>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono w-10 text-right shrink-0">0</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                        {/* Threshold Marker */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/50 z-10" style={{ left: `${Math.min(100, (mat.threshold / mat.maxValue) * 100)}%` }} />
                        <div
                          className={`h-full transition-all duration-1000 ${fillPercentage < 25 ? 'bg-red-500' : fillPercentage < 50 ? 'bg-amber-500' : fillPercentage >= 90 ? 'bg-sky-500' : 'bg-emerald-500'}`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono w-10 shrink-0">{language === 'fr' ? 'MAX' : 'MAX'}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                        <span className="block text-muted-foreground uppercase font-mono">{t(language, 'forecast-consumption')}</span>
                        <span className="font-mono font-bold text-red-500">{projection.forecast.toLocaleString()} {mat.unit}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                        <span className="block text-muted-foreground uppercase font-mono">{t(language, 'open-mo-demand')}</span>
                        <span className="font-mono font-bold text-red-500">{(committedDemandByMaterial[mat.id] ?? 0).toLocaleString()} {mat.unit}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                        <span className="block text-muted-foreground uppercase font-mono">{t(language, 'projected-stock')}</span>
                        <span className={`font-mono font-bold ${projection.isBelowThreshold ? "text-red-500" : "text-foreground"}`}>{projection.projectedBalance.toLocaleString()} {mat.unit}</span>
                      </div>
                    </div>

                    {mat.note && (
                      <p className="text-xs text-muted-foreground border-l-2 border-border pl-3">{mat.note}</p>
                    )}

                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0.6, delay: 0.2 }}
            className="flex flex-col border border-border/50 rounded-2xl bg-card overflow-hidden h-full shadow-sm"
          >
            <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <h3 className="font-display text-foreground font-bold text-lg">{t(language, 'transaction-ledger')}</h3>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {inventoryLedger.map(entry => {
                const mat = materials.find(m => m.id === entry.materialId)
                const isRefill = entry.type === "REFILL"
                const unitWord = mat?.unit || (language === 'fr' ? 'Unités' : 'Units')

                return (
                  <div key={entry.id} className="p-4 border-b border-border/30 last:border-0 flex flex-col gap-2 hover:bg-muted/10 transition-colors rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {isRefill ? <DownloadSimple className="w-4 h-4 text-emerald-500" /> : <Archive className="w-4 h-4 text-amber-500" />}
                        <span className="font-medium text-sm text-foreground">{mat?.name || entry.materialId}</span>
                      </div>
                      <span className={`font-mono text-sm font-bold ${isRefill ? 'text-emerald-500' : 'text-foreground'}`}>
                        {isRefill ? '+' : '-'}{entry.quantity} {unitWord}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span className="font-mono">{new Date(entry.timestamp).toLocaleDateString()}</span>
                      {isRefill && <span className="font-mono">{Math.round(entry.totalValue).toLocaleString()} FCFA {language === 'fr' ? 'total' : 'total'}</span>}
                    </div>
                  </div>
                )
              })}
              {inventoryLedger.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  {t(language, 'no-transactions')}
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>

      {/* Manual Refill Modal overlay */}
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
                  <button
                    onClick={() => setShowRefillModal(false)}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
                  {language === "fr" ? "Enregistrer le lot fournisseur" : "Register Vendor Batch"}
                </h2>
                <p className="text-muted-foreground text-sm mb-8">
                  {language === "fr"
                    ? "Enregistrez les matières premières entrantes. Le moteur de tarification moyenne moyenne mobile recalculera automatiquement."
                    : "Log inbound raw materials. The moving average pricing engine will automatically recalculate."}
                </p>

                <form onSubmit={handleRefillSubmit} className="flex flex-col gap-6">
                  {/* Material Selection */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                      {language === "fr" ? "Sélectionner la matière" : "Select Material"}
                    </label>
                    <select
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none"
                      required
                    >
                      <option value="" disabled>-- {language === "fr" ? "Sélectionner une matière" : "Select a material"} --</option>
                      {materials.filter(mat => mat.balanceVolume < mat.maxValue * 0.9).map(mat => (
                        <option key={mat.id} value={mat.id}>{mat.name} ({mat.sku})</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                      {language === "fr" ? "Quantité du lot" : "Batch Quantity"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={refillQty || ""}
                        onChange={(e) => setRefillQty(parseFloat(e.target.value))}
                        placeholder="0.00"
                        className="w-full pl-4 pr-12 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-mono"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        {language === "fr" ? "Unités" : "Units"}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Engine Input */}
                  <div className="flex flex-col gap-2 p-4 bg-muted/30 border border-border/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                        {language === "fr" ? "Mode d'évaluation des coûts" : "Cost Assessment Mode"}
                      </label>
                      <div className="flex bg-background border border-border rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => setCostMode("total")}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${costMode === 'total' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          {language === "fr" ? "Facture totale" : "Total Invoice"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCostMode("per_unit")}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${costMode === 'per_unit' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          {language === "fr" ? "Par unité" : "Per Unit"}
                        </button>
                      </div>
                    </div>

                    <div className="relative mt-2">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">FCFA</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={costValue || ""}
                        onChange={(e) => setCostValue(parseFloat(e.target.value))}
                        placeholder="0.00"
                        className="w-full px-4 pr-16 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedMaterialId || refillQty <= 0 || costValue <= 0}
                    className="w-full mt-2 py-3.5 bg-emerald-500 text-emerald-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
                  >
                    {language === "fr" ? "Valider dans le registre" : "Commit to Ledger"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Provision New Material Modal */}
      <AnimatePresence>
        {showProvisionModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
                  <button
                    onClick={() => setShowProvisionModal(false)}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-2xl font-display font-bold tracking-tight mb-2">{t(language, 'provision-material')}</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  {language === "fr"
                    ? "Enregistrez une nouvelle matière première. Un ID et un SKU seront calculés dynamiquement."
                    : "Register a brand new raw feedstock material. An ID and SKU will be dynamically computed."}
                </p>

                <form onSubmit={handleProvisionSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                      {language === "fr" ? "Nom de la matière" : "Material Name"}
                    </label>
                    <input
                      type="text"
                      value={newMatName}
                      onChange={(e) => setNewMatName(e.target.value)}
                      placeholder="e.g. Yellow Dent Corn"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-sm font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                        {language === "fr" ? "Quantité seuil" : "Threshold Qty"}
                      </label>
                      <input
                        type="number"
                        value={newMatThreshold || ""}
                        onChange={(e) => setNewMatThreshold(parseFloat(e.target.value))}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-sm font-mono"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                        {language === "fr" ? "Capacité maximale" : "Max Capacity"}
                      </label>
                      <input
                        type="number"
                        value={newMatMax || ""}
                        onChange={(e) => setNewMatMax(parseFloat(e.target.value))}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-sm font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                        {language === "fr" ? "Unité" : "Unit"}
                      </label>
                      <input
                        type="text"
                        value={newMatUnit}
                        onChange={(e) => setNewMatUnit(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-sm"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                        {language === "fr" ? "Coût est. / unité (FCFA)" : "Est Cost/Unit (FCFA)"}
                      </label>
                      <input
                        type="number"
                        value={newMatCost || ""}
                        onChange={(e) => setNewMatCost(parseFloat(e.target.value))}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-sm font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{t(language, 'note')}</label>
                    <textarea
                      value={newMatNote}
                      onChange={(e) => setNewMatNote(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newMatName || newMatThreshold <= 0 || newMatMax <= 0}
                    className="w-full mt-2 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
                  >
                    {language === "fr" ? "Enregistrer" : "Save"}
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
