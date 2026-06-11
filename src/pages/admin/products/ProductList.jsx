import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Loader2, AlertCircle, PackageOpen,
  ArrowUp, ArrowDown, ArrowUpDown, Eye, EyeOff, ImageOff
} from 'lucide-react';
import { getAdminProducts, deleteAdminProduct, bulkAdminProducts, clearApiCache } from '../../../services/api';

const COLUMNS = [
  { field: 'pictureUrl', label: 'Image', sortable: false },
  { field: 'title', label: 'Titre', sortable: true },
  { field: 'price', label: 'Prix', sortable: true },
  { field: 'inStock', label: 'Stock', sortable: true },
  { field: 'isPublished', label: 'Publié', sortable: true },
  { field: 'category', label: 'Catégorie', sortable: true },
];

const sortValue = (product, field) => {
  switch (field) {
    case 'price': return Number(product.price) || 0;
    case 'inStock': return Number(product.inStock) || 0;
    case 'isPublished': return product.isPublished ? 1 : 0;
    case 'category': return (product.category?.title || '').toLowerCase();
    default: return (product[field] || '').toString().toLowerCase();
  }
};

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null); 
  const [working, setWorking] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminProducts();
      setProducts(Array.isArray(res.data?.items) ? res.data.items : []);
    } catch (err) {
      console.error('Admin products fetch error:', err);
      setError('Impossible de charger les produits.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...products].sort((a, b) => {
    const va = sortValue(a, sortField);
    const vb = sortValue(b, sortField);
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const allSelected = sorted.length > 0 && selected.length === sorted.length;
  const toggleAll = () => setSelected(allSelected ? [] : sorted.map((p) => p.id));
  const toggleOne = (id) => setSelected((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );

  const runBulk = async (action, ids) => {
    setWorking(true);
    setError('');
    try {
      await bulkAdminProducts({ action, ids });
      clearApiCache();
      setSelected([]);
      setConfirm(null);
      await fetchProducts();
    } catch (err) {
      console.error('Bulk action error:', err);
      setError('L\'action groupée a échoué.');
      setConfirm(null);
    } finally {
      setWorking(false);
    }
  };

  const runDelete = async (id) => {
    setWorking(true);
    setError('');
    try {
      await deleteAdminProduct(id);
      clearApiCache();
      setSelected((prev) => prev.filter((x) => x !== id));
      setConfirm(null);
      await fetchProducts();
    } catch (err) {
      console.error('Product delete error:', err);
      setError('La suppression a échoué.');
      setConfirm(null);
    } finally {
      setWorking(false);
    }
  };

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.type === 'single') runDelete(confirm.ids[0]);
    else runBulk('delete', confirm.ids);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={13} style={{ opacity: 0.4 }} />;
    return sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  if (loading) {
    return (
      <div className="adm-loading">
        <Loader2 size={32} className="adm-spin" />
        <p>Chargement des produits...</p>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <header className="adm-page-head">
        <div>
          <h1 className="adm-title">Produits</h1>
          <p className="adm-sub">{products.length} produit(s) au catalogue</p>
        </div>
        <div className="adm-head-actions">
          <Link to="/admin/products/new" className="adm-btn primary">
            <Plus size={16} /> Nouveau produit
          </Link>
        </div>
      </header>

      {error && (
        <div className="adm-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {selected.length > 0 && (
        <div className="adm-toolbar bulk-bar">
          <span className="bulk-count">{selected.length} sélectionné(s)</span>
          <button className="adm-btn sm" disabled={working} onClick={() => runBulk('publish', selected)}>
            <Eye size={14} /> Publier
          </button>
          <button className="adm-btn sm" disabled={working} onClick={() => runBulk('unpublish', selected)}>
            <EyeOff size={14} /> Dépublier
          </button>
          <button className="adm-btn sm danger" disabled={working} onClick={() => setConfirm({ type: 'bulk', ids: selected })}>
            <Trash2 size={14} /> Supprimer
          </button>
        </div>
      )}

      {products.length === 0 ? (
        <div className="adm-empty">
          <PackageOpen size={56} strokeWidth={1} color="#cbd5e1" />
          <h3>Aucun produit</h3>
          <p>Créez votre premier produit pour démarrer le catalogue.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.field}
                    className={col.sortable ? 'sortable' : ''}
                    onClick={col.sortable ? () => handleSort(col.field) : undefined}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {col.label}
                      {col.sortable && <SortIcon field={col.field} />}
                    </span>
                  </th>
                ))}
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() => toggleOne(product.id)}
                    />
                  </td>
                  <td>
                    {product.pictureUrl ? (
                      <img src={product.pictureUrl} alt={product.title} className="adm-thumb" />
                    ) : (
                      <div className="adm-thumb thumb-placeholder"><ImageOff size={18} /></div>
                    )}
                  </td>
                  <td>
                    <Link to={`/admin/products/${product.id}`} className="product-title-link">
                      {product.title}
                    </Link>
                  </td>
                  <td className="cell-price">{Number(product.price).toLocaleString('fr-FR')} €</td>
                  <td>
                    <span className={`adm-badge ${Number(product.inStock) > 0 ? '' : 'red'}`}>
                      {product.inStock ?? 0}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-badge ${product.isPublished ? 'green' : ''}`}>
                      {product.isPublished ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td>{product.category?.title || '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="adm-icon-btn"
                        title="Modifier"
                        onClick={() => navigate(`/admin/products/${product.id}`)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="adm-icon-btn danger"
                        title="Supprimer"
                        onClick={() => setConfirm({ type: 'single', ids: [product.id], title: product.title })}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <div className="adm-modal-overlay" onClick={() => !working && setConfirm(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>
              {confirm.type === 'single'
                ? <>Le produit <strong>{confirm.title}</strong> sera définitivement supprimé.</>
                : <>{confirm.ids.length} produit(s) seront définitivement supprimés.</>}
              {' '}Cette action est irréversible.
            </p>
            <div className="adm-modal-actions">
              <button className="adm-btn" disabled={working} onClick={() => setConfirm(null)}>
                Annuler
              </button>
              <button className="adm-btn danger" disabled={working} onClick={handleConfirm}>
                {working ? <Loader2 size={15} className="adm-spin" /> : <Trash2 size={15} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bulk-bar {
          background: #f0f4f8; border: 1px solid #dbeafe; border-radius: 12px;
          padding: 0.7rem 1.25rem;
        }
        .bulk-count { font-size: 0.85rem; font-weight: 800; color: var(--primary); margin-right: 0.5rem; }
        .product-title-link { font-weight: 750; color: #1e293b; }
        .product-title-link:hover { color: var(--primary); }
        .cell-price { font-weight: 800; color: #012a4a; white-space: nowrap; }
        .row-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
        .thumb-placeholder { display: flex; align-items: center; justify-content: center; color: #cbd5e1; }
        .adm-table input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }
      `}</style>
    </div>
  );
};

export default ProductList;
