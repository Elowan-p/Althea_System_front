import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, Inbox, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { getAdminContacts } from '../../../services/api';
import './ContactList.css';

const PAGE_SIZE = 20;
const DEFAULT_STATUSES = ['new', 'read', 'replied'];

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
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
};

const ContactList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [seenStatuses, setSeenStatuses] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { limit: PAGE_SIZE, offset: page * PAGE_SIZE };
        if (statusFilter) params.status = statusFilter;
        const res = await getAdminContacts(params);
        if (cancelled) return;
        const data = Array.isArray(res.data?.items) ? res.data.items : [];
        setMessages(data);
        setSeenStatuses((prev) => {
          const merged = new Set(prev);
          data.forEach((m) => m.status && merged.add(m.status));
          return [...merged];
        });
      } catch (err) {
        if (!cancelled) {
          console.error('Contacts fetch error:', err);
          setError('Impossible de charger les messages.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMessages();
    return () => { cancelled = true; };
  }, [statusFilter, page]);

  const statusOptions = useMemo(() => {
    const set = new Set([...DEFAULT_STATUSES, ...seenStatuses]);
    return [...set];
  }, [seenStatuses]);

  return (
    <div className="contact-list-page">
      <header className="adm-page-head">
        <div>
          <h1 className="adm-title">Messages de contact</h1>
          <p className="adm-sub">Demandes reçues via le formulaire de contact</p>
        </div>
      </header>

      <div className="adm-toolbar">
        <Filter size={16} color="#94a3b8" />
        <select
          className="adm-select"
          className="u-w-220"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
        >
          <option value="">Tous les statuts</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="adm-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="adm-loading">
          <Loader2 size={32} className="adm-spin" />
          <p>Chargement des messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="adm-empty">
          <Inbox size={56} strokeWidth={1} color="#cbd5e1" />
          <h3>Aucun message</h3>
          <p>{statusFilter ? 'Aucun message pour ce statut.' : 'Les demandes de contact apparaîtront ici.'}</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Expéditeur</th>
                <th>Sujet</th>
                <th>Date</th>
                <th>Statut</th>
                <th className="u-text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} className={(msg.status || '').toLowerCase() === 'new' ? 'row-unread' : ''}>
                  <td>
                    <div className="sender-cell">
                      <span className="sender-name">{msg.name || '—'}</span>
                      <span className="sender-email">{msg.email}</span>
                    </div>
                  </td>
                  <td>
                    <Link to={`/admin/contacts/${msg.id}`} className="subject-link">
                      {msg.subject || '(Sans sujet)'}
                    </Link>
                  </td>
                  <td>{formatDate(msg.createdAt || msg.date)}</td>
                  <td>
                    <span className={`adm-badge ${contactStatusBadge(msg.status)}`}>
                      {STATUS_LABELS[(msg.status || '').toLowerCase()] || msg.status || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/admin/contacts/${msg.id}`} className="adm-icon-btn" title="Voir le message">
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
        <span>Page {page + 1}</span>
        <button className="adm-icon-btn" disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)}>
          <ChevronLeft size={16} />
        </button>
        <button
          className="adm-icon-btn"
          disabled={messages.length < PAGE_SIZE || loading}
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
};

export default ContactList;
