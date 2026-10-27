import { useState } from "react";

import {
  Bot,
  Send,
  User,
  Sparkles,
} from "lucide-react";

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm LifeSphere AI Assistant. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (event) => {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: "Please login again.",
        },
      ]);

      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "user",
        content: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "AI request failed."
        );
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            data.response ||
            "I could not generate a response.",
        },
      ]);
    } catch (error) {
      console.error("AI error:", error);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            "Sorry, I could not connect to the AI service.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <header className="dashboard-header">
        <div>
          <h1>AI Assistant</h1>

          <p>
            Your intelligent LifeSphere assistant
          </p>
        </div>

        <div className="header-right">
          <div className="ai-title-icon">
            <Sparkles size={24} />
          </div>
        </div>
      </header>

      <div className="ai-chat-card">

        <div className="ai-chat-messages">

          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === "user"
                  ? "ai-message user-message"
                  : "ai-message assistant-message"
              }
            >
              <div className="ai-message-icon">
                {message.role === "user" ? (
                  <User size={18} />
                ) : (
                  <Bot size={18} />
                )}
              </div>

              <div className="ai-message-content">
                <div className="ai-message-name">
                  {message.role === "user"
                    ? "You"
                    : "LifeSphere AI"}
                </div>

                <p>{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="ai-message assistant-message">
              <div className="ai-message-icon">
                <Bot size={18} />
              </div>

              <div className="ai-message-content">
                <div className="ai-message-name">
                  LifeSphere AI
                </div>

                <p>Thinking...</p>
              </div>
            </div>
          )}

        </div>

        <form
          className="ai-input-area"
          onSubmit={handleSend}
        >
          <input
            type="text"
            placeholder="Ask LifeSphere AI something..."
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading || !input.trim()
            }
            title="Send message"
          >
            <Send size={19} />
          </button>
        </form>

      </div>
    </div>
  );
}

export default AIAssistant;