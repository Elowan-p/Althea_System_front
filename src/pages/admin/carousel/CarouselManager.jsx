import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Loader2, AlertCircle, GalleryHorizontal,
  ArrowUp, ArrowDown, Upload, ImageOff, Save, ExternalLink
} from 'lucide-react';
import {
  getAdminCarousel, createCarouselItem, updateCarouselItem,
  deleteCarouselItem, reorderCarousel, uploadFile
} from '../../../services/api';

const EMPTY_FORM = { title: '', description: '', imageUrl: '', link: '' };

const extractUploadUrl = (data) =>
  data?.url || data?.fileUrl || data?.path || data?.location || data?.filePath || '';

const sortByOrder = (items) => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const CarouselManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null); 
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminCarousel();
      setItems(sortByOrder(Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      console.error('Carousel fetch error:', err);
      setError('Impossible de charger le carousel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing({});
  };

  const openEdit = (item) => {
    setForm({
      title: item.title || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      link: item.link || '',
    });
    setEditing(item);
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    
    const renumbered = next.map((item, i) => ({ ...item, order: i + 1 }));
    setItems(renumbered);

    setWorking(true);
    setError('');
    try {
      await reorderCarousel(renumbered.map(({ id, order }) => ({ id, order })));
    } catch (err) {
      console.error('Carousel reorder error:', err);
      setError('Le réordonnancement a échoué.');
      await fetchItems();
    } finally {
      setWorking(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadFile(file);
      const url = extractUploadUrl(res.data);
      if (!url) throw new Error('URL absente de la réponse upload');
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error('Upload error:', err);
      setError('L\'upload de l\'image a échoué.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.imageUrl.trim()) {
      setError('Le titre et l\'image sont obligatoires.');
      return;
    }
    setWorking(true);
    setError('');
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        link: form.link.trim(),
      };
      if (editing?.id) {
        await updateCarouselItem(editing.id, body);
      } else {
        await createCarouselItem({ ...body, order: items.length + 1 });
      }
      setEditing(null);
      await fetchItems();
    } catch (err) {
      console.error('Carousel save error:', err);
      setError('L\'enregistrement a échoué.');
    } finally {
      setWorking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setWorking(true);
    setError('');
    try {
      await deleteCarouselItem(confirmDelete.id);
      setConfirmDelete(null);
      await fetchItems();
    } catch (err) {
      console.error('Carousel delete error:', err);
      setError('La suppression a échoué.');
      setConfirmDelete(null);
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="adm-loading">
        <Loader2 size={32} className="adm-spin" />
        <p>Chargement du carousel...</p>
      </div>
    );
  }

  return (
    <div className="carousel-page">
      <header className="adm-page-head">
        <div>
          <h1 className="adm-title">Carousel</h1>
          <p className="adm-sub">{items.length} élément(s) — l'ordre définit l'affichage sur la page d'accueil</p>
        </div>
        <div className="adm-head-actions">
          <button className="adm-btn primary" onClick={openCreate}>
            <Plus size={16} /> Nouvel élément
          </button>
        </div>
      </header>

      {error && (
        <div className="adm-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="adm-empty">
          <GalleryHorizontal size={56} strokeWidth={1} color="#cbd5e1" />
          <h3>Carousel vide</h3>
          <p>Ajoutez un premier visuel pour la page d'accueil.</p>
        </div>
      ) : (
        <div className="carousel-list">
          {items.map((item, index) => (
            <div key={item.id} className="carousel-item adm-card">
              <div className="order-controls">
                <button
                  className="adm-icon-btn"
                  disabled={index === 0 || working}
                  title="Monter"
                  onClick={() => handleMove(index, -1)}
                >
                  <ArrowUp size={15} />
                </button>
                <span className="order-num">{index + 1}</span>
                <button
                  className="adm-icon-btn"
                  disabled={index === items.length - 1 || working}
                  title="Descendre"
                  onClick={() => handleMove(index, 1)}
                >
                  <ArrowDown size={15} />
                </button>
              </div>

              <div className="carousel-preview">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <div className="preview-placeholder"><ImageOff size={24} /></div>
                )}
              </div>

              <div className="carousel-info">
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer" className="carousel-link">
                    <ExternalLink size={12} /> {item.link}
                  </a>
                )}
              </div>

              <div className="carousel-actions">
                <button className="adm-icon-btn" title="Modifier" onClick={() => openEdit(item)}>
                  <Pencil size={15} />
                </button>
                <button className="adm-icon-btn danger" title="Supprimer" onClick={() => setConfirmDelete(item)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <div className="adm-modal-overlay" onClick={() => !working && !uploading && setEditing(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing?.id ? 'Modifier l\'élément' : 'Nouvel élément'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="adm-field">
                <label className="adm-label">Titre *</label>
                <input
                  className="adm-input"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre du slide"
                />
              </div>
              <div className="adm-field">
                <label className="adm-label">Description</label>
                <textarea
                  className="adm-textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Texte affiché sur le slide"
                />
              </div>
              <div className="adm-field">
                <label className="adm-label">Image *</label>
                {form.imageUrl && (
                  <div className="modal-img-preview">
                    <img src={form.imageUrl} alt="Aperçu" />
                  </div>
                )}
                <label className={`adm-btn upload-btn ${uploading ? 'disabled' : ''}`}>
                  {uploading ? <Loader2 size={16} className="adm-spin" /> : <Upload size={16} />}
                  {uploading ? 'Upload en cours...' : 'Uploader une image'}
                  <input type="file" accept="image/*" hidden disabled={uploading} onChange={handleUpload} />
                </label>
                <input
                  className="adm-input"
                  type="text"
                  style={{ marginTop: '0.6rem' }}
                  value={form.imageUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://... (URL de l'image)"
                />
              </div>
              <div className="adm-field">
                <label className="adm-label">Lien (optionnel)</label>
                <input
                  className="adm-input"
                  type="text"
                  value={form.link}
                  onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                  placeholder="https://... ou /category/1"
                />
              </div>
              <div className="adm-modal-actions">
                <button type="button" className="adm-btn" disabled={working || uploading} onClick={() => setEditing(null)}>
                  Annuler
                </button>
                <button type="submit" className="adm-btn primary" disabled={working || uploading}>
                  {working ? <Loader2 size={15} className="adm-spin" /> : <Save size={15} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="adm-modal-overlay" onClick={() => !working && setConfirmDelete(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>L'élément <strong>{confirmDelete.title}</strong> sera retiré du carousel. Cette action est irréversible.</p>
            <div className="adm-modal-actions">
              <button className="adm-btn" disabled={working} onClick={() => setConfirmDelete(null)}>
                Annuler
              </button>
              <button className="adm-btn danger" disabled={working} onClick={handleDelete}>
                {working ? <Loader2 size={15} className="adm-spin" /> : <Trash2 size={15} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .carousel-list { display: flex; flex-direction: column; gap: 1rem; }
        .carousel-item { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 1.25rem; }

        .order-controls { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
        .order-num { font-size: 0.8rem; font-weight: 900; color: var(--text-muted); }

        .carousel-preview {
          width: 160px; height: 90px; border-radius: 12px; overflow: hidden;
          background: #f1f5f9; border: 1px solid var(--border); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .carousel-preview img { width: 100%; height: 100%; object-fit: cover; }
        .preview-placeholder { color: #cbd5e1; }

        .carousel-info { flex: 1; min-width: 0; }
        .carousel-info h3 { font-size: 1rem; font-weight: 850; color: #012a4a; margin-bottom: 0.25rem; }
        .carousel-info p { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .carousel-link { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; font-weight: 700; color: var(--primary); margin-top: 0.3rem; word-break: break-all; }

        .carousel-actions { display: flex; gap: 0.5rem; }

        .modal-img-preview {
          height: 140px; border-radius: 12px; border: 1.5px dashed var(--border);
          background: #fcfdfe; display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.6rem; overflow: hidden;
        }
        .modal-img-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .upload-btn { width: 100%; cursor: pointer; }
        .upload-btn.disabled { opacity: 0.6; pointer-events: none; }

        @media (max-width: 768px) {
          .carousel-item { flex-wrap: wrap; }
          .carousel-preview { width: 100%; height: 140px; }
        }
      `}</style>
    </div>
  );
};

export default CarouselManager;
