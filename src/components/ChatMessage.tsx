// src/components/ChatMessage.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  sender: "user" | "bot";
  text: string; // can be plain text or HTML (server sends HTML for product cards)
};

export default function ChatMessage() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  async function sendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: Message = { sender: "user", text: escapeHtml(userText) };
    setMessages((prev: Message[]) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      // backend returns reply which may be HTML (for product cards) or plain text
      const botText = typeof data.reply === "string" ? data.reply : String(data.reply || "");
      const botMsg: Message = { sender: "bot", text: botText };
      setMessages((prev: Message[]) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat send error:", err);
      setMessages((prev: Message[]) => [
        ...prev,
        { sender: "bot", text: "⚠️ I’m having trouble connecting right now." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Open chat"
        className="sj10-floating-btn"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 999999,
          width: 66,
          height: 66,
          borderRadius: 999,
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 25px rgba(59,130,246,0.25)",
          cursor: "pointer",
          background:
            "linear-gradient(135deg, #6366f1 0%, #7c3aed 40%, #2563eb 100%)",
          color: "#fff",
          transform: isOpen ? "rotate(45deg)" : "none",
          transition: "transform 220ms ease, box-shadow 220ms ease",
        }}
      >
        <i className={`fas ${isOpen ? "fa-times" : "fa-robot"}`} style={{ fontSize: 20 }} />
      </button>

      {/* chat window */}
      <div
        className={`sj10-chat-window ${isOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          right: 20,
          bottom: 96,
          width: 380,
          maxHeight: 560,
          zIndex: 999998,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 18px 60px rgba(2,6,23,0.18)",
          background: "#fff",
          display: isOpen ? "flex" : "none",
          flexDirection: "column",
          transition: "transform 260ms ease, opacity 260ms ease",
        }}
      >
        {/* header */}
        <div style={{ padding: 12, background: "linear-gradient(90deg,#6366f1,#7c3aed)", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>🛍️ SJ10 Shopping Assistant</div>
              <div style={{ fontSize: 12, opacity: 0.95 }}>Ask me about products or offers</div>
            </div>
          </div>
        </div>

        {/* messages */}
        <div style={{ padding: 12, overflowY: "auto", background: "#f8fafc", flex: 1 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#6b7280", paddingTop: 18 }}>
              👋 Hello! I’m the SJ10 Shopping Assistant. Ask me to find products or just chat.
            </div>
          )}

          {messages.map((m, idx) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    maxWidth: "78%",
                    background: isUser ? "#e0e7ff" : "#ffffff",
                    color: "#0f172a",
                    padding: "10px 12px",
                    borderRadius: 12,
                    boxShadow: isUser ? "0 6px 18px rgba(59,130,246,0.08)" : "0 6px 18px rgba(2,6,23,0.04)",
                    border: isUser ? "none" : "1px solid rgba(15,23,42,0.04)",
                    lineHeight: 1.35,
                  }}
                >
                  {/* we render HTML safely because server replies are sanitized on server for titles */}
                  <div dangerouslySetInnerHTML={{ __html: m.text }} />
                </div>
              </div>
            );
          })}

          {/* typing / loading */}
          {loading && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 6 }}>
              <div style={{ width: 8, height: 8, background: "#94a3b8", borderRadius: 8, opacity: 0.9, animation: "sj10-dot 1s infinite" }} />
              <div style={{ width: 8, height: 8, background: "#94a3b8", borderRadius: 8, opacity: 0.6, animation: "sj10-dot 1s infinite .2s" }} />
              <div style={{ width: 8, height: 8, background: "#94a3b8", borderRadius: 8, opacity: 0.4, animation: "sj10-dot 1s infinite .4s" }} />
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* input */}
        <form onSubmit={(e) => sendMessage(e)} style={{ padding: 12, borderTop: "1px solid rgba(15,23,42,0.04)", background: "#fff", display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search products or ask a question..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e6edf3",
              outline: "none",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(90deg,#6366f1,#7c3aed)",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            <i className="fas fa-paper-plane" />
          </button>
        </form>
      </div>

      {/* minimal keyframes used by inline styles */}
      <style>{`
        @keyframes sj10-dot {
          0% { transform: translateY(0); opacity: 0.9; }
          50% { transform: translateY(-6px); opacity: 0.4; }
          100% { transform: translateY(0); opacity: 0.9; }
        }
        .sj10-card:hover { transform: translateY(-6px); box-shadow: 0 14px 30px rgba(2,6,23,0.12); }
      `}</style>
    </>
  );
}

// tiny client-side escape to avoid raw HTML injection for user message text
function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
