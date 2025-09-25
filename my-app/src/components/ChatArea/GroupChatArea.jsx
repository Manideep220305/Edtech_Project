import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Initialize socket connection outside the component
const socket = io("http://localhost:3000");

const GroupChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [username, setUsername] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("your-username", (name) => setUsername(name));
    socket.on("chat-history", (history) => setMessages(history));
    socket.on("chat-message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
    socket.on("online-users", (users) => setOnlineUsers(users));

    return () => {
      socket.off("your-username");
      socket.off("chat-history");
      socket.off("chat-message");
      socket.off("online-users");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (trimmedInput) {
      socket.emit("chat-message", trimmedInput);
      setUserInput("");
    }
  };

  const styles = `
    .chat-container { display:flex; flex-direction:column; height:90vh; max-width:800px; width:100%; margin:auto;
      background:#fff; box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -2px rgba(0,0,0,.05); border-radius:0.75rem; overflow:hidden; font-family:'Inter',sans-serif; }
    .chat-header { padding:1.5rem; border-bottom:1px solid #e5e7eb; text-align:center; background:#f9fafb; }
    .chat-header h1 { font-size:1.5rem; font-weight:700; color:#1f2937; margin:0; }
    .chat-header p { font-size:0.875rem; color:#6b7280; margin:0.25rem 0 0; }
    .online-users { font-size:0.8rem; color:#4b5563; margin-top:0.5rem; }
    .message-wrapper { display:flex; margin-bottom:1rem; flex-direction: column; }
    .message-wrapper.user { align-items:flex-end; } /* This moves your messages to the right */
    .message-wrapper.bot, .message-wrapper.other, .message-wrapper.system { align-items:flex-start; }
    .message { border-radius:1.25rem; padding:0.75rem 1.25rem; max-width:80%; line-height:1.5; word-wrap: break-word; }
    .message.user { background:#3b82f6; color:#fff; border-bottom-right-radius:0.25rem; } /* This makes your messages blue */
    .message.bot { background:#d1fae5; color:#065f46; border-bottom-left-radius:0.25rem; }
    .message.other { background:#e2e8f0; color:#111827; border-bottom-left-radius:0.25rem; }
    .message.system { text-align: center; color: #6b7280; font-style: italic; font-size: 0.875rem; background: transparent; width: 100%; padding: 0.5rem 0; }
    .message-sender { font-size: 0.8rem; font-weight: 600; color: #4b5563; margin: 0 0.75rem 0.25rem; }
    .message-input-area { padding:1rem 1.5rem; border-top:1px solid #e5e7eb; background:#f9fafb; }
    .message-input-area form { display:flex; align-items:center; gap:1rem; }
    .message-input-area input { flex-grow:1; padding:0.75rem 1.25rem; border:1px solid #d1d5db; border-radius:9999px; font-size:1rem; }
    .message-input-area button { background:#3b82f6; color:white; border-radius:50%; padding:0.75rem; border:none; cursor:pointer; }
    .message-input-area button:disabled { background:#9ca3af; cursor:not-allowed; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="chat-container">
        <div className="chat-header">
          <h1># Group Chat</h1>
          <p>You are: <strong>{username}</strong></p>
          <div className="online-users">
            🟢 Online: {onlineUsers.join(", ")}
          </div>
        </div>

        <div className="chat-messages custom-scrollbar">
          {messages.map((msg, index) => {
            const isSelf = msg.user === username && username !== "";
            const isBot = msg.user === "AI Assistant";
            const isSystem = msg.user === "System";

            let role = "other";
            if (isSelf) role = "user";
            if (isBot) role = "bot";
            if (isSystem) role = "system";
            
            // This logic ensures "User1" is NOT shown for your own messages
            const showSender = !isSelf && !isSystem && !isBot;

            return (
              <div key={msg.id || index} className={`message-wrapper ${role}`}>
                {showSender && <div className="message-sender">{msg.user}</div>}
                <div className={`message ${role}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="message-input-area">
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type a message... (@ai to ask bot)"
            />
            <button type="submit" disabled={!userInput.trim()}>Send</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default GroupChatArea;