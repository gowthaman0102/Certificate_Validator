import { useState, useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import SuggestedQuestions from './SuggestedQuestions';
import TypingIndicator from './TypingIndicator';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../../api/chat';
import { GradRobotIcon } from './FloatingAIButton';
import { useAIProvider } from '../../hooks/useAIProvider';

const GS = { ink: '#0a0a0a', muted: '#666666', subtle: '#999999', border: '#0a0a0a', bg: '#ffffff', mid: '#8c8c8c' };

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef(null);
  const aiProvider = useAIProvider();
  const [showProviderTooltip, setShowProviderTooltip] = useState(false);

  // Detect current role / user from localStorage
  const token = localStorage.getItem('token');
  let user = null;
  let role = 'PUBLIC';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      user = payload;
      role = payload.role || 'STUDENT';
    } catch (e) {}
  }

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: `### Hello! I am your AI Assistant
I can help explain **Certificate Verification**, **RSA Signatures**, **SHA-256 Hashes**, **Blockchain Anchoring**, **Revocation Status**, and **AI Risk Scores**.

How can I help you today?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(textToSend) {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    const startTime = Date.now();

    try {
      const apiPromise = sendChatMessage({
        message: text,
        session_id: sessionId,
        context: {
          role,
          user,
          currentPage: window.location.pathname,
        },
      });

      // 2.2 second loading delay so user clearly sees the question sent & typing indicator
      const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 2200));

      const [res] = await Promise.all([apiPromise, minDelayPromise]);

      const aiData = res.data?.data;
      const aiMsg = {
        id: aiData?.id || `ai-${Date.now()}`,
        sender: 'assistant',
        text: aiData?.response || 'Sorry, I could not generate a response.',
        timestamp: aiData?.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const elapsed = Date.now() - startTime;
      if (elapsed < 2200) {
        await new Promise((resolve) => setTimeout(resolve, 2200 - elapsed));
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: '⚠️ Unable to connect to AI Assistant. Please check your network or try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleExportChat() {
    const textContent = messages
      .map((m) => `[${new Date(m.timestamp).toLocaleString()}] ${m.sender === 'user' ? 'USER' : 'AI'}:\n${m.text}\n`)
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chat_Export_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '390px',
        maxWidth: 'calc(100vw - 32px)',
        height: '560px',
        maxHeight: 'calc(100vh - 120px)',
        background: '#ffffff',
        border: `2px solid ${GS.ink}`,
        boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: GS.ink,
          color: '#ffffff',
          padding: '0.75rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${GS.ink}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <GradRobotIcon size={22} color="#ffffff" />
          <div>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: "'Prata', serif" }}>AI Assistant</span>
            {/* AI Provider badge — updates automatically from /api/ai/provider */}
            <div
              style={{ position: 'relative', display: 'inline-block', marginLeft: '8px' }}
              onMouseEnter={() => setShowProviderTooltip(true)}
              onMouseLeave={() => setShowProviderTooltip(false)}
            >
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.45)',
                color: '#ffffff',
                padding: '1px 6px',
                borderRadius: '3px',
                cursor: 'help',
              }}>
                {aiProvider.loading ? '...' : aiProvider.label}
              </span>
              {showProviderTooltip && !aiProvider.loading && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  background: '#1a1a1a',
                  color: '#f0f0f0',
                  fontSize: '0.72rem',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  width: '220px',
                  zIndex: 10,
                  lineHeight: 1.5,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                  pointerEvents: 'none',
                }}>
                  {aiProvider.description}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={handleExportChat}
            title="Export Conversation"
            style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            📥
          </button>
          <button
            onClick={onClose}
            title="Close Assistant"
            style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, padding: '0.85rem', overflowY: 'auto', background: '#ffffff' }}>
        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <SuggestedQuestions onSelectQuestion={(q) => handleSend(q)} />

      {/* Input Form */}
      <div style={{ padding: '0.65rem 0.75rem', background: '#ffffff', borderTop: `1px solid ${GS.border}`, display: 'flex', gap: '0.5rem' }}>
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI a question..."
          style={{
            flex: 1,
            background: '#ffffff',
            border: `1px solid ${GS.border}`,
            borderRadius: '0',
            padding: '0.55rem 0.75rem',
            fontSize: '0.85rem',
            color: GS.ink,
            outline: 'none',
          }}
        />
        <button
          className="btn"
          onClick={() => handleSend()}
          disabled={loading || !inputText.trim()}
          style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
