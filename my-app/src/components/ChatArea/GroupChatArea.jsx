import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // connect to backend

const GroupChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [username, setUsername] = useState(""); // NEW
  const messagesEndRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on("your-username", (name) => {
      setUsername(name);
    });
    socket.on("chat-history", (history) => setMessages(history));
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      console.log(
        msg.text?.startsWith("@ai")
          ? `[AI MESSAGE] ${msg.user}: ${msg.text}`
          : `[USER MESSAGE] ${msg.user}: ${msg.text}`
      );
    });

    return () => {
      
      socket.off("your-username");
      socket.off("chat-history");
      socket.off("chat-message");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput) return;
    socket.emit("chat-message", trimmedInput);
    setUserInput("");
  };

  // Reuse ChatApp styles
  const styles = `
    .chat-container { display:flex; flex-direction:column; height:90vh; max-width:800px; width:100%; margin:auto;
      background:#fff; box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05); border-radius:0.75rem; overflow:hidden; font-family:'Inter',sans-serif; }
    .chat-header { padding:1.5rem; border-bottom:1px solid #e5e7eb; text-align:center; background:#f9fafb; }
    .chat-header h1 { font-size:1.5rem; font-weight:700; color:#1f2937; margin:0; }
    .chat-header p { font-size:0.875rem; color:#6b7280; margin:0.25rem 0 0; }
    .chat-header span { display:inline-block; background:#e5e7eb; color:#4b5563; padding:0.25rem 0.75rem; border-radius:9999px; font-size:0.75rem; font-weight:600; margin-top:0.75rem; }
    .chat-messages { flex-grow:1; padding:1.5rem; overflow-y:auto; }
    .message-wrapper { display:flex; margin-bottom:1rem; }
    .message-wrapper.user { justify-content:flex-end; }
    .message-wrapper.bot { justify-content:flex-start; }
    .message-wrapper.other { justify-content:flex-start; }
    .message { border-radius:1.25rem; padding:0.75rem 1.25rem; max-width:80%; line-height:1.5; }
    .message.user { background:#3b82f6; color:#fff; border-bottom-right-radius:0.25rem; }
    .message.bot { background:#f3f4f6; color:#1f2937; border-bottom-left-radius:0.25rem; font-style:italic; }
    .message.other { background:#e2e8f0; color:#111827; border-bottom-left-radius:0.25rem; }
    .message-input-area { padding:1rem 1.5rem; border-top:1px solid #e5e7eb; background:#f9fafb; }
    .message-input-area form { display:flex; align-items:center; gap:1rem; }
    .message-input-area input { flex-grow:1; padding:0.75rem 1.25rem; border:1px solid #d1d5db; border-radius:9999px; font-size:1rem; }
    .message-input-area button { background:#3b82f6; color:white; border-radius:50%; padding:0.75rem; border:none; cursor:pointer; }
    .message-input-area button:disabled { background:#9ca3af; cursor:not-allowed; }
    .custom-scrollbar::-webkit-scrollbar { width:6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background:#f1f5f9; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background:#94a3b8; border-radius:3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:#64748b; }
  `;

  return (
    <React.Fragment>
      <style>{styles}</style>
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <h1># Group Chat</h1>
          <p>Collaborate with friends & AI</p>
          <span>Slack/Discord Style</span>
        </div>

        {/* Messages */}
        <div className="chat-messages custom-scrollbar">
          {messages.map((msg) => {
            const isSelf = msg.user === socket.id;
            const isAi = msg.text?.startsWith("@ai");

            let role = "other";
            if (isSelf) role = "user";
            if (isAi) role = "bot";

            return (
              <div key={msg.id} className={`message-wrapper ${role}`}>
                <div className={`message ${role}`}>
                  <strong>{isSelf ? "You" : isAi ? "AI" : msg.user}:</strong>{" "}
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="message-input-area">
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type a message... (@ai to ask bot)"
            />
            <button type="submit" disabled={!userInput.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </React.Fragment>
  );
};

export default GroupChatArea;
