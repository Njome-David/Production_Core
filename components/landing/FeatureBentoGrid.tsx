"use client"

import React from "react"
import { motion } from "framer-motion"
import { ChartLineUp, DeviceTablet, ShieldCheck, Factory } from "@phosphor-icons/react"

const features = [
  {
    title: "Executive Config Studio",
    description: "Plan production runs, manage BOMs, and analyze financial KPIs in a centralized dashboard. Gain complete visibility over your entire facility.",
    icon: ChartLineUp,
    className: "md:col-span-2 bg-card border border-border shadow-sm p-8 md:p-12 rounded-[2rem] flex flex-col justify-between overflow-hidden relative group",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Production facility management"
  },
  {
    title: "Resilient Operator Tablet",
    description: "A touch-first, chaos-resistant interface for the factory floor. Keep your operators focused on output, not fighting with software.",
    icon: DeviceTablet,
    className: "md:col-span-1 bg-foreground text-background shadow-sm p-8 md:p-12 rounded-[2rem] flex flex-col justify-between group",
  },
  {
    title: "Independent Quality Gates",
    description: "Decouple inspections from physical machines. Route work orders through strict quality checkpoints seamlessly, ensuring zero defects.",
    icon: ShieldCheck,
    className: "md:col-span-3 bg-card border border-border shadow-sm p-8 md:p-12 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 md:gap-16 overflow-hidden relative group",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Quality control inspection"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 }
  }
}

export function FeatureBentoGrid() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
      <div className="mb-16 md:mb-24 max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-foreground leading-tight mb-6">
          The people's choice for modern manufacturing.
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Whether you're a small business, an individual producer, or a large-scale facility, PROD_CORE adapts to your workflow to maximize productivity and eliminate waste.
        </p>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {features.map((feature, i) => (
          <motion.div key={i} variants={itemVariants} className={feature.className}>
            <div className="relative z-10 flex flex-col gap-6 h-full">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.className.includes('bg-foreground') ? 'bg-background/10 text-background' : 'bg-muted text-foreground'}`}>
                <feature.icon weight="duotone" className="w-7 h-7" />
              </div>
              <div className="mt-auto pt-12 md:pt-24">
                <h3 className="text-2xl font-display font-bold tracking-tight mb-3">
                  {feature.title}
                </h3>
                <p className={`text-base leading-relaxed ${feature.className.includes('bg-foreground') ? 'text-background/80' : 'text-muted-foreground'}`}>
                  {feature.description}
                </p>
              </div>
            </div>
            
            {feature.image && (
              <div className="absolute inset-0 z-0 overflow-hidden rounded-[2rem] opacity-20 dark:opacity-30 group-hover:opacity-30 transition-opacity duration-500">
                <img 
                  src={feature.image} 
                  alt={feature.imageAlt} 
                  className="w-full h-full object-cover grayscale mix-blend-multiply dark:mix-blend-overlay group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
