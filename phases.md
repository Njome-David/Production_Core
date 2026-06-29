# Plan de Migration — Architecture Multi-Rôles PROD_CORE

## Résumé du Changement

Passage d'une structure plate (Manager + Opérateur, fausse auth) à une architecture
multi-tenant complète avec 3 rôles, authentification réelle (mock), agences,
et gestion d'entreprise.

### Nouveaux Rôles

| Rôle | Description | Remplace |
|------|-------------|----------|
| **Chef d'entreprise** (owner) | Crée l'entreprise, gère agences/employés/abonnement | — |
| **Responsable d'agence** (manager) | Gère une ou plusieurs agences au quotidien | Manager actuel |
| **Opérateur** (operator) | Exécute la production sur les machines assignées | Opérateur actuel |

### Dépendances entre phases

```
Phase 1 (Data Model)
    │
    ▼
Phase 2 (Auth & Sessions)
    │
    ▼
Phase 3 (Navigation & Shells)
    │
    ├─────────────────────┐
    ▼                     ▼
Phase 4 (Owner Pages)   Phase 5 (Manager Updates)
    │                     │
    └─────────┬───────────┘
              ▼
        Phase 6 (Operator)
              │
              ▼
        Phase 7 (i18n)
              │
              ▼
        Phase 8 (Polish)
```

Les phases 4, 5 et 6 sont indépendantes entre elles (mêmes prérequis, shells différents).

---

## Phase 1 — Foundation : Data Model & Seed Data

**Objectif** : Créer la fondation de données sans rien casser.

### Tâches

1.1 **Créer `lib/types.ts`**
- Extraire tous les types existants de `lib/mock-db.ts`
- Ajouter : `User`, `Organization`, `Agency`, `Employee`, `ThirdParty`,
  `Permission`, `CustomRole`, `Subscription`, `MachineAssignment`,
  `FinishedGoodsTransaction`
- Ajouter `orgId` à `Material`
- Ajouter `agencyId` à `Machine`, `Product`, `ProductionLine`
- Ajouter `originAgencyId` à `ManufacturingOrder`
- Renommer l'ancien `UserRole` en `SessionRole` (garder `"Manager"|"Operator"`)
- Nouveau `UserRole` : `"owner" | "manager" | "operator"`

1.2 **Réécrire `lib/mock-db.ts`**
- Importer les types depuis `./types`
- Ré-exporter tous les types (backward compat)
- Conserver intacts tous les seeds existants (Materials, Products, BOMs, etc.)
- Ajouter `agencyId` aux données seed existantes
- Ajouter seeds : 5 Users, 1 Organization, 3 Agencies, 5 Employees,
  15 Permissions, 2 CustomRoles par défaut, 4 ThirdParties,
  1 Subscription, 2 MachineAssignments, 3 FinishedGoodsTransactions

1.3 **Créer `lib/permissions.ts`**
- `ALL_PERMISSIONS` : tableau des 15 permissions avec id/key/label/description/category
- `DEFAULT_ROLES` : permissions par défaut pour manager et operator
- `roleHasPermission(roleId, permissionKey)` : fonction utilitaire

### Fichiers modifiés
- Créer : `lib/types.ts`, `lib/permissions.ts`
- Modifier : `lib/mock-db.ts`

---

## Phase 2 — Auth & Session Infrastructure

**Objectif** : Système d'authentification mock mais réaliste.

### Tâches

2.1 **Créer `lib/auth.ts`**
- `authenticate(email, password) → User | null`
- `getUserById(id) → User | undefined`
- `getUserOrganizations(userId) → Organization[]`
- `getUserAgencies(userId, orgId) → Agency[]`
- `getUserEffectiveRole(userId, orgId) → UserRole`
- `createOrganization(ownerId, data) → Organization`
- `createEmployeeAccount(orgId, data) → { user, credentials }`

2.2 **Créer `providers/AuthProvider.tsx`**
- Contexte : currentUser, currentOrg, currentAgency, isLoading
- Session persistée dans localStorage (`prod_core_session`)
- `login(email, password)` → vérifie credentials
- `logout()` → vide session
- `register(ownerData, orgData, planData)` → crée compte owner+org
- `switchOrganization(orgId)` → change org courante
- Au mount : restore session depuis localStorage

2.3 **Modifier `app/layout.tsx`**
- Ajouter `AuthProvider` au stack (après LanguageProvider)

2.4 **Réécrire `app/login/page.tsx`**
- Auth réelle via `AuthProvider.login()`
- Redirection selon rôle (owner→org-selector, manager→dashboard/selector, operator→station)
- Plus de formulaire sign-up (remplacé par `/register`)
- Lien vers `/register` pour nouveaux chefs d'entreprise
- Gestion des erreurs (mauvais email/mot de passe)

