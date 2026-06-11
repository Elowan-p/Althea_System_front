import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, AlertCircle, Upload, ImageOff, CheckCircle2
} from 'lucide-react';
import {
  getAdminProduct, createAdminProduct, updateAdminProduct,
  getCategories, uploadFile, clearApiCache
} from '../../../services/api';

const LANGS = ['fr', 'en', 'ru'];
const EMPTY_I18N = { title: '', description: '', powerSupplyType: '', medicalDomain: '' };

// The upload endpoint returns the file URL — key name depends on backend version
const extractUploadUrl = (data) =>
  data?.url || data?.fileUrl || data?.path || data?.location || data?.filePath || '';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [lang, setLang] = useState('fr');

  const [form, setForm] = useState({
    price: '',
    inStock: 0,
    categoryId: '',
    pictureUrl: '',
    isPublished: false,
    isPortable: false,
    isOneTimeUse: false,
  });
  const [i18nFields, setI18nFields] = useState({
    fr: { ...EMPTY_I18N },
    en: { ...EMPTY_I18N },
    ru: { ...EMPTY_I18N },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const catsRes = await getCategories();
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);

        if (isEdit) {
          const res = await getAdminProduct(id);
          const p = res.data || {};
          setForm({
            price: p.price ?? '',
            inStock: p.inStock ?? 0,
            categoryId: p.category?.id ?? p.categoryId ?? '',
            pictureUrl: p.pictureUrl ?? '',
            isPublished: Boolean(p.isPublished),
            isPortable: Boolean(p.isPortable),
            isOneTimeUse: Boolean(p.isOneTimeUse),
          });
          setI18nFields({
            fr: {
              title: p.title ?? '',
              description: p.description ?? '',
              powerSupplyType: p.powerSupplyType ?? '',
              medicalDomain: p.medicalDomain ?? '',
            },
            en: { ...EMPTY_I18N, ...(p.translations?.en || {}) },
            ru: { ...EMPTY_I18N, ...(p.translations?.ru || {}) },
          });
        }
      } catch (err) {
        console.error('Product form load error:', err);
        setError(isEdit ? 'Impossible de charger le produit.' : 'Impossible de charger les catégories.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const setI18nValue = (field, value) => {
    setI18nFields((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
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
      setForm((prev) => ({ ...prev, pictureUrl: url }));
    } catch (err) {
      console.error('Upload error:', err);
      setError('L\'upload de l\'image a échoué.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const validate = () => {
    const errors = {};
    if (!i18nFields.fr.title.trim()) errors.title = 'Le titre FR est obligatoire.';
    const price = Number(form.price);
    if (form.price === '' || Number.isNaN(price) || price <= 0) errors.price = 'Prix invalide (doit être > 0).';
    const stock = Number(form.inStock);
    if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) errors.inStock = 'Stock invalide (entier ≥ 0).';
    if (!form.categoryId) errors.categoryId = 'La catégorie est obligatoire.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Only ship non-empty translated fields so we never overwrite with blanks
  const buildTranslation = (values) => {
    const out = {};
    Object.entries(values).forEach(([key, val]) => {
      if (typeof val === 'string' && val.trim() !== '') out[key] = val.trim();
    });
    return Object.keys(out).length > 0 ? out : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setError('Veuillez corriger les champs en erreur.');
      return;
    }

    const body = {
      title: i18nFields.fr.title.trim(),
      description: i18nFields.fr.description.trim(),
      price: String(form.price),
      pictureUrl: form.pictureUrl,
      inStock: Number(form.inStock),
      isPublished: form.isPublished,
      isPortable: form.isPortable,
      isOneTimeUse: form.isOneTimeUse,
      powerSupplyType: i18nFields.fr.powerSupplyType.trim(),
      medicalDomain: i18nFields.fr.medicalDomain.trim(),
      categoryId: Number(form.categoryId),
    };
    const translations = {};
    const en = buildTranslation(i18nFields.en);
    const ru = buildTranslation(i18nFields.ru);
    if (en) translations.en = en;
    if (ru) translations.ru = ru;
    if (Object.keys(translations).length > 0) body.translations = translations;

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateAdminProduct(id, body);
      } else {
        await createAdminProduct(body);
      }
      clearApiCache();
      navigate('/admin/products');
    } catch (err) {
      console.error('Product save error:', err);
      setError(err.response?.data?.message || 'L\'enregistrement a échoué.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="adm-loading">
        <Loader2 size={32} className="adm-spin" />
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      <header className="adm-page-head">
        <div>
          <Link to="/admin/products" className="back-link">
            <ArrowLeft size={15} /> Retour aux produits
          </Link>
          <h1 className="adm-title">{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h1>
        </div>
        <div className="adm-head-actions">
          <button type="submit" form="product-form" className="adm-btn primary" disabled={saving || uploading}>
            {saving ? <Loader2 size={16} className="adm-spin" /> : <Save size={16} />}
            Enregistrer
          </button>
        </div>
      </header>

      {error && (
        <div className="adm-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form id="product-form" onSubmit={handleSubmit} className="form-grid">
        <div className="form-main">
          <div className="adm-card">
            <div className="card-head-row">
              <h2 className="card-title">Contenu</h2>
              <div className="adm-lang-tabs">
                {LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`adm-lang-tab ${lang === l ? 'active' : ''}`}
                    onClick={() => setLang(l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="adm-field">
              <label className="adm-label">
                Titre ({lang}){lang === 'fr' && ' *'}
              </label>
              <input
                className="adm-input"
                type="text"
                value={i18nFields[lang].title}
                onChange={(e) => setI18nValue('title', e.target.value)}
                placeholder={lang === 'fr' ? 'Moniteur patient' : 'Traduction du titre'}
              />
              {lang === 'fr' && fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
            </div>

            <div className="adm-field">
              <label className="adm-label">Description ({lang})</label>
              <textarea
                className="adm-textarea"
                rows={5}
                value={i18nFields[lang].description}
                onChange={(e) => setI18nValue('description', e.target.value)}
                placeholder="Description détaillée du produit"
              />
            </div>

            <div className="two-cols">
              <div className="adm-field">
                <label className="adm-label">Type d'alimentation ({lang})</label>
                <input
                  className="adm-input"
                  type="text"
                  value={i18nFields[lang].powerSupplyType}
                  onChange={(e) => setI18nValue('powerSupplyType', e.target.value)}
                  placeholder="Batterie/Secteur"
                />
              </div>
              <div className="adm-field">
                <label className="adm-label">Domaine médical ({lang})</label>
                <input
                  className="adm-input"
                  type="text"
                  value={i18nFields[lang].medicalDomain}
                  onChange={(e) => setI18nValue('medicalDomain', e.target.value)}
                  placeholder="Diagnostic"
                />
              </div>
            </div>

            {lang !== 'fr' && (
              <p className="i18n-hint">
                <CheckCircle2 size={14} />
                Champs optionnels — si vides, la version française est affichée.
              </p>
            )}
          </div>
        </div>

        <div className="form-side">
          <div className="adm-card">
            <h2 className="card-title">Image</h2>
            <div className="img-preview">
              {form.pictureUrl ? (
                <img src={form.pictureUrl} alt="Aperçu produit" />
              ) : (
                <div className="img-placeholder"><ImageOff size={32} /></div>
              )}
            </div>
            <label className={`adm-btn upload-btn ${uploading ? 'disabled' : ''}`}>
              {uploading ? <Loader2 size={16} className="adm-spin" /> : <Upload size={16} />}
              {uploading ? 'Upload en cours...' : 'Uploader une image'}
              <input type="file" accept="image/*" hidden disabled={uploading} onChange={handleUpload} />
            </label>
            <div className="adm-field" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <label className="adm-label">URL de l'image</label>
              <input
                className="adm-input"
                type="text"
                value={form.pictureUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, pictureUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="adm-card">
            <h2 className="card-title">Tarification & stock</h2>
            <div className="adm-field">
              <label className="adm-label">Prix (€) *</label>
              <input
                className="adm-input"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="199.99"
              />
              {fieldErrors.price && <span className="field-error">{fieldErrors.price}</span>}
            </div>
            <div className="adm-field">
              <label className="adm-label">Stock *</label>
              <input
                className="adm-input"
                type="number"
                step="1"
                min="0"
                value={form.inStock}
                onChange={(e) => setForm((prev) => ({ ...prev, inStock: e.target.value }))}
              />
              {fieldErrors.inStock && <span className="field-error">{fieldErrors.inStock}</span>}
            </div>
            <div className="adm-field" style={{ marginBottom: 0 }}>
              <label className="adm-label">Catégorie *</label>
              <select
                className="adm-select"
                value={form.categoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="">— Sélectionner —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
              {fieldErrors.categoryId && <span className="field-error">{fieldErrors.categoryId}</span>}
            </div>
          </div>

          <div className="adm-card">
            <h2 className="card-title">Options</h2>
            <div className="checks-stack">
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                />
                Publié sur le site
              </label>
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={form.isPortable}
                  onChange={(e) => setForm((prev) => ({ ...prev, isPortable: e.target.checked }))}
                />
                Portable
              </label>
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={form.isOneTimeUse}
                  onChange={(e) => setForm((prev) => ({ ...prev, isOneTimeUse: e.target.checked }))}
                />
                Usage unique
              </label>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .back-link { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 800; color: var(--text-muted); margin-bottom: 0.5rem; }
        .back-link:hover { color: var(--primary); }

        .form-grid { display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; align-items: start; }
        .form-main, .form-side { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }

        .card-title { font-size: 1rem; font-weight: 850; color: #012a4a; margin-bottom: 1.25rem; }
        .card-head-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; }
        .card-head-row .card-title { margin-bottom: 0; }

        .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        .field-error { font-size: 0.78rem; font-weight: 700; color: var(--error); }
        .i18n-hint { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); background: #f8fafc; padding: 0.7rem 1rem; border-radius: 10px; }

        .img-preview {
          height: 200px; border-radius: 14px; border: 1.5px dashed var(--border);
          background: #fcfdfe; display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem; overflow: hidden;
        }
        .img-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .img-placeholder { color: #cbd5e1; }
        .upload-btn { width: 100%; cursor: pointer; }
        .upload-btn.disabled { opacity: 0.6; pointer-events: none; }

        .checks-stack { display: flex; flex-direction: column; gap: 0.9rem; }

        @media (max-width: 1200px) {
          .form-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .two-cols { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ProductForm;
