import { useState, useRef, useCallback } from 'react';
import { MessageCircle, X, ChevronLeft, Loader, Headphones, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import './ChatbotWidget.css';

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
                <h3 className="cw-sent-title">Demande envoyée !</h3>
                <p>Un agent va vous contacter à l'adresse indiquée.</p>
                <button className="cb-btn-retry" onClick={handleReset}>Nouvelle conversation</button>
              </div>
            )}

          </div>
        </div>
      )}

    </>
  );
}

export default ChatbotWidget;
