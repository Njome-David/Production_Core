// lib/permissions.ts
import type { Permission, CustomRole } from "./types"

export const ALL_PERMISSIONS: Permission[] = [
  // Produits
  { id: "perm_1", key: "product:read", label: "Voir les produits", description: "Consulter la liste et le détail des produits", category: "Produits" },
  { id: "perm_2", key: "product:create", label: "Créer des produits", description: "Ajouter de nouveaux produits à l'inventaire", category: "Produits" },
  { id: "perm_3", key: "product:edit", label: "Modifier des produits", description: "Éditer les informations des produits existants", category: "Produits" },

  // Employés
  { id: "perm_4", key: "employee:read", label: "Voir les employés", description: "Consulter la liste des employés", category: "Employés" },
  { id: "perm_5", key: "employee:create", label: "Créer des employés", description: "Ajouter de nouveaux employés", category: "Employés" },
  { id: "perm_6", key: "employee:edit", label: "Modifier des employés", description: "Éditer les informations des employés", category: "Employés" },

  // Stocks
  { id: "perm_7", key: "stock:read_raw", label: "Voir stocks matières premières", description: "Consulter les stocks de matières premières", category: "Stocks" },
  { id: "perm_8", key: "stock:read_finished", label: "Voir stocks produits finis", description: "Consulter les stocks de produits finis", category: "Stocks" },
  { id: "perm_9", key: "stock:manage_raw", label: "Gérer achats matières premières", description: "Effectuer des achats de réapprovisionnement", category: "Stocks" },
  { id: "perm_10", key: "stock:manage_finished", label: "Gérer ventes produits finis", description: "Enregistrer des ventes de produits finis", category: "Stocks" },

  // Machines
  { id: "perm_11", key: "machine:read", label: "Voir les machines", description: "Consulter la liste des machines", category: "Machines" },
  { id: "perm_12", key: "machine:assign", label: "Assigner des opérateurs", description: "Assigner des opérateurs aux machines", category: "Machines" },
  { id: "perm_13", key: "machine:configure", label: "Configurer les machines", description: "Modifier les paramètres des machines", category: "Machines" },

  // Commandes
  { id: "perm_14", key: "orders:read", label: "Voir les commandes", description: "Consulter les ordres de fabrication", category: "Commandes" },
  { id: "perm_15", key: "orders:create", label: "Lancer des commandes", description: "Créer et lancer des ordres de fabrication", category: "Commandes" },
  { id: "perm_16", key: "orders:finalize", label: "Finaliser des commandes", description: "Finaliser les ordres de fabrication terminés", category: "Commandes" },

  // Agences
  { id: "perm_17", key: "agency:read", label: "Voir les agences", description: "Consulter la liste des agences", category: "Agences" },
  { id: "perm_18", key: "agency:create", label: "Créer des agences", description: "Ajouter de nouvelles agences", category: "Agences" },
  { id: "perm_19", key: "agency:edit", label: "Modifier les agences", description: "Éditer les informations des agences", category: "Agences" },

  // Tiers
  { id: "perm_20", key: "thirdparty:read", label: "Voir les tiers", description: "Consulter la liste des fournisseurs et clients", category: "Tiers" },
  { id: "perm_21", key: "thirdparty:create", label: "Ajouter des tiers", description: "Ajouter de nouveaux fournisseurs ou clients", category: "Tiers" },

  // Statistiques
  { id: "perm_22", key: "statistics:view", label: "Voir les statistiques", description: "Accéder aux graphiques et indicateurs", category: "Statistiques" },

  // Paramètres
  { id: "perm_23", key: "settings:edit", label: "Modifier les paramètres", description: "Modifier les paramètres généraux de l'application", category: "Paramètres" },

  // Rôles
  { id: "perm_24", key: "roles:manage", label: "Gérer les rôles", description: "Créer et modifier les rôles personnalisés", category: "Rôles" },

  // Abonnement
  { id: "perm_25", key: "subscription:manage", label: "Gérer l'abonnement", description: "Changer de forfait ou mode de paiement", category: "Abonnement" },
]

export const DEFAULT_ROLES: Pick<CustomRole, "name" | "permissions" | "isDefault">[] = [
  {
    name: "Responsable d'Agence",
    isDefault: true,
    permissions: [
      "product:read", "product:edit",
      "employee:read",
      "stock:read_raw", "stock:read_finished",
      "stock:manage_raw", "stock:manage_finished",
      "machine:read", "machine:assign",
      "orders:read", "orders:create", "orders:finalize",
      "thirdparty:read",
      "statistics:view",
      "settings:edit",
    ],
  },
  {
    name: "Opérateur",
    isDefault: true,
    permissions: [
      "product:read",
      "machine:read",
      "orders:read",
    ],
  },
]

export function roleHasPermission(role: Pick<CustomRole, "permissions">, permissionKey: string): boolean {
  return role.permissions.includes(permissionKey)
}
