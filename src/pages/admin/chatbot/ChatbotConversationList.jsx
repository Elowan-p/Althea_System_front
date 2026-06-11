import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, Inbox, Eye, ChevronLeft, ChevronRight, Filter, MessageSquare } from 'lucide-react';
import { getAdminChatbotConversations } from '../../../services/api';
import './ChatbotConversationList.css';

const PAGE_LIMIT = 20;

const STATUS_LABELS = { open: 'En cours', escalated: 'Transféré support' };
const statusBadge = (s) => {
  if (s === 'open') return 'blue';
  if (s === 'escalated') return 'amber';
  return '';
};

const formatDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ChatbotConversationList = () => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { page, limit: PAGE_LIMIT };
        if (statusFilter) params.status = statusFilter;
        const res = await getAdminChatbotConversations(params);
        if (cancelled) return;
        setItems(Array.isArray(res.data?.items) ? res.data.items : []);
        setMeta(res.data?.meta ?? null);
      } catch {
        if (!cancelled) setError('Impossible de charger les conversations.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [statusFilter, page]);

  const totalPages = meta?.pages ?? 1;

  return (
    <div className="chatbot-list-page">
      <header className="adm-page-head">
        <div>
          <h1 className="adm-title">Conversations Chatbot</h1>
          <p className="adm-sub">Toutes les sessions ouvertes via le widget d'assistance</p>
        </div>
        {meta && (
          <span className="adm-badge blue adm-badge--lg">
            {meta.total} conversation{meta.total > 1 ? 's' : ''}
          </span>
        )}
      </header>

      <div className="adm-toolbar">
        <Filter size={16} color="#94a3b8" />
        <select
          className="adm-select"
          className="u-w-220"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tous les statuts</option>
          <option value="open">En cours</option>
          <option value="escalated">Transféré support</option>
        </select>
      </div>

      {error && (
        <div className="adm-error">
          <AlertCircle size={18} /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="adm-loading">
          <Loader2 size={32} className="adm-spin" />
          <p>Chargement des conversations…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="adm-empty">
          <Inbox size={56} strokeWidth={1} color="#cbd5e1" />
          <h3>Aucune conversation</h3>
          <p>{statusFilter ? 'Aucune conversation pour ce statut.' : 'Les conversations chatbot apparaîtront ici.'}</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Sujet</th>
                <th>Statut</th>
                <th>Dernier message</th>
                <th>Date</th>
                <th className="u-text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((conv) => (
                <tr key={conv.id}>
                  <td><span className="conv-id">#{conv.id}</span></td>
                  <td>
                    <div className="conv-email">
                      <MessageSquare size={14} color="#94a3b8" />
                      {conv.email || <span className="conv-anon">Anonyme</span>}
                    </div>
                  </td>
                  <td>{conv.subject || <span className="u-muted">—</span>}</td>
                  <td>
                    <span className={`adm-badge ${statusBadge(conv.status)}`}>
                      {STATUS_LABELS[conv.status] ?? conv.status ?? '—'}
                    </span>
                  </td>
                  <td className="conv-last-msg">
                    {conv.lastMessage?.content
                      ? conv.lastMessage.content.length > 60
                        ? `${conv.lastMessage.content.slice(0, 60)}…`
                        : conv.lastMessage.content
                      : <span className="u-muted">—</span>}
                  </td>
                  <td>{formatDate(conv.updatedAt ?? conv.createdAt)}</td>
                  <td>
                    <div className="row-actions u-justify-end">
                      <Link to={`/admin/chatbot/${conv.id}`} className="adm-icon-btn" title="Voir la conversation">
                        <Eye size={15} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="adm-pagination">
        <span>Page {page} / {totalPages}</span>
        <button className="adm-icon-btn" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
          <ChevronLeft size={16} />
        </button>
        <button className="adm-icon-btn" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
};

export default ChatbotConversationList;