2.5 **Créer `app/register/page.tsx`**
- Multi-step : Infos perso → Infos entreprise → Forfait → Paiement → Confirmation
- 3 plans : Starter/Professional/Enterprise, toggle mensuel/annuel
- Paiement mocké (carte)
- Appelle `register()` à la fin

2.6 **Créer `app/register/layout.tsx`**
- Layout minimal (pas de shell)

### Fichiers
- Créer : `lib/auth.ts`, `providers/AuthProvider.tsx`,
  `app/register/page.tsx`, `app/register/layout.tsx`
- Modifier : `app/layout.tsx`, `app/login/page.tsx`

---

## Phase 3 — Navigation & Shells

**Objectif** : Adapter la navigation aux 3 rôles.

### Tâches

3.1 **Mettre à jour `providers/MockFeedProductionProvider.tsx`**
- Ajouter currentOrg, currentAgency depuis AuthProvider
- Filtrer toutes les listes par org/agency courante
- `setCurrentAgency(id)` pour changer d'agence
- Nouveaux CRUD : createAgency, createEmployee, createThirdParty,
  assignMachineToOperator, recordFinishedGoodsTransaction

3.2 **Réécrire `app/org-selector/page.tsx`**
- Plus d'option "Rejoindre"
- Owner : liste des entreprises + bouton "Créer"
- Manager multi-agences : sélecteur d'agences
- Manager/Operator mono-agence : auto-redirect (ignore org-selector)
- Modal création entreprise (owner) : nom, secteur, pays, devise, téléphone

3.3 **Créer `components/owner/OwnerShell.tsx`** + `app/owner/layout.tsx`
- Garde de rôle (owner uniquement)
- Nav : Dashboard, Mes agences, Mes employés, Statistiques, Mes tiers,
  Mes produits, Rôles
- Section basse : Profile, Paramètres, Changer d'org, Déconnexion

3.4 **Mettre à jour `components/manager/ManagerShell.tsx`**
- Renommer → "Responsable d'agence"
- Ajouter nav "Mes subordonnés"
- Afficher nom de l'agence courante

3.5 **Mettre à jour `components/operator/OperatorShell.tsx`**
- Garde de rôle (operator)

3.6 **Mettre à jour `components/layout/Sidebar.tsx`**
- userName dynamique depuis currentUser
- Afficher le rôle sous le nom

### Fichiers
- Créer : `components/owner/OwnerShell.tsx`, `app/owner/layout.tsx`
- Modifier : `providers/MockFeedProductionProvider.tsx`,
  `app/org-selector/page.tsx`, `components/manager/ManagerShell.tsx`,
  `components/operator/OperatorShell.tsx`,
  `components/layout/Sidebar.tsx`

---

## Phase 4 — Pages Chef d'Entreprise (Owner)

**Objectif** : Toutes les pages du nouveau rôle owner.

### Tâches

4.1 **Dashboard** — `app/owner/dashboard/page.tsx`
- KPIs : CA total, coûts, marge %, commandes actives, employés, agences
- Graphiques : CA par agence (barres), production/mois (line), statuts (doughnut)
- Dernières activités, alertes stocks, échéance abonnement

4.2 **Mes agences** — `app/owner/agencies/page.tsx`
- Grille d'agences avec infos + stats
- Modal création : nom, checkboxes (fab/vente/mixte), adresse, responsable
- Modal édition / désactivation

4.3 **Mes employés** — `app/owner/employees/page.tsx`
- Tableau avec filtres (agence, rôle, statut)
- Stats : total, par agence, par rôle
- Modal création employé : identifiants générés + affichés
- Section rôles intégrée (voir rôles disponibles)

4.4 **Rôles** — `app/owner/roles/page.tsx`
- Rôles par défaut (non-modifiables) : Responsable d'agence, Opérateur
- Création rôles personnalisés avec sélection de permissions
- Liste exhaustive des permissions par catégorie

4.5 **Statistiques** — `app/owner/statistics/page.tsx`
- Filtres : période, agence
- Graphiques : CA, production, machines, stocks, complétion

4.6 **Mes tiers** — `app/owner/third-parties/page.tsx`
- Tabs : Fournisseurs (entrants) | Clients (sortants)
- Modal ajout : type, nom, contact, matières/produits associés

4.7 **Mes produits** — `app/owner/products/page.tsx`
- Vue read-only agrégeant tous les produits des agences
- Détail : coût, prix, marge, BOM, routage

4.8 **Profil** — `app/owner/profile/page.tsx`
- Infos personnelles, Mot de passe
- Section Abonnement (uniquement ici) : plan, changement, paiement, factures
- Préférences (langue, devise)

4.9 **Paramètres** — `app/owner/settings/page.tsx`
- Paramètres org : nom, secteur, pays, devise
- Préférences notifications

### Fichiers
- Créer : 9 pages dans `app/owner/*/page.tsx`

---

## Phase 5 — Responsable d'Agence Updates

