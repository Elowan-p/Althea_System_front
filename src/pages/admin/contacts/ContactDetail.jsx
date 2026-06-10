import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Loader2, AlertCircle, Send, MailCheck, CheckCircle2, Mail, Calendar, User
} from 'lucide-react';
import { getAdminContact, updateContactStatus, replyContact } from '../../../services/api';

const STATUS_LABELS = { new: 'Nouveau', read: 'Lu', replied: 'Répondu' };

const contactStatusBadge = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'new' || s === 'nouveau') return 'amber';
  if (s === 'replied' || s === 'répondu' || s === 'repondu') return 'green';
  if (s === 'read' || s === 'lu') return 'blue';
  return '';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ContactDetail = () => {
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [marking, setMarking] = useState(false);

  const fetchMessage = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminContact(id);
      setMessage(res.data || null);
    } catch (err) {
      console.error('Contact detail fetch error:', err);
      setError('Impossible de charger le message.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchMessage(); }, [fetchMessage]);

  const handleMarkAsRead = async () => {
    setMarking(true);
    setError('');
    setSuccess('');
    try {
      await updateContactStatus(id, 'read');
      setSuccess('Message marqué comme lu.');
      await fetchMessage();
    } catch (err) {
      console.error('Status update error:', err);
      setError('La mise à jour du statut a échoué.');
    } finally {
      setMarking(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      setError('La réponse ne peut pas être vide.');
      return;
    }
    setSending(true);
    setError('');
    setSuccess('');
    try {
      await replyContact(id, reply.trim());
      setSuccess('Réponse envoyée avec succès.');
      setReply('');
      await fetchMessage();
    } catch (err) {
      console.error('Reply error:', err);
      setError('L\'envoi de la réponse a échoué.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="adm-loading">
        <Loader2 size={32} className="adm-spin" />
        <p>Chargement du message...</p>
      </div>
    );
  }

  if (!message) {
    return (
      <div>
        <Link to="/admin/contacts" className="back-link"><ArrowLeft size={15} /> Retour aux messages</Link>
        <div className="adm-error" style={{ marginTop: '1rem' }}>
          <AlertCircle size={18} />
          <span>{error || 'Message introuvable.'}</span>
        </div>
      </div>
    );
  }

  const status = (message.status || '').toLowerCase();
  const isUnread = status === 'new' || status === 'nouveau' || status === '';

  return (
    <div className="contact-detail-page">
      <header className="adm-page-head">
        <div>
          <Link to="/admin/contacts" className="back-link">
            <ArrowLeft size={15} /> Retour aux messages
          </Link>
          <h1 className="adm-title">
            {message.subject || '(Sans sujet)'}{' '}
            <span className={`adm-badge ${contactStatusBadge(message.status)}`}>
              {STATUS_LABELS[status] || message.status || '—'}
            </span>
          </h1>
        </div>
        <div className="adm-head-actions">
          {isUnread && (
            <button className="adm-btn" onClick={handleMarkAsRead} disabled={marking}>
              {marking ? <Loader2 size={16} className="adm-spin" /> : <MailCheck size={16} />}
              Marquer comme lu
            </button>
          )}
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

      <div className="adm-card msg-card">
        <div className="msg-meta">
          <div className="msg-meta-item">
            <User size={15} />
            <span>{message.name || '—'}</span>
          </div>
          <div className="msg-meta-item">
            <Mail size={15} />
            <a href={`mailto:${message.email}`} className="msg-email">{message.email}</a>
          </div>
          <div className="msg-meta-item">
            <Calendar size={15} />
            <span>{formatDate(message.createdAt || message.date)}</span>
          </div>
        </div>
        <div className="msg-body">{message.message}</div>
      </div>

      <div className="adm-card">
        <h2 className="card-title"><Send size={16} /> Répondre</h2>
        <form onSubmit={handleReply}>
          <div className="adm-field">
            <label className="adm-label">Votre réponse (envoyée par email à {message.email})</label>
            <textarea
              className="adm-textarea"
              rows={6}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Bonjour, merci pour votre message..."
              disabled={sending}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="adm-btn primary" disabled={sending || !reply.trim()}>
              {sending ? <Loader2 size={16} className="adm-spin" /> : <Send size={16} />}
              Envoyer la réponse
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .back-link { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 800; color: var(--text-muted); margin-bottom: 0.5rem; }
        .back-link:hover { color: var(--primary); }

        .contact-detail-page .adm-title { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }

        .msg-card { margin-bottom: 1.5rem; }
        .msg-meta { display: flex; flex-wrap: wrap; gap: 1.5rem; padding-bottom: 1.25rem; margin-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9; }
        .msg-meta-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 700; color: #475569; }
        .msg-meta-item svg { color: #94a3b8; }
        .msg-email { color: var(--primary); }
        .msg-email:hover { text-decoration: underline; }

        .msg-body { font-size: 0.95rem; color: #334155; font-weight: 550; line-height: 1.8; white-space: pre-wrap; }

        .card-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 850; color: #012a4a; margin-bottom: 1.25rem; }
      `}</style>
    </div>
  );
};

export default ContactDetail;
