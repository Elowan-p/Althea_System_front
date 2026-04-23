import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, BadgePercent, Eye } from 'lucide-react';
import { bulkAdminProducts, deleteAdminProduct, getAdminProducts } from '../../services/adminApi';

const columns = [
  { key: 'name', label: 'Nom' },
  { key: 'description', label: 'Description' },
  { key: 'price', label: 'Prix' },
  { key: 'stockQuantity', label: 'Quantité' },
  { key: 'category', label: 'Catégorie' },
  { key: 'status', label: 'Statut' },
];

const ProductTablePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAdminProducts({ page: meta.page, limit: meta.limit, sort: sortKey, direction: sortDir });
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [];
        setProducts(items);
        setMeta((prev) => ({
          ...prev,
          page: data?.page ?? prev.page,
          pages: data?.pages ?? data?.totalPages ?? prev.pages,
          total: data?.total ?? data?.totalItems ?? items.length,
          limit: data?.limit ?? prev.limit,
        }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [meta.page, meta.limit, sortKey, sortDir]);

  const sortedProducts = useMemo(() => [...products].sort((a, b) => {
    const left = a[sortKey];
    const right = b[sortKey];
    const dir = sortDir === 'asc' ? 1 : -1;
    if (typeof left === 'boolean' && typeof right === 'boolean') return (Number(left) - Number(right)) * dir;
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * dir;
    return String(left).localeCompare(String(right)) * dir;
  }), [products, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelection = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const selectAll = (checked) => {
    setSelected(checked ? sortedProducts.map((p) => p.id) : []);
  };

  const removeSelected = () => {
    bulkAdminProducts({ action: 'delete', ids: selected }).then(() => {
      setProducts((prev) => prev.filter((p) => !selected.includes(p.id)));
      setSelected([]);
    });
  };

  const markPromotion = () => {
    bulkAdminProducts({ action: 'promotion', ids: selected }).then(() => {
      setProducts((prev) => prev.map((p) => (selected.includes(p.id) ? { ...p, onPromotion: true } : p)));
      setSelected([]);
    });
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Produits</h1>
          <p>{meta.total} produits, {selected.length} sélectionnés</p>
        </div>
        <div className="admin-actions">
          <button onClick={() => navigate('/admin/products/new')}>Nouveau produit</button>
          <button onClick={markPromotion} disabled={!selected.length}><BadgePercent size={16} /> Promo</button>
          <button onClick={removeSelected} disabled={!selected.length}><Trash2 size={16} /> Supprimer</button>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? <div className="table-loading">Chargement...</div> : null}
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" checked={selected.length === sortedProducts.length && sortedProducts.length > 0} onChange={(e) => selectAll(e.target.checked)} /></th>
              {columns.map((col) => <th key={col.key} onClick={() => toggleSort(col.key)}>{col.label}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product) => (
              <tr key={product.id} className={selected.includes(product.id) ? 'selected' : ''}>
                <td><input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelection(product.id)} /></td>
                <td>{product.name ?? product.title}</td>
                <td>{product.description}</td>
                <td>{product.price.toLocaleString()} €</td>
                <td>{product.stockQuantity ?? product.quantity ?? 0}</td>
                <td>{product.category?.name ?? product.category?.title ?? product.category ?? '-'}</td>
                <td>{product.status ?? (product.isPublished ? 'published' : 'draft')}</td>
                <td><button onClick={() => navigate(`/admin/products/${product.id}`)}><Eye size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pager">
          <button disabled={meta.page <= 1} onClick={() => setMeta((prev) => ({ ...prev, page: prev.page - 1 }))}>Précédent</button>
          <span>Page {meta.page} / {meta.pages}</span>
          <button disabled={meta.page >= meta.pages} onClick={() => setMeta((prev) => ({ ...prev, page: prev.page + 1 }))}>Suivant</button>
        </div>
      </div>

      <style>{`
        .admin-header { display:flex; justify-content:space-between; gap:1rem; align-items:flex-end; margin-bottom:1.5rem; }
        .admin-actions { display:flex; gap:0.75rem; flex-wrap:wrap; }
        .admin-actions button { display:flex; align-items:center; gap:0.4rem; }
        .table-wrap { overflow:auto; background:white; border-radius:16px; box-shadow:0 10px 30px rgba(15,23,42,0.08); }
        .table-loading { padding:1rem; color:#64748b; }
        table { width:100%; border-collapse:collapse; }
        th, td { padding:0.9rem 1rem; border-bottom:1px solid #e2e8f0; text-align:left; white-space:nowrap; }
        th { cursor:pointer; user-select:none; background:#f8fafc; }
        tr.selected { background:#eff6ff; }
        .pager { display:flex; align-items:center; justify-content:flex-end; gap:0.75rem; padding:1rem; }
      `}</style>
    </div>
  );
};

export default ProductTablePage;
