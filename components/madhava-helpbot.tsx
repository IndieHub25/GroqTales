'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ── Types ───────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Constants ───────────────────────────────────────────────────────
const API_URL =
  (typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL
    : undefined) ?? '';
const HELPBOT_ENDPOINT = `${API_URL}/api/helpbot/chat`;

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey there! 👋 I'm **MADHAVA**, your GroqTales help bot. Ask me anything about creating stories, minting NFTs, wallet setup, troubleshooting, or the platform in general!",
  timestamp: new Date(),
};

// ── Component ───────────────────────────────────────────────────────
export default function MadhavaHelpBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history from existing messages (skip welcome)
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(HELPBOT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content:
          data.reply ??
          data.error ??
          'Sorry, I could not process that. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            'Oops — I couldn\'t reach the server. Please check your connection and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Action Button ─────────────────────────────── */}
      <button
        id="madhava-helpbot-fab"
        onClick={() => setIsOpen((o) => !o)}
        className="madhava-fab"
        aria-label={isOpen ? 'Close MADHAVA Help Bot' : 'Open MADHAVA Help Bot'}
        title="MADHAVA Help Bot"
      >
        {isOpen ? (
          /* X icon */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          /* Chat icon */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* ── Chat Panel ─────────────────────────────────────────── */}
      <div
        id="madhava-helpbot-panel"
        className={`madhava-panel ${isOpen ? 'madhava-panel--open' : ''}`}
        role="dialog"
        aria-label="MADHAVA Help Bot chat"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="madhava-header">
          <div className="madhava-header__info">
            <div className="madhava-avatar">M</div>
            <div>
              <h3 className="madhava-header__title">MADHAVA Help Bot</h3>
              <span className="madhava-header__status">
                <span className="madhava-status-dot" />
                Online
              </span>
            </div>
          </div>
          <div className="madhava-header__actions">
            <button
              onClick={clearChat}
              className="madhava-header__btn"
              title="Clear chat"
              aria-label="Clear chat history"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="madhava-header__btn"
              title="Close"
              aria-label="Close help bot"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="madhava-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`madhava-bubble ${msg.role === 'user' ? 'madhava-bubble--user' : 'madhava-bubble--bot'}`}
            >
              <div className="madhava-bubble__content">
                {msg.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {renderMarkdown(line)}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              <time className="madhava-bubble__time">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="madhava-bubble madhava-bubble--bot">
              <div className="madhava-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="madhava-input-area">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about GroqTales…"
            className="madhava-input"
            disabled={isLoading}
            maxLength={2000}
            aria-label="Type your message"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="madhava-send"
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// ── Simple inline markdown renderer (bold only) ─────────────────────
function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
