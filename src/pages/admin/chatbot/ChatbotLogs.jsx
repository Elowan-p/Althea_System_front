import { useState, useEffect } from 'react';
import {
  Loader2, AlertCircle, Bot, User, MessageSquare, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getChatbotLogs, getChatbotSession } from '../../../services/api';

const PAGE_SIZE = 50;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

// One page of raw logs → list of sessions (most recent first)
const groupBySession = (logs) => {
  const sessions = new Map();
  logs.forEach((log) => {
    const key = log.sessionId || 'inconnu';
    if (!sessions.has(key)) {
      sessions.set(key, { sessionId: key, count: 0, preview: '', lastDate: null });
    }
    const session = sessions.get(key);
    session.count += 1;
    if (!session.preview && log.message) session.preview = log.message;
    const date = log.createdAt || log.date;
    if (date && (!session.lastDate || new Date(date) > new Date(session.lastDate))) {
      session.lastDate = date;
    }
  });
  return [...sessions.values()];
};

const ChatbotLogs = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [logCount, setLogCount] = useState(0);

  const [activeSession, setActiveSession] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [convLoading, setConvLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getChatbotLogs({ limit: PAGE_SIZE, offset: page * PAGE_SIZE });
        if (cancelled) return;
        const logs = Array.isArray(res.data) ? res.data : [];
        setLogCount(logs.length);
        setSessions(groupBySession(logs));
      } catch (err) {
        if (!cancelled) {
          console.error('Chatbot logs fetch error:', err);
          setError('Impossible de charger les logs du chatbot.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchLogs();
    return () => { cancelled = true; };
  }, [page]);

  const openSession = async (sessionId) => {
    setActiveSession(sessionId);
    setConvLoading(true);
    setConversation([]);
    try {
      const res = await getChatbotSession(sessionId);
      const logs = Array.isArray(res.data) ? res.data : [];
      const sorted = [...logs].sort((a, b) => {
        const da = new Date(a.createdAt || a.date || 0).getTime();
        const db = new Date(b.createdAt || b.date || 0).getTime();
        if (da !== db) return da - db;
        return (a.id ?? 0) - (b.id ?? 0);
      });
      setConversation(sorted);
    } catch (err) {
      console.error('Chatbot session fetch error:', err);
      setError('Impossible de charger cette session.');
    } finally {
      setConvLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="adm-loading">
        <Loader2 size={32} className="adm-spin" />
        <p>Chargement des logs chatbot...</p>
      </div>
    );
  }

  return (
    <div className="chatbot-logs-page">
      <header className="adm-page-head">
        <div>
          <h1 className="adm-title">Logs du chatbot</h1>
          <p className="adm-sub">Consultation en lecture seule des conversations</p>
        </div>
      </header>

      {error && (
        <div className="adm-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {sessions.length === 0 && !error ? (
        <div className="adm-empty">
          <Bot size={56} strokeWidth={1} color="#cbd5e1" />
          <h3>Aucun log</h3>
          <p>Les conversations du chatbot apparaîtront ici.</p>
        </div>
      ) : (
        <div className="logs-grid">
          <div className="sessions-pane">
            <div className="adm-card sessions-card">
              {sessions.map((session) => (
                <button
                  key={session.sessionId}
                  type="button"
                  className={`session-row ${activeSession === session.sessionId ? 'active' : ''}`}
                  onClick={() => openSession(session.sessionId)}
                >
                  <div className="session-icon"><MessageSquare size={16} /></div>
                  <div className="session-meta">
                    <span className="session-id" title={session.sessionId}>{session.sessionId}</span>
                    <span className="session-preview">{session.preview || '—'}</span>
                  </div>
                  <div className="session-side">
                    <span className="adm-badge blue">{session.count}</span>
                    {session.lastDate && <span className="session-date">{formatDate(session.lastDate)}</span>}
                  </div>
                </button>
              ))}
            </div>
            <div className="adm-pagination">
              <span>Page {page + 1}</span>
              <button className="adm-icon-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <button
                className="adm-icon-btn"
                disabled={logCount < PAGE_SIZE}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="adm-card conv-pane">
            {!activeSession ? (
              <div className="adm-empty">
                <Bot size={42} strokeWidth={1} color="#cbd5e1" />
                <p>Sélectionnez une session pour afficher la conversation.</p>
              </div>
            ) : convLoading ? (
              <div className="adm-loading">
                <Loader2 size={28} className="adm-spin" />
                <p>Chargement de la conversation...</p>
              </div>
            ) : (
              <>
                <div className="conv-head">
                  <h2>Session</h2>
                  <code className="conv-session-id">{activeSession}</code>
                </div>
                <div className="conv-thread">
                  {conversation.length === 0 && (
                    <p className="muted-note">Aucun échange enregistré pour cette session.</p>
                  )}
                  {conversation.map((log, idx) => (
                    <div key={log.id ?? idx} className="conv-exchange">
                      {log.message && (
                        <div className="bubble-row user">
                          <div className="bubble user-bubble">
                            <div className="bubble-head"><User size={13} /> Visiteur</div>
                            <p>{log.message}</p>
                          </div>
                        </div>
                      )}
                      {log.response && (
                        <div className="bubble-row bot">
                          <div className="bubble bot-bubble">
                            <div className="bubble-head"><Bot size={13} /> Chatbot</div>
                            <p>{log.response}</p>
                          </div>
                        </div>
                      )}
                      {(log.createdAt || log.date) && (
                        <div className="exchange-date">{formatDate(log.createdAt || log.date)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .logs-grid { display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem; align-items: start; }

        .sessions-card { padding: 0.6rem; display: flex; flex-direction: column; gap: 0.25rem; max-height: 70vh; overflow-y: auto; }
        .session-row {
          display: flex; align-items: center; gap: 0.8rem; width: 100%;
          padding: 0.8rem; border-radius: 12px; text-align: left;
          transition: var(--transition);
        }
        .session-row:hover { background: #f8fafc; }
        .session-row.active { background: #f0f4f8; box-shadow: inset 0 0 0 1.5px var(--primary); }
        .session-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: #f1f5f9; color: var(--primary);
          display: flex; align-items: center; justify-content: center;
        }
        .session-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .session-id { font-size: 0.78rem; font-weight: 850; color: #012a4a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace; }
        .session-preview { font-size: 0.78rem; font-weight: 600; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .session-side { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
        .session-date { font-size: 0.68rem; font-weight: 700; color: #94a3b8; white-space: nowrap; }

        .conv-pane { min-height: 400px; }
        .conv-head { display: flex; align-items: center; gap: 0.8rem; padding-bottom: 1rem; margin-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9; }
        .conv-head h2 { font-size: 1rem; font-weight: 850; color: #012a4a; }
        .conv-session-id { font-size: 0.78rem; background: #f1f5f9; padding: 0.3rem 0.7rem; border-radius: 8px; color: #475569; font-weight: 700; word-break: break-all; }

        .conv-thread { display: flex; flex-direction: column; gap: 1.25rem; }
        .conv-exchange { display: flex; flex-direction: column; gap: 0.6rem; }
        .bubble-row { display: flex; }
        .bubble-row.user { justify-content: flex-end; }
        .bubble-row.bot { justify-content: flex-start; }
        .bubble { max-width: 75%; padding: 0.8rem 1rem; border-radius: 16px; font-size: 0.88rem; font-weight: 550; line-height: 1.6; }
        .bubble p { white-space: pre-wrap; }
        .bubble-head { display: flex; align-items: center; gap: 0.4rem; font-size: 0.68rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.3rem; opacity: 0.75; }
        .user-bubble { background: var(--primary); color: white; border-bottom-right-radius: 4px; }
        .bot-bubble { background: #f1f5f9; color: #1e293b; border-bottom-left-radius: 4px; }
        .exchange-date { font-size: 0.68rem; font-weight: 700; color: #cbd5e1; text-align: center; }

        .muted-note { font-size: 0.88rem; color: var(--text-muted); font-weight: 600; }

        @media (max-width: 1100px) {
          .logs-grid { grid-template-columns: 1fr; }
          .sessions-card { max-height: 320px; }
        }
      `}</style>
    </div>
  );
};

export default ChatbotLogs;
