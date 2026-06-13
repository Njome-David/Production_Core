"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

type Language = "en" | "fr" | "es"

export const dictionary = {
  en: {
    header_signIn: "Sign In",
    hero_badge: "PROD_CORE Engine v2.0 Live",
    hero_title1: "Production management,",
    hero_title2: "made effortlessly simple.",
    hero_desc: "The people's choice for modern manufacturing. Whether you're a small business, an individual producer, or a growing enterprise, we bring absolute clarity and ease to your entire workflow.",
    hero_btn_enter: "Get Started",
    hero_btn_explore: "Explore Modules",

    stats_uptime: "UPTIME",
    stats_processed: "UNITS PROCESSED",
    stats_facilities: "ACTIVE FACILITIES",
    stats_defect: "DEFECT RATE",
    stats_sessions: "ACTIVE SESSIONS",
    stats_latency: "LATENCY",

    mod_dashboard_title: "Live Dashboard & Financial Insights",
    mod_dashboard_desc1: "Intelligent selling price suggestions based on real-time data.",
    mod_dashboard_desc2: "Track additional costs accurately to avoid any unexpected surprises at the end of the month.",
    mod_dashboard_desc3: "Detailed per-product revenue, cost, and margin tracking.",

    mod_inventory_title: "Inventory & Config Studio",
    mod_inventory_desc: "Gain complete visibility over your entire facility. Manage your resources, build complex Bills of Materials, and organize your production routing perfectly.",

    mod_operator_title: "Functional Operator Tablet",
    mod_operator_desc: "Empower operators with real-time management of the production chain directly through the app. View all active orders queued for a particular machine. With manager-assigned shifts, every operator logging in knows exactly where to go and what to produce.",

    mod_multitenant_title: "Seamless Multi-Organization",
    mod_multitenant_desc: "Work across multiple organizations without needing separate logins. Use the exact same account across different workspaces and facilities effortlessly.",

    footer_copy: "© 2026 PROD_CORE. The people's choice for modern manufacturing.",

    cta_badge: "Ready to transform your production?",
    cta_title: "Start building smarter, today.",
    cta_desc: "Join thousands of facilities already running PROD_CORE. No complexity, no bloat — just results.",
    cta_btn_start: "Get Started Free",
    cta_btn_modules: "Explore Modules",
  },
  fr: {
    header_signIn: "Se Connecter",
    hero_badge: "Moteur PROD_CORE v2.0 en Ligne",
    hero_title1: "La gestion de production,",
    hero_title2: "rendue incroyablement simple.",
    hero_desc: "Le choix par excellence pour la production moderne. Que vous soyez une petite entreprise, un producteur individuel ou une grande structure, nous apportons une clarité absolue à votre flux de travail.",
    hero_btn_enter: "Commencer",
    hero_btn_explore: "Explorer les Modules",

    stats_uptime: "DISPONIBILITÉ",
    stats_processed: "UNITÉS TRAITÉES",
    stats_facilities: "INSTALLATIONS ACTIVES",
    stats_defect: "TAUX DE DÉFAUT",
    stats_sessions: "SESSIONS ACTIVES",
    stats_latency: "LATENCE",

    mod_dashboard_title: "Tableau de Bord & Aperçus Financiers",
    mod_dashboard_desc1: "Suggestions de prix de vente intelligentes basées sur des données en temps réel.",
    mod_dashboard_desc2: "Suivez les coûts supplémentaires avec précision pour éviter les surprises en fin de mois.",
    mod_dashboard_desc3: "Suivi détaillé des revenus, coûts et marges par produit.",

    mod_inventory_title: "Inventaire & Studio de Configuration",
    mod_inventory_desc: "Gagnez une visibilité complète sur toute votre installation. Gérez vos ressources, construisez des nomenclatures complexes et organisez vos itinéraires de production.",

    mod_operator_title: "Tablette Opérateur Fonctionnelle",
    mod_operator_desc: "Permettez aux opérateurs de gérer la chaîne de production en temps réel via l'application. Consultez toutes les commandes actives d'une machine spécifique. Les managers assignent les équipes, de sorte que chaque opérateur qui se connecte sait exactement où aller et quoi produire.",

    mod_multitenant_title: "Multi-Organisation Fluide",
    mod_multitenant_desc: "Travaillez sur plusieurs organisations sans avoir besoin d'identifiants séparés. Utilisez exactement le même compte dans différents espaces de travail sans effort.",

    footer_copy: "© 2026 PROD_CORE. Le choix incontournable pour la production moderne.",

    cta_badge: "Prêt à transformer votre production ?",
    cta_title: "Commencez à produire plus intelligemment, dès aujourd'hui.",
    cta_desc: "Des milliers d'installations utilisent déjà PROD_CORE. Pas de complexité, pas de superflu — que des résultats.",
    cta_btn_start: "Démarrer Gratuitement",
    cta_btn_modules: "Explorer les Modules",
  },
  es: {
    header_signIn: "Iniciar sesión",
    hero_badge: "Motor PROD_CORE v2.0 en Vivo",
    hero_title1: "Gestión de producción,",
    hero_title2: "hecha increíblemente simple.",
    hero_desc: "La opción preferida para la fabricación moderna. Tanto si eres una pequeña empresa, un productor individual o una gran empresa, aportamos claridad total a tu flujo de trabajo.",
    hero_btn_enter: "Comenzar",
    hero_btn_explore: "Explorar Módulos",

    stats_uptime: "DISPONIBILIDAD",
    stats_processed: "UNIDADES PROCESADAS",
    stats_facilities: "INSTALACIONES ACTIVAS",
    stats_defect: "TASA DE DEFECTOS",
    stats_sessions: "SESIONES ACTIVAS",
    stats_latency: "LATENCIA",

    mod_dashboard_title: "Dashboard en Vivo e Insights Financieros",
    mod_dashboard_desc1: "Sugerencias inteligentes de precio de venta basadas en datos en tiempo real.",
    mod_dashboard_desc2: "Registra costos adicionales con precisión para evitar sorpresas a fin de mes.",
    mod_dashboard_desc3: "Seguimiento detallado de ingresos, costos y márgenes por producto.",

    mod_inventory_title: "Inventario y Estudio de Configuración",
    mod_inventory_desc: "Obtén visibilidad completa de toda tu instalación. Gestiona recursos, crea Bills of Materials complejas y organiza tu enrutamiento de producción.",

    mod_operator_title: "Tableta de Operador Funcional",
    mod_operator_desc: "Permite a los operadores gestionar la cadena de producción en tiempo real. Visualiza todas las órdenes activas de una máquina. Con turnos asignados por el manager, cada operador sabe exactamente dónde ir y qué producir.",

    mod_multitenant_title: "Multi-Organización sin Fricción",
    mod_multitenant_desc: "Trabaja en múltiples organizaciones sin necesitar inicios de sesión separados. Usa exactamente la misma cuenta en diferentes espacios de trabajo sin esfuerzo.",

    footer_copy: "© 2026 PROD_CORE. La opción preferida para la fabricación moderna.",

    cta_badge: "¿Listo para transformar tu producción?",
    cta_title: "Empieza a producir de forma más inteligente, hoy.",
    cta_desc: "Miles de instalaciones ya usan PROD_CORE. Sin complejidad, sin excesos — solo resultados.",
    cta_btn_start: "Comenzar Gratis",
    cta_btn_modules: "Explorar Módulos",
  }
}

type DictionaryKeys = keyof typeof dictionary.en

interface LanguageContextProps {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: DictionaryKeys) => string
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: DictionaryKeys) => {
    return dictionary[language][key]
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
