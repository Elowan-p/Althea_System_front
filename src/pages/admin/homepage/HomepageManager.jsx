import { useState, useEffect } from 'react';
import {
  Loader2, AlertCircle, CheckCircle2, Save, Star, Search, X, ImageOff
} from 'lucide-react';
import { getAdminProducts, getAdminTopProducts, updateTopProducts, clearApiCache } from '../../../services/api';
import './HomepageManager.css';

const HomepageManager = () => {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, topRes] = await Promise.all([
          getAdminProducts(),
          getAdminTopProducts(),
        ]);
        setProducts(Array.isArray(productsRes.data?.items) ? productsRes.data.items : []);
        const top = Array.isArray(topRes.data) ? topRes.data : [];
        
        setSelectedIds(top.map((p) => p.product?.id ?? p.productId ?? p.id).filter((id) => id != null));
      } catch (err) {
        console.error('Homepage manager load error:', err);
        setError('Impossible de charger les produits.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggle = (id) => {
    setSuccess('');
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateTopProducts(selectedIds);
      clearApiCache();
      setSuccess('Top produits mis à jour avec succès.');
    } catch (err) {
      console.error('Top products save error:', err);
      setError('La sauvegarde a échoué.');
    } finally {
      setSaving(false);
    }
  };

  const productById = Object.fromEntries(products.map((p) => [p.id, p]));
  const selectedProducts = selectedIds.map((id) => productById[id]).filter(Boolean);

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = normalizedSearch
    ? products.filter((p) => (p.title || '').toLowerCase().includes(normalizedSearch))
    : products;

  if (loading) {
    return (
      <div className="adm-loading">
        <Loader2 size={32} className="adm-spin" />
        <p>Chargement des produits...</p>
      </div>
    );
  }

  return (
    <div className="homepage-manager-page">
      <header className="adm-page-head">
        <div>
          <h1 className="adm-title">Page d'accueil</h1>
          <p className="adm-sub">Sélectionnez les produits mis en avant sur la page d'accueil</p>
        </div>
        <div className="adm-head-actions">
          <button className="adm-btn primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} className="adm-spin" /> : <Save size={16} />}
            Sauvegarder
          </button>
        </div>
      </header>

      {error && (
        <div className="adm-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="adm-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="adm-card top-selection">
        <h2 className="card-title">
          <Star size={16} /> Top produits sélectionnés ({selectedProducts.length})
        </h2>
        {selectedProducts.length === 0 ? (
          <p className="muted-note">Aucun produit sélectionné. Cochez des produits dans la liste ci-dessous.</p>
        ) : (
          <div className="selected-chips">
            {selectedProducts.map((product) => (
              <div key={product.id} className="selected-chip">
                {product.pictureUrl ? (
                  <img src={product.pictureUrl} alt={product.title} />
                ) : (
                  <div className="chip-placeholder"><ImageOff size={14} /></div>
                )}
                <span>{product.title}</span>
                <button type="button" title="Retirer" onClick={() => toggle(product.id)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="adm-toolbar">
        <div className="search-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="u-w-40"></th>
              <th>Image</th>
              <th>Titre</th>
              <th>Prix</th>
              <th>Catégorie</th>
              <th>Publié</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr
                key={product.id}
                className="adm-row-link"
                onClick={() => toggle(product.id)}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggle(product.id)}
                  />
                </td>
                <td>
                  {product.pictureUrl ? (
                    <img src={product.pictureUrl} alt={product.title} className="adm-thumb" />
                  ) : (
                    <div className="adm-thumb thumb-placeholder"><ImageOff size={18} /></div>
                  )}
                </td>
                <td className="hp-name">{product.title}</td>
                <td className="hp-price">
                  {Number(product.price).toLocaleString('fr-FR')} €
                </td>
                <td>{product.category?.title || '—'}</td>
                <td>
                  <span className={`adm-badge ${product.isPublished ? 'green' : ''}`}>
                    {product.isPublished ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="hp-empty-cell">
                  Aucun produit ne correspond à la recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default HomepageManager;
