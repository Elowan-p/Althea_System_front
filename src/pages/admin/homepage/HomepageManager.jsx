import { useState, useEffect } from 'react';
import {
  Loader2, AlertCircle, CheckCircle2, Save, Star, Search, X, ImageOff
} from 'lucide-react';
import { getAdminProducts, getAdminTopProducts, updateTopProducts, clearApiCache } from '../../../services/api';

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
              <th style={{ width: 40 }}></th>
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
                <td style={{ fontWeight: 750, color: '#1e293b' }}>{product.title}</td>
                <td style={{ fontWeight: 800, color: '#012a4a', whiteSpace: 'nowrap' }}>
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
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  Aucun produit ne correspond à la recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .top-selection { margin-bottom: 1.25rem; border: 1.5px solid #fde68a; background: #fffdf5; }
        .card-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 850; color: #012a4a; margin-bottom: 1rem; }
        .card-title svg { color: var(--accent); }
        .muted-note { font-size: 0.88rem; color: var(--text-muted); font-weight: 600; }

        .selected-chips { display: flex; flex-wrap: wrap; gap: 0.7rem; }
        .selected-chip {
          display: flex; align-items: center; gap: 0.6rem;
          background: white; border: 1px solid var(--border); border-radius: 99px;
          padding: 0.35rem 0.6rem 0.35rem 0.4rem;
          font-size: 0.82rem; font-weight: 750; color: #1e293b;
        }
        .selected-chip img, .chip-placeholder { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
        .chip-placeholder { display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #cbd5e1; }
        .selected-chip button { display: flex; align-items: center; color: #94a3b8; }
        .selected-chip button:hover { color: var(--error); }

        .search-wrap {
          display: flex; align-items: center; gap: 0.6rem;
          background: white; border: 1.5px solid var(--border); border-radius: 10px;
          padding: 0.6rem 1rem; width: 320px; max-width: 100%; color: #94a3b8;
        }
        .search-wrap input { border: none; outline: none; font-weight: 600; font-size: 0.9rem; width: 100%; background: transparent; }

        .adm-table input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }
        .thumb-placeholder { display: flex; align-items: center; justify-content: center; color: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default HomepageManager;
