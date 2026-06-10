import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle, Upload, ImageOff, CheckCircle2 } from 'lucide-react';
import { getCategory, createCategory, updateCategory, uploadFile, clearApiCache } from '../../../services/api';

const LANGS = ['fr', 'en', 'ru'];

const extractUploadUrl = (data) =>
  data?.url || data?.fileUrl || data?.path || data?.location || data?.filePath || '';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('fr');
  const [pictureUrl, setPictureUrl] = useState('');
  const [titles, setTitles] = useState({ fr: '', en: '', ru: '' });

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await getCategory(id);
        const cat = res.data || {};
        setPictureUrl(cat.pictureUrl || '');
        setTitles({
          fr: cat.title || '',
          en: cat.translations?.en?.title || '',
          ru: cat.translations?.ru?.title || '',
        });
      } catch (err) {
        console.error('Category load error:', err);
        setError('Impossible de charger la catégorie.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadFile(file);
      const url = extractUploadUrl(res.data);
      if (!url) throw new Error('URL absente de la réponse upload');
      setPictureUrl(url);
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
    if (!titles.fr.trim()) {
      setError('Le titre FR est obligatoire.');
      return;
    }

    const body = {
      title: titles.fr.trim(),
      pictureUrl: pictureUrl.trim(),
    };
    // Only ship non-empty translations so we never overwrite with blanks
    const translations = {};
    if (titles.en.trim()) translations.en = { title: titles.en.trim() };
    if (titles.ru.trim()) translations.ru = { title: titles.ru.trim() };
    if (Object.keys(translations).length > 0) body.translations = translations;

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateCategory(id, body);
      } else {
        await createCategory(body);
      }
      clearApiCache();
      navigate('/admin/categories');
    } catch (err) {
      console.error('Category save error:', err);
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
    <div className="category-form-page">
      <header className="adm-page-head">
        <div>
          <Link to="/admin/categories" className="back-link">
            <ArrowLeft size={15} /> Retour aux catégories
          </Link>
          <h1 className="adm-title">{isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h1>
        </div>
        <div className="adm-head-actions">
          <button type="submit" form="category-form" className="adm-btn primary" disabled={saving || uploading}>
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

      <form id="category-form" onSubmit={handleSubmit} className="cat-form-grid">
        <div className="adm-card">
          <div className="card-head-row">
            <h2 className="card-title">Titre</h2>
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
            <label className="adm-label">Titre ({lang}){lang === 'fr' && ' *'}</label>
            <input
              className="adm-input"
              type="text"
              value={titles[lang]}
              onChange={(e) => setTitles((prev) => ({ ...prev, [lang]: e.target.value }))}
              placeholder={lang === 'fr' ? 'Stérilisation' : 'Traduction du titre'}
            />
          </div>

          {lang !== 'fr' && (
            <p className="i18n-hint">
              <CheckCircle2 size={14} />
              Champ optionnel — si vide, la version française est affichée.
            </p>
          )}
        </div>

        <div className="adm-card">
          <h2 className="card-title">Image</h2>
          <div className="img-preview">
            {pictureUrl ? (
              <img src={pictureUrl} alt="Aperçu catégorie" />
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
              value={pictureUrl}
              onChange={(e) => setPictureUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      </form>

      <style>{`
        .back-link { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 800; color: var(--text-muted); margin-bottom: 0.5rem; }
        .back-link:hover { color: var(--primary); }

        .cat-form-grid { display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; align-items: start; }

        .card-title { font-size: 1rem; font-weight: 850; color: #012a4a; margin-bottom: 1.25rem; }
        .card-head-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; }
        .card-head-row .card-title { margin-bottom: 0; }

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

        @media (max-width: 1200px) {
          .cat-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default CategoryForm;
