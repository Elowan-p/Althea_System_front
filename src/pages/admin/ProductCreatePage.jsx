import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminProduct } from '../../services/adminApi';

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', price: '', quantity: '', category: 'Imaging' });

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stockQuantity: Number(form.quantity),
      category: form.category,
    };
    const created = await createAdminProduct(payload);
    navigate(`/admin/products/${created.id}`);
  };

  return (
    <form className="create-card" onSubmit={submit}>
      <h1>Nouveau produit</h1>
      <div className="grid">
        <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Prix" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Quantité" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Imaging</option><option>Surgery</option><option>Diagnostics</option><option>Laboratory</option><option>Infrastructure</option>
        </select>
      </div>
      <textarea placeholder="Description" rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <button type="submit">Créer</button>

      <style>{`
        .create-card { background:white; border-radius:16px; padding:1.5rem; box-shadow:0 10px 30px rgba(15,23,42,0.08); display:flex; flex-direction:column; gap:1rem; }
        .grid { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:1rem; }
        input, select, textarea { padding:0.85rem 1rem; border:1px solid #cbd5e1; border-radius:12px; width:100%; }
        @media (max-width: 720px) { .grid { grid-template-columns:1fr; } }
      `}</style>
    </form>
  );
};

export default ProductCreatePage;
