import { useEffect, useId, useRef, useState } from "react";
import {
  CHATBOT_QUICK_REPLIES,
  CHATBOT_WELCOME,
  answerChatQuestion,
  answerQuickReply,
  type ChatMessage,
} from "../data/chatbot";
import { useJourney } from "../context/JourneyContext";

export function FloatingChatbot() {
  const { openHelp } = useJourney();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([CHATBOT_WELCOME]);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const typingTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
    inputRef.current?.focus();
  }, [open, messages, typing]);

  useEffect(() => {
    return () => {
      if (typingTimer.current != null) window.clearTimeout(typingTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const pushBotReply = (bot: ChatMessage) => {
    setTyping(true);
    if (typingTimer.current != null) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      setMessages((prev) => [...prev, bot]);
      setTyping(false);
      typingTimer.current = null;
    }, 420);
  };

  const sendText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    pushBotReply(answerChatQuestion(trimmed));
  };

  const sendQuickReply = (replyId: string) => {
    if (typing) return;
    const { userText, bot } = answerQuickReply(replyId);
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: userText },
    ]);
    pushBotReply(bot);
  };

  return (
    <div className={`chatbot${open ? " is-open" : ""}`}>
      {open && (
        <section
          className="chatbot__panel"
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-label="Assistente de dúvidas rápidas"
        >
          <header className="chatbot__header">
            <div>
              <p className="status-banner__label">Assistente</p>
              <h2>Dúvidas rápidas</h2>
              <p className="muted">Respostas objetivas sobre o uso do crédito</p>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--compact"
              onClick={() => setOpen(false)}
            >
              Fechar
            </button>
          </header>

          <div className="chatbot__messages" ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot__bubble chatbot__bubble--${message.role}`}
              >
                <p>{message.text}</p>
                {message.role === "bot" && message.helpLink && (
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      openHelp(message.helpLink);
                      setOpen(false);
                    }}
                  >
                    Ver na Central de ajuda →
                  </button>
                )}
              </div>
            ))}
            {typing && (
              <div className="chatbot__bubble chatbot__bubble--bot chatbot__bubble--typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          <div className="chatbot__suggestions" aria-label="Sugestões">
            {CHATBOT_QUICK_REPLIES.map((reply) => (
              <button
                key={reply.id}
                type="button"
                className="chatbot__chip"
                disabled={typing}
                onClick={() => sendQuickReply(reply.id)}
              >
                {reply.label}
              </button>
            ))}
          </div>

          <form
            className="chatbot__composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendText(input);
            }}
          >
            <label className="sr-only" htmlFor="chatbot-input">
              Digite sua dúvida
            </label>
            <input
              id="chatbot-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Digite sua dúvida..."
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn--primary btn--compact"
              disabled={!input.trim() || typing}
            >
              Enviar
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chatbot__fab"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="chatbot__fab-icon" aria-hidden="true">
          {open ? (
            "×"
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-3.8 2.85c-.55.42-1.35.02-1.35-.67V16A2.5 2.5 0 0 1 5 13.5v-7Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M9 9h6M9 12h4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
        <span className="chatbot__fab-label">
          {open ? "Fechar chat" : "Dúvidas rápidas"}
        </span>
      </button>
    </div>
  );
}
