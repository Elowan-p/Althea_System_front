import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft, User, Bot, Headphones, Mail } from 'lucide-react';
import { getAdminChatbotConversation } from '../../../services/api';

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/chatbot" className="adm-icon-btn" title="Retour à la liste">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="adm-title">Conversation #{conv.id}</h1>
            <p className="adm-sub">Détail de la session chatbot</p>
          </div>
        </div>
        <span className={`adm-badge ${statusBadge(conv.status)}`} style={{ fontSize: '0.8rem' }}>
          {STATUS_LABELS[conv.status] ?? conv.status ?? '—'}
        </span>
      </header>

      {/* Meta card */}
      <div className="adm-card cb-meta-card">
        <div className="cb-meta-grid">
          <div className="cb-meta-item">
            <span className="cb-meta-label"><Mail size={13} /> Email</span>
            <span className="cb-meta-value">{conv.email || <em style={{ color: '#94a3b8' }}>Anonyme</em>}</span>
          </div>
          <div className="cb-meta-item">
            <span className="cb-meta-label">Sujet</span>
            <span className="cb-meta-value">{conv.subject || <em style={{ color: '#94a3b8' }}>—</em>}</span>
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
          <div className="adm-empty" style={{ padding: '2rem' }}>
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

      <style>{`
        .cb-meta-card { margin-bottom: 1.5rem; }
        .cb-meta-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.25rem;
        }
        .cb-meta-item { display: flex; flex-direction: column; gap: 0.3rem; }
        .cb-meta-label {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.68rem; font-weight: 900; text-transform: uppercase;
          letter-spacing: 0.06em; color: #94a3b8;
        }
        .cb-meta-value { font-size: 0.92rem; font-weight: 700; color: #1e293b; }
        .cb-meta-link { font-size: 0.88rem; font-weight: 700; color: var(--primary); }
        .cb-meta-link:hover { text-decoration: underline; }

        .cb-thread-card { }
        .cb-thread-title {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 1rem; font-weight: 900; color: #012a4a;
          margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9;
        }
        .cb-msg-count {
          font-size: 0.75rem; font-weight: 700; color: #94a3b8;
          background: #f1f5f9; padding: 0.25rem 0.7rem; border-radius: 99px;
        }

        .cb-thread { display: flex; flex-direction: column; gap: 1.25rem; }

        .cb-msg { display: flex; gap: 0.9rem; }
        .cb-msg--bot { flex-direction: row; }
        .cb-msg--user { flex-direction: row-reverse; }

        .cb-msg-avatar {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .cb-msg--bot .cb-msg-avatar { background: linear-gradient(135deg, var(--primary, #005c97), #36d1dc); color: white; }
        .cb-msg--user .cb-msg-avatar { background: #f1f5f9; color: #64748b; }

        .cb-msg-content { flex: 1; min-width: 0; }
        .cb-msg--user .cb-msg-content { align-items: flex-end; display: flex; flex-direction: column; }

        .cb-msg-header {
          display: flex; align-items: center; gap: 0.6rem;
          margin-bottom: 0.35rem; flex-wrap: wrap;
        }
        .cb-msg--user .cb-msg-header { justify-content: flex-end; }
        .cb-msg-sender { font-size: 0.78rem; font-weight: 800; color: #475569; }
        .cb-msg-key {
          font-size: 0.68rem; font-weight: 700; color: #94a3b8;
          background: #f8fafc; border: 1px solid #e2e8f0;
          padding: 0.1rem 0.5rem; border-radius: 99px;
        }
        .cb-msg-time { font-size: 0.72rem; color: #94a3b8; margin-left: auto; }
        .cb-msg--user .cb-msg-time { margin-left: 0; margin-right: auto; }

        .cb-msg-bubble {
          display: inline-block; max-width: 80%;
          padding: 0.75rem 1rem; border-radius: 14px;
          font-size: 0.9rem; line-height: 1.55; font-weight: 500; color: #1e293b;
          word-break: break-word;
        }
        .cb-msg--bot .cb-msg-bubble { background: #f8fafc; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; }
        .cb-msg--user .cb-msg-bubble {
          background: linear-gradient(135deg, var(--primary, #005c97), #36d1dc);
          color: white; border-bottom-right-radius: 4px;
        }

        .cb-msg-meta { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.4rem; }
        .cb-msg-meta-tag {
          font-size: 0.68rem; font-weight: 700; color: #64748b;
          background: #f1f5f9; border-radius: 6px; padding: 0.15rem 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default ChatbotConversationDetail;
