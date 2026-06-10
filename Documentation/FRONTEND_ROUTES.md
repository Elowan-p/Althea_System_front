# Routes Frontend - Althea System Front

Ce document liste toutes les routes disponibles dans l'application React.

## Base URL

- Développement : `http://localhost:5173`
- Production : `https://althea-system.com` (à adapter)

---

## Routes publiques

| Path | Composant | Description |
|------|-----------|-------------|
| `/` | `Home` | Page d'accueil |
| `/catalogue` | `Catalogue` | Catalogue complet des produits |
| `/category/:id` | `Category` | Produits d'une catégorie |
| `/product/:id` | `Product` | Détail d'un produit |
| `/search` | `Search` | Résultats de recherche |
| `/cart` | `Cart` | Panier |
| `/checkout` | `Checkout` | Paiement Stripe |
| `/cancel` | `Cancel` | Page d'annulation de commande |
| `/contact` | `Contact` | Formulaire de contact |

---

## Routes d'authentification

| Path | Composant | Description |
|------|-----------|-------------|
| `/login` | `Login` | Connexion |
| `/register` | `Register` | Inscription |
| `/forgot-password` | `ForgotPassword` | Demande de réinitialisation de mot de passe |
| `/reset-password` | `ResetPassword` | Réinitialisation du mot de passe (via token email) |
| `/verify-email` | `VerifyEmail` | Vérification de l'adresse email (via token email) |

---

## Routes compte utilisateur (protégées)

Nécessite un JWT valide (`ROLE_USER`). Redirige vers `/login` sinon.

| Path | Composant | Description |
|------|-----------|-------------|
| `/account` | `AccountLayout > Settings` | Index compte → redirige vers settings |
| `/account/settings` | `Settings` | Paramètres du compte |
| `/account/orders` | `Orders` | Historique des commandes |

---

## Routes administration (protégées)

Nécessite un JWT valide + `ROLE_ADMIN` + vérification 2FA.  
Sans 2FA valide → redirige vers `/admin/2fa`.  
Sans token ou rôle admin → redirige vers `/login`.

| Path | Composant | Description |
|------|-----------|-------------|
| `/admin/2fa` | `TwoFA` | Vérification 2FA admin (publique) |
| `/admin` | `Dashboard` | Tableau de bord |
| `/admin/products` | `ProductList` | Liste des produits |
| `/admin/products/new` | `ProductForm` | Créer un produit |
| `/admin/products/:id` | `ProductForm` | Modifier un produit |
| `/admin/categories` | `CategoryList` | Liste des catégories |
| `/admin/categories/new` | `CategoryForm` | Créer une catégorie |
| `/admin/categories/:id` | `CategoryForm` | Modifier une catégorie |
| `/admin/orders` | `OrderList` | Liste des commandes |
| `/admin/orders/:id` | `OrderDetail` | Détail d'une commande |
| `/admin/contacts` | `ContactList` | Liste des messages de contact |
| `/admin/contacts/:id` | `ContactDetail` | Détail d'un message de contact |
| `/admin/carousel` | `CarouselManager` | Gestion du carousel |
| `/admin/homepage` | `HomepageManager` | Gestion de la page d'accueil |
| `/admin/chatbot` | `ChatbotLogs` | Logs du chatbot |

---

## Fallback

Toute route inconnue redirige vers `/`.