**Objectif** : Adapter le manager existant + nouveaux onglets.

### Tâches

5.1 **Subordonnés** — `app/manager/subordinates/page.tsx`
- Liste des opérateurs + machines assignées
- Modal assignation : sélection opérateur → checkboxes machines
- Règle : une machine = un opérateur

5.2 **Inventaire — Produits finis** — modifier `app/manager/inventory/page.tsx`
- Tabs : Matières premières (existant) | Produits finis (nouveau)
- Produits finis : stock, valeur, historique
- Modal vente : produit, quantité, acheteur (third-party)
- Liens avec le cycle de fabrication

5.3 **Mise à jour pages existantes** (dashboard, insights, settings, profile)
- Filtrage par currentAgency
- Labels mis à jour

### Fichiers
- Créer : `app/manager/subordinates/page.tsx`
- Modifier : `app/manager/inventory/page.tsx`,
  `app/manager/dashboard/page.tsx`, `app/manager/insights/page.tsx`,
  `app/manager/settings/page.tsx`, `app/manager/profile/page.tsx`

---

## Phase 6 — Opérateur Updates

**Objectif** : Filtrer les stations par assignation.

### Tâches

6.1 **Select-station** — modifier `app/operator/select-station/page.tsx`
- Filtrer machines par MachineAssignment
- Message si aucune station assignée

6.2 **Tablet** — modifier `app/operator/tablet/page.tsx`
- Vérifier l'assignation, rediriger si invalide

### Fichiers
- Modifier : `app/operator/select-station/page.tsx`,
  `app/operator/tablet/page.tsx`

---

## Phase 7 — Internationalisation

**Objectif** : Traduire toutes les nouvelles pages.

### Tâches

7.1 Ajouter ~150 nouvelles clés × 3 langues (EN/FR/ES)
- auth_*, register_*, owner_*, manager_subordinates_*,
  manager_inventory_finished_*, operator_no_station_*

### Fichiers
- Modifier : `lib/i18n/dictionary.ts`

---

## Phase 8 — Polish & Finalisation

**Objectif** : Dernière couche avant livraison.

### Tâches

8.1 États vides (aucune agence, aucun employé, etc.)
8.2 États de chargement (skeleton/spinner)
8.3 README.md — comptes de test mock fonctionnels
8.4 Vérification de tous les redirects
8.5 Build final + corrections

### Fichiers
- Modifier : `README.md`, divers composants

---

## Résumé des Fichiers

| Fichier | Phase | Action |
|---------|-------|--------|
| `lib/types.ts` | 1 | Créer |
| `lib/permissions.ts` | 1 | Créer |
| `lib/mock-db.ts` | 1 | Modifier |
| `lib/auth.ts` | 2 | Créer |
| `providers/AuthProvider.tsx` | 2 | Créer |
| `app/register/page.tsx` | 2 | Créer |
| `app/register/layout.tsx` | 2 | Créer |
| `app/layout.tsx` | 2 | Modifier |
| `app/login/page.tsx` | 2 | Modifier |
| `components/owner/OwnerShell.tsx` | 3 | Créer |
| `app/owner/layout.tsx` | 3 | Créer |
| `providers/MockFeedProductionProvider.tsx` | 3 | Modifier |
| `app/org-selector/page.tsx` | 3 | Modifier |
| `components/manager/ManagerShell.tsx` | 3 | Modifier |
| `components/operator/OperatorShell.tsx` | 3 | Modifier |
| `components/layout/Sidebar.tsx` | 3 | Modifier |
| `app/owner/dashboard/page.tsx` | 4 | Créer |
| `app/owner/agencies/page.tsx` | 4 | Créer |
| `app/owner/employees/page.tsx` | 4 | Créer |
| `app/owner/roles/page.tsx` | 4 | Créer |
| `app/owner/statistics/page.tsx` | 4 | Créer |
| `app/owner/third-parties/page.tsx` | 4 | Créer |
| `app/owner/products/page.tsx` | 4 | Créer |
| `app/owner/profile/page.tsx` | 4 | Créer |
| `app/owner/settings/page.tsx` | 4 | Créer |
| `app/manager/subordinates/page.tsx` | 5 | Créer |
| `app/manager/inventory/page.tsx` | 5 | Modifier |
| `app/manager/dashboard/page.tsx` | 5 | Modifier |
| `app/manager/insights/page.tsx` | 5 | Modifier |
| `app/manager/settings/page.tsx` | 5 | Modifier |
| `app/manager/profile/page.tsx` | 5 | Modifier |
| `app/operator/select-station/page.tsx` | 6 | Modifier |
| `app/operator/tablet/page.tsx` | 6 | Modifier |
| `lib/i18n/dictionary.ts` | 7 | Modifier |
| `README.md` | 8 | Modifier |

**Total : 20 fichiers créés, 18 fichiers modifiés, 0 supprimés**
