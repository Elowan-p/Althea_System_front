import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Loader2, AlertCircle, Layers, ImageOff } from 'lucide-react';
import { getCategories } from '../../../services/api';

const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Categories fetch error:', err);
        setError('Impossible de charger les catégories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="adm-loading">
        <Loader2 size={32} className="adm-spin" />
        <p>Chargement des catégories...</p>
      </div>
    );
  }

  return (
    <div className="category-list-page">
      <header className="adm-page-head">
        <div>
          <h1 className="adm-title">Catégories</h1>
          <p className="adm-sub">{categories.length} catégorie(s)</p>
        </div>
        <div className="adm-head-actions">
          <Link to="/admin/categories/new" className="adm-btn primary">
            <Plus size={16} /> Nouvelle catégorie
          </Link>
        </div>
      </header>

      {error && (
        <div className="adm-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {categories.length === 0 && !error ? (
        <div className="adm-empty">
          <Layers size={56} strokeWidth={1} color="#cbd5e1" />
          <h3>Aucune catégorie</h3>
          <p>Créez une catégorie pour organiser le catalogue.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Titre</th>
                <th>Produits</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    {cat.pictureUrl ? (
                      <img src={cat.pictureUrl} alt={cat.title} className="adm-thumb" />
                    ) : (
                      <div className="adm-thumb thumb-placeholder"><ImageOff size={18} /></div>
                    )}
                  </td>
                  <td>
                    <Link to={`/admin/categories/${cat.id}`} className="cat-title-link">
                      {cat.title}
                    </Link>
                  </td>
                  <td>
                    <span className="adm-badge blue">{cat.products?.length ?? 0} produit(s)</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="adm-icon-btn"
                        title="Modifier"
                        onClick={() => navigate(`/admin/categories/${cat.id}`)}
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .cat-title-link { font-weight: 750; color: #1e293b; }
        .cat-title-link:hover { color: var(--primary); }
        .row-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
        .thumb-placeholder { display: flex; align-items: center; justify-content: center; color: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default CategoryList;
