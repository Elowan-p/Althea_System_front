import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { deleteAdminProduct, getAdminProduct, updateAdminProduct } from '../../services/adminApi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAdminProduct(id);
      setProduct(data);
      setForm({
        name: data.name ?? data.title ?? '',
        description: data.description ?? '',
        price: Number(data.price ?? 0),
        quantity: Number(data.stockQuantity ?? data.quantity ?? 0),
      });
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!product || !form) return <p>Produit introuvable.</p>;

  const save = async () => {
    const updated = await updateAdminProduct(product.id, form);
    setProduct(updated);
    setForm({
      name: updated.name ?? updated.title ?? '',
      description: updated.description ?? '',
      price: Number(updated.price ?? 0),
      quantity: Number(updated.stockQuantity ?? updated.quantity ?? 0),
    });
    setIsEditing(false);
  };

  const remove = async () => {
    if (window.confirm('Confirmer la suppression de ce produit ?')) {
      await deleteAdminProduct(product.id);
      navigate('/admin');
    }
  };

  return (
    <div className="detail-card">
      <div className="detail-head">
        <h1>Détail produit</h1>
        <div className="detail-actions">
        {!isEditing ? <button onClick={() => setIsEditing(true)}><Pencil size={16} /> Modifier</button> : <button onClick={save}><Check size={16} /> Enregistrer</button>}
          <button className="danger" onClick={remove}><Trash2 size={16} /> Supprimer</button>
        </div>
      </div>

      <div className="detail-grid">
          {['name', 'description', 'price', 'quantity'].map((field) => (
            <label key={field}>
              <span>{field}</span>
            <input value={form[field]} disabled={!isEditing} onChange={(e) => setForm({ ...form, [field]: field === 'price' || field === 'quantity' ? Number(e.target.value) : e.target.value })} />
          </label>
        ))}
      </div>

      <style>{`
        .detail-card { background:white; border-radius:16px; padding:1.5rem; box-shadow:0 10px 30px rgba(15,23,42,0.08); }
        .detail-head { display:flex; justify-content:space-between; gap:1rem; align-items:center; margin-bottom:1.5rem; }
        .detail-actions { display:flex; gap:0.75rem; }
        .detail-grid { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:1rem; }
        label { display:flex; flex-direction:column; gap:0.35rem; }
        input { padding:0.85rem 1rem; border:1px solid #cbd5e1; border-radius:12px; }
        .danger { background:#fee2e2; color:#991b1b; }
        @media (max-width: 720px) { .detail-grid { grid-template-columns:1fr; } .detail-head { flex-direction:column; align-items:flex-start; } }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;
