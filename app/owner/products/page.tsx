"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMockData } from "@/providers/MockFeedProductionProvider"
import { Package, MagnifyingGlass, X, ArrowRight } from "@phosphor-icons/react"
import { useLanguage } from "@/providers/LanguageProvider"

export default function OwnerProducts() {
  const {
    products, boms, materials, lines, agencies,
    additionalCosts,
  } = useMockData()
  const { t } = useLanguage()

  const [search, setSearch] = useState("")
  const [filterAgencyId, setFilterAgencyId] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterAgencyId !== "all" && p.agencyId !== filterAgencyId) return false
    return true
  })

  const selected = selectedId ? products.find(p => p.id === selectedId) : null
  const selectedBom = selected ? boms.find(b => b.productId === selected.id) : null
  const selectedAgency = selected ? agencies.find(a => a.id === selected.agencyId) : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">{t("owner_products_title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {products.length} {t(products.length > 1 ? "owner_products_count_plural" : "owner_products_count_singular")} {t("owner_products_across")} {agencies.length} {t(agencies.length > 1 ? "owner_products_agencies_plural" : "owner_products_agency_singular")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("owner_products_search")}
            className="w-full h-10 pl-9 pr-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <select value={filterAgencyId} onChange={e => setFilterAgencyId(e.target.value)}
          className="h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none">
          <option value="all">{t("owner_products_all_agencies")}</option>
          {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

       {/* Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
         {filtered.length === 0 ? (
           <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
             <Package className="w-12 h-12 mb-3 opacity-30" />
             <p className="text-sm">{t("owner_products_empty")}</p>
           </div>
         ) : (
           filtered.map(p => {
             const bom = boms.find(b => b.productId === p.id)
             const agency = agencies.find(a => a.id === p.agencyId)
             const totalCost = bom?.lines.reduce((sum, l) => {
               const mat = materials.find(m => m.id === l.materialId)
               return sum + (mat?.costAvg ?? 0) * l.quantityPerUnit
             }, 0) ?? 0
             const margin = p.price > 0 ? ((p.price - totalCost) / p.price * 100).toFixed(0) : "—"

             return (
               <button key={p.id} onClick={() => setSelectedId(p.id)}
                 className="text-left bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all group">
                 <div className="flex items-start gap-3 mb-4">
                   <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                     <Package weight="duotone" className="w-5 h-5 text-primary" />
                   </div>
                   <div className="min-w-0">
                     <h3 className="text-base font-display font-bold text-foreground truncate">{p.name}</h3>
                     <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4 text-xs text-muted-foreground">
                   <span>{t("owner_products_price")} <strong className="text-foreground">{p.price.toLocaleString()} FCFA</strong></span>
                   <span>{t("owner_products_margin")} <strong className={Number(margin) > 20 ? "text-emerald-500" : "text-amber-500"}>{margin}%</strong></span>
                 </div>
                 <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                   <span className="text-xs text-muted-foreground">{agency?.name ?? "—"}</span>
                   <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                 </div>
               </button>
             )
           })
         )}
       </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={() => setSelectedId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-2xl pointer-events-auto max-h-[85vh] overflow-y-auto"
            >
              <div className="rounded-3xl bg-card border border-border shadow-lg p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">{selected.name}</h2>
                    <p className="text-xs text-muted-foreground font-mono">{selected.sku} &middot; {selectedAgency?.name}</p>
                  </div>
                  <button onClick={() => setSelectedId(null)}
                    className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <span className="block text-lg font-display font-bold text-foreground">{selected.price.toLocaleString()} FCFA</span>
                    <span className="text-xs text-muted-foreground">{t("owner_products_selling_price")}</span>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <span className="block text-lg font-display font-bold text-foreground">{selected.targetMargin ?? "—"}%</span>
                    <span className="text-xs text-muted-foreground">{t("owner_products_target_margin")}</span>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <span className="block text-lg font-display font-bold text-foreground">{selected.finalMass ?? "—"} {selected.measureUnit ?? ""}</span>
                    <span className="text-xs text-muted-foreground">{t("owner_products_unit_weight")}</span>
                  </div>
                </div>

                {/* BOM */}
                {selectedBom && (
                  <div className="mb-6">
                    <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">{t("owner_products_bom_title")}</h3>
                    <div className="bg-muted rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                            <th className="p-3 font-mono font-bold">{t("owner_products_bom_material")}</th>
                            <th className="p-3 font-mono font-bold">{t("owner_products_bom_qty")}/{selectedBom.unit === "pct" ? t("owner_products_bom_per_bag") : t("owner_products_bom_per_unit")}</th>
                            <th className="p-3 font-mono font-bold">{t("owner_products_bom_unit_cost")}</th>
                            <th className="p-3 font-mono font-bold">{t("owner_products_bom_subtotal")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBom.lines.map(l => {
                            const mat = materials.find(m => m.id === l.materialId)
                            const sub = (mat?.costAvg ?? 0) * l.quantityPerUnit
                            return (
                              <tr key={l.materialId} className="border-b border-border/20">
                                <td className="p-3 text-foreground">{mat?.name ?? l.materialId}</td>
                                <td className="p-3 text-muted-foreground">{l.quantityPerUnit} {mat?.unit ?? ""}</td>
                                <td className="p-3 text-muted-foreground">{mat?.costAvg.toFixed(0) ?? "—"} FCFA</td>
                                <td className="p-3 text-foreground font-mono">{sub.toFixed(0)} FCFA</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Routing */}
                {selected.routing && selected.routing.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">{t("owner_products_routing_title")}</h3>
                    <div className="flex flex-col gap-2">
                      {selected.routing.map((step, i) => {
                        const mac = lines.flatMap(l => l.machineIds.includes(step.machineId) ? [step.machineId] : []).join(", ")
                        return (
                          <div key={i} className="flex items-center gap-3 bg-muted rounded-lg p-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{step.sequence}</span>
                            <span className="text-sm text-foreground flex-1">Machine: {step.machineId}</span>
                            <span className="text-xs text-muted-foreground">{step.timeInHours}h</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Additional costs */}
                {selected.additionalCosts && selected.additionalCosts.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">{t("owner_products_additional_costs_title")}</h3>
                    <div className="flex flex-col gap-1.5">
                      {selected.additionalCosts.map(ac => {
                        const cost = additionalCosts.find(c => c.id === ac.costId)
                        return (
                          <div key={ac.costId} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{cost?.name ?? ac.costId}</span>
                            <span className="text-muted-foreground font-mono">{ac.provisionalValue.toLocaleString()} FCFA</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {!selectedBom && !selected.routing && (!selected.additionalCosts || selected.additionalCosts.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucune donnée technique disponible pour ce {t("owner_products_count_singular")}.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
