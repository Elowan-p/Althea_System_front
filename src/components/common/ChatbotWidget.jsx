import { useState, useRef, useCallback } from 'react';
import { MessageCircle, X, ChevronLeft, Loader, Headphones, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const createConversation = (data = {}) => api.post('/chatbot/conversations', data);
const sendChatMessage = (data) => api.post('/chatbot/messages', data);
const getChatQuestions = () => api.get('/chatbot/questions');
const escalateChatbot = (data) => api.post('/chatbot/escalate', data);

const STEPS = {
  IDLE: 'idle',
  LOADING: 'loading',
  QUESTIONS: 'questions',
  WAITING: 'waiting',
  ESCALATE: 'escalate',
  ESCALATED: 'escalated',
};

const extractBotAnswer = (responseData) => {
  const msgs = responseData?.messages;
  if (Array.isArray(msgs)) {
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].sender === 'bot') return msgs[i].content;
    }
  }
  return responseData?.answer ?? responseData?.message ?? responseData?.response ?? null;
};

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(STEPS.IDLE);
  const [questions, setQuestions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [escalateEmail, setEscalateEmail] = useState('');
  const [escalateMsg, setEscalateMsg] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, []);

  const startSession = useCallback(async () => {
    setStep(STEPS.LOADING);
    setError('');
    try {
      const [convRes, questRes] = await Promise.all([
        createConversation({}),
        getChatQuestions(),
      ]);

      const conv = convRes.data;
      setConversationId(conv.id ?? conv.conversationId ?? conv.data?.id);

      const qs = questRes.data?.items ?? questRes.data;
      setQuestions(Array.isArray(qs) ? qs : []);

      const initMessages = conv.messages;
      if (Array.isArray(initMessages) && initMessages.length > 0) {
        setMessages(initMessages.map((m, i) => ({
          role: m.sender === 'bot' ? 'bot' : 'user',
          text: m.content,
          id: m.id ?? i,
        })));
      } else {
        setMessages([{
          role: 'bot',
          text: 'Bonjour 👋 Comment puis-je vous aider aujourd\'hui ?',
          id: Date.now(),
        }]);
      }

      setStep(STEPS.QUESTIONS);
      scrollToBottom();
    } catch {
      setError('Impossible de démarrer la conversation. Veuillez réessayer.');
      setStep(STEPS.IDLE);
    }
  }, [scrollToBottom]);

  const handleOpen = () => {
    setOpen(true);
    if (step === STEPS.IDLE) startSession();
  };

  const handleClose = () => setOpen(false);

  const handleReset = () => {
    setStep(STEPS.IDLE);
    setMessages([]);
    setConversationId(null);
    setError('');
    setEscalateEmail('');
    setEscalateMsg('');
  };

  const handleQuestionClick = async (q) => {
    const userText = q.question ?? q.label ?? q.text ?? q.key;
    setMessages((prev) => [...prev, { role: 'user', text: userText, id: Date.now() }]);
    setStep(STEPS.WAITING);
    scrollToBottom();
    try {
      const res = await sendChatMessage({ conversationId, questionKey: q.key ?? q.questionKey });
      const botText = extractBotAnswer(res.data) ?? 'Merci pour votre question.';
      setMessages((prev) => [...prev, { role: 'bot', text: botText, id: Date.now() + 1 }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'bot',
        text: 'Une erreur est survenue. Veuillez réessayer.',
        id: Date.now() + 1,
      }]);
    } finally {
      setStep(STEPS.QUESTIONS);
      scrollToBottom();
    }
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    if (isEscalating) return;
    setIsEscalating(true);
    setError('');
    try {
      await escalateChatbot({
        conversationId,
        email: escalateEmail,
        subject: 'Transfert vers le support humain',
        message: escalateMsg || 'Je souhaite parler à un agent humain.',
      });
      setStep(STEPS.ESCALATED);
    } catch {
      setError('Erreur lors du transfert. Veuillez réessayer.');
    } finally {
      setIsEscalating(false);
    }
  };

  const isChat = step === STEPS.QUESTIONS || step === STEPS.WAITING;

  return (
    <>
      <button
        id="chatbot-toggle-btn"
        className={`cb-fab ${open ? 'cb-fab--open' : ''}`}
        onClick={open ? handleClose : handleOpen}
        aria-label="Ouvrir le chatbot"
      >
        <span className="cb-fab-icon">
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </span>
        {!open && <span className="cb-fab-label">Assistance</span>}
      </button>

      {open && (
        <div className="cb-panel" id="chatbot-panel">

          {/* Header */}
          <div className="cb-header">
            <div className="cb-header-left">
              <div className="cb-avatar">A</div>
              <div>
                <div className="cb-title">Althea Assistant</div>
                <div className="cb-status"><span className="cb-dot" />En ligne</div>
              </div>
            </div>
            <div className="cb-header-right">
              {isChat && (
                <button className="cb-icon-btn" onClick={() => setStep(STEPS.ESCALATE)} title="Parler à un agent">
                  <Headphones size={16} />
                </button>
              )}
              <button className="cb-icon-btn" onClick={handleClose} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body — single scrollable column */}
          <div className="cb-body">

            {step === STEPS.LOADING && (
              <div className="cb-center">
                <Loader size={28} className="cb-spin" />
                <p>Connexion en cours…</p>
              </div>
            )}

            {error && step === STEPS.IDLE && (
              <div className="cb-center">
                <AlertCircle size={32} color="#ef4444" />
                <p>{error}</p>
                <button className="cb-btn-retry" onClick={startSession}>Réessayer</button>
              </div>
            )}

            {isChat && (
              <>
                {/* Messages */}
                {messages.map((msg) => (
                  <div key={msg.id} className={`cb-bubble cb-bubble--${msg.role}`}>
                    {msg.text}
                  </div>
                ))}

                {step === STEPS.WAITING && (
                  <div className="cb-bubble cb-bubble--bot cb-typing">
                    <span /><span /><span />
                  </div>
                )}

                <div ref={messagesEndRef} />

                {/* Question chips — always rendered below messages in the scroll flow */}
                <div className="cb-chips-wrap">
                  <p className="cb-chips-label">Choisissez une question</p>
                  {questions.map((q, i) => (
                    <button
                      key={q.key ?? i}
                      className="cb-chip"
                      onClick={() => handleQuestionClick(q)}
                      disabled={step === STEPS.WAITING}
                    >
                      {q.question ?? q.label ?? q.text ?? q.key}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === STEPS.ESCALATE && (
              <div className="cb-form-wrap">
                <button className="cb-back-btn" onClick={() => setStep(STEPS.QUESTIONS)}>
                  <ChevronLeft size={16} /> Retour
                </button>
                <div className="cb-form-header">
                  <Headphones size={28} />
                  <h3>Parler à un agent</h3>
                  <p>Notre équipe vous répondra par email dans les meilleurs délais.</p>
                </div>
                {error && <div className="cb-field-error">{error}</div>}
                <form onSubmit={handleEscalate} id="chatbot-escalate-form">
                  <label htmlFor="cb-email">Votre email</label>
                  <input
                    id="cb-email"
                    type="email"
                    required
                    placeholder="email@exemple.com"
                    value={escalateEmail}
                    onChange={(e) => setEscalateEmail(e.target.value)}
                  />
                  <label htmlFor="cb-msg">Décrivez votre besoin</label>
                  <textarea
                    id="cb-msg"
                    rows={3}
                    placeholder="Je souhaite parler à un agent humain…"
                    value={escalateMsg}
                    onChange={(e) => setEscalateMsg(e.target.value)}
                  />
                  <button id="chatbot-escalate-submit" type="submit" className="cb-submit-btn" disabled={isEscalating}>
                    {isEscalating ? <Loader size={16} className="cb-spin" /> : 'Transférer au support'}
                  </button>
                </form>
              </div>
            )}

            {step === STEPS.ESCALATED && (
              <div className="cb-center">
                <div className="cb-success-icon">✓</div>
                <h3 style={{ fontWeight: 800, color: '#1e293b' }}>Demande envoyée !</h3>
                <p>Un agent va vous contacter à l'adresse indiquée.</p>
                <button className="cb-btn-retry" onClick={handleReset}>Nouvelle conversation</button>
              </div>
            )}

          </div>
        </div>
      )}

      <style>{`
        /* ── FAB button ── */
        .cb-fab {
          position: fixed; bottom: 2rem; right: 2rem; z-index: 9000;
          display: flex; align-items: center; gap: 0.6rem;
          background: linear-gradient(135deg, var(--primary,#005c97), var(--primary-light,#36d1dc));
          color: #fff; border: none; border-radius: 50px;
          padding: 0.85rem 1.4rem 0.85rem 1.1rem;
          font-family: var(--font-main,inherit); font-weight: 700; font-size: 0.9rem;
          cursor: pointer; white-space: nowrap;
          box-shadow: 0 8px 30px rgba(0,92,151,0.35);
          transition: all 0.35s cubic-bezier(0.165,0.84,0.44,1);
        }
        .cb-fab:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 14px 40px rgba(0,92,151,0.45); }
        .cb-fab--open {
          padding: 0.85rem; border-radius: 50%;
          background: linear-gradient(135deg,#334155,#475569);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .cb-fab--open:hover { transform: rotate(5deg) scale(1.05); }
        .cb-fab-icon { display: flex; align-items: center; }

        /* ── Panel ── */
        .cb-panel {
          position: fixed; bottom: 5.5rem; right: 2rem; z-index: 8999;
          width: 380px; height: 560px;
          background: #fff; border-radius: 24px;
          box-shadow: 0 30px 80px -10px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.08);
          display: flex; flex-direction: column; overflow: hidden;
          animation: cbIn 0.35s cubic-bezier(0.165,0.84,0.44,1);
        }
        @keyframes cbIn {
          from { opacity:0; transform: translateY(24px) scale(0.95); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        /* ── Header ── */
        .cb-header {
          background: linear-gradient(135deg, var(--primary,#005c97), var(--primary-light,#36d1dc));
          padding: 1rem 1.2rem; display: flex; align-items: center;
          justify-content: space-between; flex-shrink: 0;
        }
        .cb-header-left { display: flex; align-items: center; gap: 0.9rem; }
        .cb-avatar {
          width: 40px; height: 40px; background: rgba(255,255,255,0.25);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 1.3rem; color: #fff;
        }
        .cb-title { font-weight: 800; font-size: 0.95rem; color: #fff; }
        .cb-status { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; color: rgba(255,255,255,0.85); font-weight: 600; }
        .cb-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.25); }
        .cb-header-right { display: flex; align-items: center; gap: 0.5rem; }
        .cb-icon-btn {
          background: rgba(255,255,255,0.15); border: none; cursor: pointer; color: #fff;
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; transition: background 0.2s;
        }
        .cb-icon-btn:hover { background: rgba(255,255,255,0.28); }

        /* ── Body — single scrollable column ── */
        .cb-body {
          flex: 1; overflow-y: auto; padding: 1.2rem;
          display: flex; flex-direction: column; gap: 0.65rem;
        }

        /* ── Centered states ── */
        .cb-center {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0.8rem; text-align: center; color: var(--text-muted,#64748b);
        }
        .cb-center h3 { font-weight: 800; color: #1e293b; }

        /* ── Spinner ── */
        @keyframes cbSpin { to { transform: rotate(360deg); } }
        .cb-spin { animation: cbSpin 0.9s linear infinite; }

        /* ── Bubbles ── */
        .cb-bubble {
          max-width: 82%; padding: 0.75rem 1rem; border-radius: 16px;
          font-size: 0.88rem; line-height: 1.55; word-break: break-word; font-weight: 500;
          animation: cbBubble 0.25s ease;
        }
        @keyframes cbBubble {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cb-bubble--bot {
          background: #f1f5f9; color: var(--text-main,#1e293b);
          border-bottom-left-radius: 4px; align-self: flex-start;
        }
        .cb-bubble--user {
          background: linear-gradient(135deg, var(--primary,#005c97), var(--primary-light,#36d1dc));
          color: #fff; border-bottom-right-radius: 4px; align-self: flex-end;
        }

        /* ── Typing dots ── */
        .cb-typing { display: flex; align-items: center; gap: 5px; }
        .cb-typing span {
          width: 7px; height: 7px; background: #94a3b8; border-radius: 50%;
          animation: cbDot 1.2s infinite;
        }
        .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cbDot {
          0%,60%,100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        /* ── Question chips ── */
        .cb-chips-wrap {
          margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem;
          border-top: 1px solid #f1f5f9; padding-top: 0.8rem;
        }
        .cb-chips-label {
          font-size: 0.68rem; font-weight: 800; text-transform: uppercase;
          color: #94a3b8; letter-spacing: 0.08em; margin-bottom: 0.15rem;
        }
        .cb-chip {
          background: #f8fafc; border: 1px solid #e2e8f0;
          color: var(--primary,#005c97); font-family: inherit; font-weight: 700; font-size: 0.82rem;
          padding: 0.6rem 0.9rem; border-radius: 10px;
          text-align: left; cursor: pointer; transition: all 0.2s ease;
        }
        .cb-chip:hover:not(:disabled) {
          background: var(--primary,#005c97); color: #fff; border-color: var(--primary,#005c97);
          transform: translateX(3px);
        }
        .cb-chip:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Escalate form ── */
        .cb-form-wrap { display: flex; flex-direction: column; gap: 0.8rem; }
        .cb-back-btn {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.82rem; font-weight: 700; color: var(--text-muted,#64748b);
          background: none; border: none; cursor: pointer; font-family: inherit;
          transition: color 0.2s; align-self: flex-start; padding: 0;
        }
        .cb-back-btn:hover { color: var(--primary,#005c97); }
        .cb-form-header {
          display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
          text-align: center; color: var(--primary,#005c97);
        }
        .cb-form-header h3 { font-size: 1.05rem; font-weight: 800; color: #1e293b; }
        .cb-form-header p { font-size: 0.82rem; color: var(--text-muted,#64748b); font-weight: 500; }
        .cb-form-wrap form { display: flex; flex-direction: column; gap: 0.5rem; }
        .cb-form-wrap label { font-size: 0.78rem; font-weight: 700; color: var(--text-muted,#64748b); }
        .cb-form-wrap input, .cb-form-wrap textarea {
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 0.6rem 0.9rem; font-size: 0.85rem; font-family: inherit;
          outline: none; background: #f8fafc; transition: border-color 0.2s; resize: none;
        }
        .cb-form-wrap input:focus, .cb-form-wrap textarea:focus {
          border-color: var(--primary,#005c97); background: #fff;
        }
        .cb-submit-btn {
          background: linear-gradient(135deg, var(--primary,#005c97), var(--primary-light,#36d1dc));
          color: #fff; border: none; border-radius: 10px; padding: 0.75rem;
          font-weight: 700; font-size: 0.88rem; font-family: inherit; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          transition: all 0.2s; margin-top: 0.3rem;
        }
        .cb-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,92,151,0.3); }
        .cb-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .cb-field-error {
          background: #fef2f2; color: #ef4444; border: 1px solid #fecaca;
          border-radius: 8px; padding: 0.5rem 0.8rem; font-size: 0.8rem; font-weight: 600;
        }

        /* ── Success ── */
        .cb-success-icon {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, var(--primary,#005c97), var(--primary-light,#36d1dc));
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; color: #fff; font-weight: 900;
        }
        .cb-btn-retry {
          background: var(--primary,#005c97); color: #fff; border: none; border-radius: 8px;
          padding: 0.6rem 1.2rem; font-weight: 700; font-size: 0.85rem; font-family: inherit;
          cursor: pointer; transition: all 0.2s;
        }
        .cb-btn-retry:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,92,151,0.3); }

        @media (max-width: 480px) {
          .cb-panel { width: calc(100vw - 2rem); right: 1rem; bottom: 5rem; border-radius: 18px; }
          .cb-fab { right: 1rem; bottom: 1rem; }
        }
      `}</style>
    </>
  );
}

export default ChatbotWidget;
