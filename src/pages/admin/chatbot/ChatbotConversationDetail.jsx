import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft, User, Bot, Headphones, Mail } from 'lucide-react';
import { getAdminChatbotConversation } from '../../../services/api';
import './ChatbotConversationDetail.css';

const STATUS_LABELS = { open: 'En cours', escalated: 'Transféré support' };
const statusBadge = (s) => {
  if (s === 'open') return 'blue';
  if (s === 'escalated') return 'amber';
  return '';
};

const formatDateTime = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ChatbotConversationDetail = () => {
  const { id } = useParams();
  const [conv, setConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getAdminChatbotConversation(id);
        if (!cancelled) setConv(res.data);
      } catch {
        if (!cancelled) setError('Impossible de charger la conversation.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="adm-loading">
        <Loader2 size={32} className="adm-spin" />
        <p>Chargement…</p>
      </div>
    );
  }

  if (error || !conv) {
    return (
      <div className="adm-error">
        <AlertCircle size={18} /><span>{error || 'Conversation introuvable.'}</span>
      </div>
    );
  }

  const messages = Array.isArray(conv.messages) ? conv.messages : [];

  return (
    <div className="chatbot-detail-page">
      <header className="adm-page-head">
        <div className="u-flex-center">
          <Link to="/admin/chatbot" className="adm-icon-btn" title="Retour à la liste">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="adm-title">Conversation #{conv.id}</h1>
            <p className="adm-sub">Détail de la session chatbot</p>
          </div>
        </div>
        <span className={`adm-badge ${statusBadge(conv.status)} adm-badge--lg`}>
          {STATUS_LABELS[conv.status] ?? conv.status ?? '—'}
        </span>
      </header>

      {/* Meta card */}
      <div className="adm-card cb-meta-card">
        <div className="cb-meta-grid">
          <div className="cb-meta-item">
            <span className="cb-meta-label"><Mail size={13} /> Email</span>
            <span className="cb-meta-value">{conv.email || <em className="u-muted">Anonyme</em>}</span>
          </div>
          <div className="cb-meta-item">
            <span className="cb-meta-label">Sujet</span>
            <span className="cb-meta-value">{conv.subject || <em className="u-muted">—</em>}</span>
          </div>
          <div className="cb-meta-item">
            <span className="cb-meta-label">Créé le</span>
            <span className="cb-meta-value">{formatDateTime(conv.createdAt)}</span>
          </div>
          <div className="cb-meta-item">
            <span className="cb-meta-label">Dernière activité</span>
            <span className="cb-meta-value">{formatDateTime(conv.updatedAt)}</span>
          </div>
          {conv.contactRequestId && (
            <div className="cb-meta-item">
              <span className="cb-meta-label"><Headphones size={13} /> Contact support</span>
              <Link to={`/admin/contacts/${conv.contactRequestId}`} className="cb-meta-link">
                Voir la demande #{conv.contactRequestId} →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Conversation thread */}
      <div className="adm-card cb-thread-card">
        <h2 className="cb-thread-title">
          <span>Conversation</span>
          <span className="cb-msg-count">{messages.length} message{messages.length > 1 ? 's' : ''}</span>
        </h2>

        {messages.length === 0 ? (
          <div className="adm-empty u-pad-2">
            <p>Aucun message dans cette conversation.</p>
          </div>
        ) : (
          <div className="cb-thread">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={msg.id} className={`cb-msg cb-msg--${msg.sender}`}>
                  <div className="cb-msg-avatar">
                    {isBot ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className="cb-msg-content">
                    <div className="cb-msg-header">
                      <span className="cb-msg-sender">
                        {isBot ? 'Assistant' : (conv.email || 'Visiteur')}
                      </span>
                      {msg.questionKey && (
                        <span className="cb-msg-key">clé : {msg.questionKey}</span>
                      )}
                      <span className="cb-msg-time">{formatDateTime(msg.createdAt)}</span>
                    </div>
                    <div className="cb-msg-bubble">
                      {msg.content}
                    </div>
                    {msg.metadata && Object.keys(msg.metadata).length > 0 && (
                      <div className="cb-msg-meta">
                        {Object.entries(msg.metadata).map(([k, v]) => (
                          v !== null && v !== undefined && (
                            <span key={k} className="cb-msg-meta-tag">
                              {k}: {typeof v === 'boolean' ? (v ? 'oui' : 'non') : String(v)}
                            </span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatbotConversationDetail;
