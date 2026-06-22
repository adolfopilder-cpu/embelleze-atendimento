import { useState, useRef, useEffect } from "react";
import { KNOWLEDGE, findAnswer } from "./knowledge";

const AGENTS = Object.entries(KNOWLEDGE).map(([key, val]) => ({
  key,
  label: val.name.replace("Agente de ", ""),
  emoji: val.emoji,
  color: val.color,
  subtitle: val.subtitle,
}));

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "6px 0" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8, height: 8, borderRadius: "50%", background: "#9CA3AF",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ChatMessage({ msg, agentColor, agentEmoji }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 14, alignItems: "flex-end", gap: 8,
    }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%", background: agentColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, flexShrink: 0, boxShadow: `0 2px 8px ${agentColor}40`,
        }}>
          {agentEmoji}
        </div>
      )}
      <div style={{
        maxWidth: "75%", padding: "11px 15px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? agentColor : "#F3F4F6",
        color: isUser ? "#fff" : "#1F2937",
        fontSize: 14, lineHeight: 1.6,
        boxShadow: isUser ? `0 2px 8px ${agentColor}30` : "0 1px 3px rgba(0,0,0,0.07)",
      }}>
        {msg.content}
        {msg.isHuman && (
          <div style={{
            marginTop: 10, padding: "8px 12px",
            background: "rgba(255,255,255,0.2)", borderRadius: 10, fontSize: 13,
            borderLeft: "3px solid rgba(255,255,255,0.6)",
          }}>
            🙋 Um atendente humano será notificado em breve. Aguarde!
          </div>
        )}
      </div>
      {isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%", background: "#E5E7EB",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, flexShrink: 0,
        }}>👤</div>
      )}
    </div>
  );
}

