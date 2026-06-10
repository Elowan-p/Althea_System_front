Plan — Backoffice Frontend Althea Systems
Contexte
Le site e-commerce Althea Systems possède un backend complet avec des routes /api/admin/* mais aucune interface frontend backoffice n'existe. Le backoffice doit permettre aux admins de gérer produits, catégories, commandes, messages de contact, carousel, homepage, et visualiser les stats de ventes. L'utilisateur veut utiliser le Layout public existant (Header/Footer) et Recharts pour les graphiques.

Choix techniques
Graphiques: Recharts (à installer)
Layout: Layout public existant, avec un AdminLayout qui ajoute une sidebar/nav admin
Auth admin: JWT ROLE_ADMIN + vérification 2FA stockée dans localStorage (adminTwoFaVerified)
Routing: Routes imbriquées sous /admin/* dans App.jsx, avec ProtectedAdminRoute
API: Nouvelles fonctions dans /src/services/api.js pour toutes les routes /api/admin/*
Style: Inline <style> + variables CSS existantes (--primary, --border, etc.), cohérent avec les autres pages
Structure des fichiers à créer
src/
  pages/admin/
    AdminLayout.jsx          ← sidebar + nav admin, <Outlet />
    Dashboard.jsx            ← graphiques Recharts (4 endpoints)
    products/
      ProductList.jsx        ← tableau triable + bulk actions
      ProductForm.jsx        ← créer/modifier produit (+ upload image)
    categories/
      CategoryList.jsx       ← liste + actions
      CategoryForm.jsx       ← créer/modifier catégorie
    orders/
      OrderList.jsx          ← liste commandes + filtre statut
      OrderDetail.jsx        ← détails + changer statut
    contacts/
      ContactList.jsx        ← messages de contact + filtre statut
      ContactDetail.jsx      ← détail + changer statut
    carousel/
      CarouselManager.jsx    ← liste + réordonner (drag ou boutons ↑↓)
    homepage/
      HomepageManager.jsx    ← sélectionner top produits
    chatbot/
      ChatbotLogs.jsx        ← logs en lecture seule
    auth/
      TwoFA.jsx              ← formulaire code 2FA
Étape 1 — Installation Recharts
npm install recharts
Étape 2 — Nouvelles fonctions API (src/services/api.js)
Ajouter à la fin du fichier :

// Admin Auth
export const verifyAdminTwoFA = (data) => api.post('/admin/auth/verify-2fa', data);

// Admin Dashboard
export const getDailySales = () => api.get('/admin/dashboard/sales/daily');
export const getWeeklySales = () => api.get('/admin/dashboard/sales/weekly');
export const getWeeklySalesByCategory = () => api.get('/admin/dashboard/sales/weekly-by-category');
export const getCategoryShare = () => api.get('/admin/dashboard/sales/category-share');

// Admin Products
export const getAdminProducts = (params) => api.get('/admin/products', { params });
export const getAdminProduct = (id) => api.get(`/admin/products/${id}`);
export const createAdminProduct = (data) => api.post('/admin/products', data);
export const updateAdminProduct = (id, data) => api.patch(`/admin/products/${id}`, data);
export const deleteAdminProduct = (id) => api.delete(`/admin/products/${id}`);
export const bulkAdminProducts = (data) => api.post('/admin/products/bulk', data);

// Admin Categories
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.patch(`/categories/${id}`, data);

// Admin Orders
export const getAdminOrders = (params) => api.get('/admin/orders', { params });
export const getAdminOrder = (id) => api.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, status) => api.patch(`/admin/orders/${id}/status`, { status });

// Admin Contacts
export const getAdminContacts = (params) => api.get('/admin/contact/messages', { params });
export const getAdminContact = (id) => api.get(`/admin/contact/messages/${id}`);
export const updateContactStatus = (id, status) => api.patch(`/admin/contact/messages/${id}/status`, { status });
export const replyContact = (id, message) => api.post(`/admin/contact/messages/${id}/reply`, { message });

// Admin Carousel
export const getAdminCarousel = () => api.get('/admin/carousel');
export const createCarouselItem = (data) => api.post('/admin/carousel', data);
export const updateCarouselItem = (id, data) => api.patch(`/admin/carousel/${id}`, data);
export const deleteCarouselItem = (id) => api.delete(`/admin/carousel/${id}`);
export const reorderCarousel = (items) => api.patch('/admin/carousel/reorder', { items });

// Admin Homepage
export const getAdminTopProducts = () => api.get('/admin/homepage/top-products');
export const updateTopProducts = (productIds) => api.put('/admin/homepage/top-products', { productIds });

// Admin Upload
export const uploadFile = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/admin/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Admin Chatbot
export const getChatbotLogs = (params) => api.get('/admin/chatbot/logs', { params });
export const getChatbotSession = (sessionId) => api.get(`/admin/chatbot/logs/${sessionId}`);
Étape 3 — Routes dans App.jsx
Ajouter les imports lazy + ProtectedAdminRoute + routes /admin/* :

// Lazy imports admin
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductList = lazy(() => import('./pages/admin/products/ProductList'));
const ProductForm = lazy(() => import('./pages/admin/products/ProductForm'));
const CategoryList = lazy(() => import('./pages/admin/categories/CategoryList'));
const CategoryForm = lazy(() => import('./pages/admin/categories/CategoryForm'));
const OrderList = lazy(() => import('./pages/admin/orders/OrderList'));
const OrderDetail = lazy(() => import('./pages/admin/orders/OrderDetail'));
const ContactList = lazy(() => import('./pages/admin/contacts/ContactList'));
const ContactDetail = lazy(() => import('./pages/admin/contacts/ContactDetail'));
const CarouselManager = lazy(() => import('./pages/admin/carousel/CarouselManager'));
const HomepageManager = lazy(() => import('./pages/admin/homepage/HomepageManager'));
const ChatbotLogs = lazy(() => import('./pages/admin/chatbot/ChatbotLogs'));
const TwoFA = lazy(() => import('./pages/admin/auth/TwoFA'));

// ProtectedAdminRoute
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  if (!token || !isAdmin) return <Navigate to="/login" replace />;
  if (!localStorage.getItem('adminTwoFaVerified')) return <Navigate to="/admin/2fa" replace />;
  return children;
};

// Routes à ajouter dans <Routes>
<Route path="/admin/2fa" element={<TwoFA />} />
<Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
  <Route index element={<Dashboard />} />
  <Route path="products" element={<ProductList />} />
  <Route path="products/new" element={<ProductForm />} />
  <Route path="products/:id" element={<ProductForm />} />
  <Route path="categories" element={<CategoryList />} />
  <Route path="categories/new" element={<CategoryForm />} />
  <Route path="categories/:id" element={<CategoryForm />} />
  <Route path="orders" element={<OrderList />} />
  <Route path="orders/:id" element={<OrderDetail />} />
  <Route path="contacts" element={<ContactList />} />
  <Route path="contacts/:id" element={<ContactDetail />} />
  <Route path="carousel" element={<CarouselManager />} />
  <Route path="homepage" element={<HomepageManager />} />
  <Route path="chatbot" element={<ChatbotLogs />} />
</Route>
Étape 4 — AdminLayout.jsx
Sidebar verticale à gauche avec liens de navigation :

Dashboard
Produits
Catégories
Commandes
Messages
Carousel
Page d'accueil
Chatbot
[Retour au site]
<Outlet /> dans la zone principale droite. Style cohérent avec --primary, --border, --background.

Étape 5 — Dashboard.jsx
Fetche les 4 endpoints en parallèle (Promise.all). 3 graphiques Recharts :

BarChart — ventes par jour (daily + weekly toggle)
BarChart stacked — paniers moyens par catégorie (weekly-by-category)
PieChart — part des ventes par catégorie (category-share)
Étape 6 — ProductList.jsx
Tableau avec colonnes : Image, Titre, Prix, Stock, Publié, Catégorie, Actions
Tri par colonne (state local sortField + sortDir)
Checkbox par ligne + select-all → actions bulk (publier/dépublier/supprimer)
Boutons : Nouveau, Modifier (→ /admin/products/:id), Supprimer
Confirmation modale avant suppression
Étape 7 — ProductForm.jsx
Mode créer (/admin/products/new) ou modifier (/admin/products/:id)
Champs : titre FR/EN/RU, description FR/EN/RU, prix, stock, catégorie (select), isPublished, isPortable, isOneTimeUse, powerSupplyType FR/EN/RU, medicalDomain FR/EN/RU
Upload image via POST /api/admin/upload + aperçu
Validation côté client avant submit
Étape 8 — CategoryList.jsx + CategoryForm.jsx
Liste avec image + titre
Formulaire : titre FR/EN/RU, pictureUrl + upload image
Étape 9 — OrderList.jsx + OrderDetail.jsx
Liste avec filtre par statut (select)
Détail : items commandés, adresse, paiement (4 derniers chiffres), télécharger facture
Changer statut via select + bouton confirmer
Étape 10 — ContactList.jsx + ContactDetail.jsx
Liste avec filtre statut
Détail : message complet + champ réponse + bouton envoyer
Marquer comme lu
Étape 11 — CarouselManager.jsx
Liste des éléments avec aperçu image
Boutons ↑/↓ pour réordonner (appelle reorderCarousel)
Créer/modifier/supprimer élément
Étape 12 — HomepageManager.jsx
Liste de tous les produits (checkboxes)
Section "Top produits sélectionnés" avec les produits cochés
Bouton sauvegarder → PUT /api/admin/homepage/top-products
Étape 13 — ChatbotLogs.jsx
Liste des sessions (pagination)
Clic sur session → afficher conversation complète
Étape 14 — TwoFA.jsx
Formulaire : champ challengeId (auto-rempli depuis localStorage ou paramètre URL) + champ code à 6 chiffres
Après succès : stocker adminTwoFaVerified = true dans localStorage + rediriger vers /admin
Fichiers critiques modifiés
Fichier	Modification
src/App.jsx	+lazy imports admin, +ProtectedAdminRoute, +routes /admin/*
src/services/api.js	+30 nouvelles fonctions admin
package.json	+recharts
Fichiers créés (15)
AdminLayout.jsx, Dashboard.jsx, TwoFA.jsx,
ProductList.jsx, ProductForm.jsx,
CategoryList.jsx, CategoryForm.jsx,
OrderList.jsx, OrderDetail.jsx,
ContactList.jsx, ContactDetail.jsx,
CarouselManager.jsx, HomepageManager.jsx, ChatbotLogs.jsx

Vérification
npm install recharts — pas d'erreur
npm run dev — pas d'erreur compilation
Login avec un compte admin → redirection vers /admin/2fa
Validation 2FA → accès /admin
Login compte non-admin → /admin redirige vers /login
Chaque page charge les données depuis l'API correctement