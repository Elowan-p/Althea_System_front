# Althea — Frontend E-Commerce

Interface utilisateur de la plateforme e-commerce Althea. SPA React moderne, multilingue, accessible et performante.

---

## Choix technologiques

### React 19 + Vite 7

React 19 introduit le **React Compiler** (via Babel), qui optimise automatiquement les re-renders sans avoir besoin de `useMemo` ou `useCallback` manuels. Pour un e-commerce, où les listes de produits, filtres et paniers doivent rester fluides, ce gain de performance est immédiat et sans surcoût de développement.

Vite 7 remplace Create React App ou Webpack : démarrage à froid quasi-instantané grâce à l'ES Module natif, HMR ultra-rapide pendant le développement, et un build de production optimisé (tree-shaking, code splitting, minification). En production, les assets sont versionnés et mis en cache efficacement par les CDN.

### React Router v7

Le routeur est configuré avec du **lazy loading** par route : chaque page n'est chargée que lorsque l'utilisateur y accède. Sur un e-commerce avec de nombreuses pages (catalogue, fiche produit, panier, compte, backoffice admin), cela réduit drastiquement le bundle initial et améliore le **First Contentful Paint (FCP)**, indicateur clé pour le SEO et la conversion.

Les routes admin sont doublement protégées : JWT valide **et** rôle `ROLE_ADMIN` **et** vérification 2FA. Cette séparation évite toute fuite de surface d'attaque côté client.

### i18next — Internationalisation (fr / en / ru)

i18next avec `i18next-browser-languagedetector` détecte automatiquement la langue du navigateur et persiste le choix en `localStorage`. Les traductions sont des fichiers JSON statiques, livrés avec le bundle — pas de requête réseau supplémentaire au chargement.

Le support du **russe** dès le lancement illustre l'ambition internationale du projet. L'intercepteur Axios injecte automatiquement le paramètre `locale` dans chaque requête API, permettant au backend de retourner des données localisées (noms de produits, descriptions) sans logique côté client.

### Axios avec intercepteurs personnalisés

Un unique service centralisé (`src/services/api.js`) encapsule toutes les interactions réseau :

- **Injection automatique du token Bearer** : aucune route protégée ne peut oublier l'en-tête d'authentification.
- **Locale automatique** : chaque requête transporte la langue active.
- **Cache en mémoire (TTL 5 min)** : les pages catalogue et fiches produits sont servies depuis le cache côté client, réduisant la charge serveur et le temps de réponse perçu. Le cache est invalidé proprement lors d'un changement de langue ou d'une mutation admin.

### Lucide React + Recharts

Lucide fournit des icônes SVG légères, accessibles et cohérentes. Recharts alimente le tableau de bord admin avec des graphiques de ventes, commandes et performances — outils indispensables pour piloter un e-commerce.

### Accessibilité (WCAG 2.1)

L'accessibilité n'est pas optionnelle sur un site grand public :

- **Mode accessibilité** togglable (stocké en `localStorage`) : agrandissement des textes, contrastes renforcés, indicateurs de focus visibles.
- **ARIA complet** : `aria-live`, `aria-pressed`, `aria-label`, `role="tablist"`, `role="status"`, navigation au clavier.
- **Classe `.sr-only`** pour le contenu destiné aux lecteurs d'écran uniquement.
- **Fil d'Ariane** (`aria-label="Fil d'Ariane"`) pour la navigation contextuelle.

---

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 20.x |
| npm | 10.x |
| Backend Althea | En cours d'exécution sur `localhost:8080` |

---

## Installation

```bash
git clone <url-du-repo>
cd front_althea
npm install
```

---

## Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:8080
```

En développement, Vite proxifie automatiquement les requêtes `/api` vers `http://localhost:8080` (configuré dans `vite.config.js`). La variable `VITE_API_URL` est utilisée en production.

---

## Lancement

### Développement

```bash
npm run dev
```

L'application est disponible sur [http://localhost:5173](http://localhost:5173).

### Production

```bash
npm run build       # Génère le dossier /dist
npm run preview     # Prévisualise le build de production en local
```

### Linting

```bash
npm run lint
```

---

## Structure du projet

```
src/
├── api/                    # Couche d'intégration API
├── components/
│   └── common/             # Header, Footer, Layout, Loader
├── pages/
│   ├── auth/               # Login, Register, mot de passe oublié, vérification email
│   ├── account/            # Profil utilisateur, historique des commandes
│   └── admin/              # Backoffice : produits, catégories, commandes, contacts
├── locales/
│   ├── fr.json             # Traductions françaises (langue par défaut)
│   ├── en.json             # Traductions anglaises
│   └── ru.json             # Traductions russes
├── services/
│   └── api.js              # Service Axios centralisé (intercepteurs, cache, 40+ méthodes)
├── i18n.js                 # Configuration i18next
├── App.jsx                 # Routes protégées et logique d'authentification
└── main.jsx                # Point d'entrée React
```

---

## Authentification

- **Utilisateurs** : JWT stocké en `localStorage`, injecté automatiquement dans toutes les requêtes.
- **Admins** : JWT + `ROLE_ADMIN` + validation 2FA obligatoire pour accéder au backoffice.
- La déconnexion déclenche un événement global (`logout-start`) pour synchroniser tous les composants.

---

## Internationalisation

La langue est détectée dans cet ordre : `localStorage` → cookie → langue du navigateur.
Le changement de langue vide le cache API pour garantir des données à jour dans la nouvelle locale.

Langues supportées : Français · English · Русский

---

## Backoffice Admin

Accessible sur `/admin` (authentification 2FA requise). Fonctionnalités :

- Gestion des produits et catégories (CRUD + upload d'images)
- Gestion des commandes
- Gestion des messages de contact
- Éditeur de page d'accueil et de carrousel
- Tableau de bord avec statistiques (Recharts)