export default function App() {
  const [activeAgent, setActiveAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [unanswered, setUnanswered] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (activeAgent && !escalated) inputRef.current?.focus();
  }, [activeAgent, escalated]);

  const selectAgent = (key) => {
    setActiveAgent(key);
    setEscalated(false);
    setUnanswered(0);
    setMessages([{ role: "agent", content: KNOWLEDGE[key].greeting }]);
    setInput("");
  };

  const sendMessage = async () => {
    if (!input.trim() || typing || escalated) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setTyping(true);
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
    const answer = findAnswer(activeAgent, userMsg);
    if (answer) {
      setUnanswered(0);
      setMessages((prev) => [...prev, { role: "agent", content: answer }]);
    } else {
      const newCount = unanswered + 1;
      setUnanswered(newCount);
      if (newCount >= 2) {
        setEscalated(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: `Não encontrei uma resposta específica para a sua dúvida. Vou transferir você para um atendente humano que poderá ajudar melhor! ⏳`,
            isHuman: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: `Não encontrei uma resposta exata para isso. Pode reformular sua pergunta com mais detalhes? Estou aqui para ajudar com ${KNOWLEDGE[activeAgent].name}! 😊`,
          },
        ]);
      }
    }
    setTyping(false);
  };

  const agentData = activeAgent ? KNOWLEDGE[activeAgent] : null;
  const agentMeta = AGENTS.find((a) => a.key === activeAgent);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#F1F5F9" }}>
      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #1E1B4B 0%, #4C1D95 100%)",
        color: "#fff", padding: "18px 24px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 24,
          }}>🦋</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px" }}>
              Central de Atendimento Embelleze
            </h1>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
              Orquestrador Inteligente de Vendas · 4 Agentes Especializados · 240+ Respostas
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
        {/* AGENT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
          {AGENTS.map((agent) => {
            const isActive = activeAgent === agent.key;
            return (
              <button
                key={agent.key}
                onClick={() => selectAgent(agent.key)}
                style={{
                  padding: "18px 20px", borderRadius: 16,
                  border: `2px solid ${isActive ? agent.color : "#E2E8F0"}`,
                  background: isActive ? agent.color : "#fff",
                  color: isActive ? "#fff" : "#374151",
                  cursor: "pointer", transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", gap: 14,
                  boxShadow: isActive
                    ? `0 6px 20px ${agent.color}50`
                    : "0 1px 4px rgba(0,0,0,0.06)",
                  fontFamily: "inherit", textAlign: "left",
                  transform: isActive ? "translateY(-2px)" : "none",
                }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: isActive ? "rgba(255,255,255,0.2)" : `${agent.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, flexShrink: 0,
                }}>
                  {agent.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                    {agent.label}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{agent.subtitle}</div>
                  <div style={{
                    fontSize: 11, marginTop: 4,
                    opacity: isActive ? 0.9 : 0.5, fontWeight: 600,
                  }}>
                    60+ respostas especializadas
                  </div>
                </div>
                {isActive && (
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "rgba(255,255,255,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700,
                  }}>✓</div>
                )}
              </button>
            );
          })}
        </div>

        {/* CHAT */}
        {activeAgent && agentData && agentMeta && (
          <div style={{
            background: "#fff", borderRadius: 20,
            boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
            overflow: "hidden", border: "1px solid #E2E8F0",
          }}>
            {/* Chat Header */}
            <div style={{
              background: agentMeta.color,
              padding: "14px 20px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>{agentMeta.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                  {agentData.name}
                </div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: escalated ? "#FCA5A5" : "#6EE7B7",
                    display: "inline-block",
                  }} />
                  {escalated ? "Transferido para atendente humano" : "Online — Pronto para ajudar"}
                </div>
              </div>
              <button
                onClick={() => setActiveAgent(null)}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none",
                  color: "#fff", borderRadius: 10, padding: "7px 14px",
                  cursor: "pointer", fontSize: 13, fontWeight: 600,
                  fontFamily: "inherit", transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.3)")}
                onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,0.2)")}
              >
                ← Voltar
              </button>
            </div>

            {/* Messages Area */}
            <div style={{
              height: 420, overflowY: "auto", padding: "20px 20px 10px",
              background: "#FAFAFA",
            }}>
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  msg={msg}
                  agentColor={agentMeta.color}
                  agentEmoji={agentMeta.emoji}
                />
              ))}
              {typing && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: agentMeta.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 17,
                  }}>
                    {agentMeta.emoji}
                  </div>
                  <div style={{
                    background: "#F3F4F6", borderRadius: "18px 18px 18px 4px",
                    padding: "10px 16px",
                  }}>
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && !escalated && (
              <div style={{ padding: "10px 20px 6px", borderTop: "1px solid #F1F5F9" }}>
                <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94A3B8", fontWeight: 700, letterSpacing: "0.05em" }}>
                  SUGESTÕES DE PERGUNTAS
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {(agentData.suggested || []).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      style={{
                        padding: "6px 13px", borderRadius: 20,
                        border: `1.5px solid ${agentMeta.color}35`,
                        background: `${agentMeta.color}08`,
                        color: agentMeta.color, cursor: "pointer",
                        fontSize: 12, fontWeight: 500,
                        fontFamily: "inherit", transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = `${agentMeta.color}15`;
                        e.target.style.borderColor = agentMeta.color;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = `${agentMeta.color}08`;
                        e.target.style.borderColor = `${agentMeta.color}35`;
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: "12px 20px 16px", borderTop: "1px solid #E2E8F0",
              background: "#fff",
            }}>
              {escalated ? (
                <div style={{
                  padding: "14px 18px", background: "#FEF3C7",
                  borderRadius: 14, fontSize: 13, color: "#92400E",
                  display: "flex", alignItems: "center", gap: 10,
                  border: "1px solid #FCD34D",
                }}>
                  <span style={{ fontSize: 20 }}>🙋</span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>Atendimento humano ativado</div>
                    <div style={{ opacity: 0.8 }}>Nossa equipe será notificada. Em breve um especialista entrará em contato.</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Digite sua dúvida aqui..."
                    style={{
                      flex: 1, padding: "12px 16px",
                      border: "1.5px solid #E2E8F0", borderRadius: 12,
                      fontSize: 14, outline: "none",
                      fontFamily: "inherit", transition: "border-color 0.2s",
                      background: "#FAFAFA",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = agentMeta.color)}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={typing || !input.trim()}
                    style={{
                      padding: "12px 22px",
                      background: agentMeta.color,
                      color: "#fff", border: "none", borderRadius: 12,
                      cursor: "pointer", fontSize: 14, fontWeight: 700,
                      opacity: typing || !input.trim() ? 0.45 : 1,
                      transition: "opacity 0.2s, transform 0.1s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => { if (!typing && input.trim()) e.target.style.transform = "scale(1.03)"; }}
                    onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
                  >
                    Enviar ↗
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LANDING */}
        {!activeAgent && (
          <div style={{
            background: "#fff", borderRadius: 20, padding: "48px 36px",
            textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            border: "1px solid #E2E8F0",
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🤖</div>
            <h2 style={{ margin: "0 0 10px", fontSize: 24, color: "#1E1B4B", fontWeight: 700 }}>
              Bem-vindo ao Atendimento Inteligente
            </h2>
            <p style={{ margin: "0 0 8px", color: "#64748B", fontSize: 15, maxWidth: 480, margin: "0 auto 24px" }}>
              Selecione um dos agentes acima para começar. Cada agente possui conhecimento
              especializado extraído dos manuais oficiais da Embelleze.
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", background: "#F0FDF4",
              borderRadius: 12, border: "1px solid #BBF7D0",
              fontSize: 13, color: "#166534",
            }}>
              ℹ️ Após 2 perguntas sem resposta, o sistema aciona automaticamente um atendente humano.
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: "center", marginTop: 24, color: "#94A3B8", fontSize: 12 }}>
          Embelleze © 2025 · Central de Atendimento Inteligente · Todos os dados baseados nos manuais oficiais
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
      `}</style>
    </div>
  );
}
