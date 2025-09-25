import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Initialize socket connection outside the component
// Don't auto-connect yet; we'll connect after listeners are ready
const socket = io("http://localhost:3000", { autoConnect: false });


const GroupChatArea = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [username, setUsername] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("your-username", (name) => setUsername(name));
    socket.on("chat-history", (history) => {
      setMessages((prev) => {
      // Prevent duplicates by keeping existing + new (history is full list)
      const unique = [...history]; 
      return unique;
    });
});

    socket.on("chat-message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
    socket.on("online-users", (users) => setOnlineUsers(users));
    if (!socket.connected) socket.connect();

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

  const handleFileChange = (e) => {
    if (e.target.files[0] && e.target.files[0].type === "application/pdf") {
      setSelectedFile(e.target.files[0]);
    } else {
      // Clear selection if it's not a PDF
      e.target.value = null; 
      setSelectedFile(null);
      if (e.target.files[0]) { // Only alert if a file was actually selected
        alert("Please select a valid PDF file.");
      }
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();

    if (!trimmedInput && !selectedFile) return;

    if (selectedFile) {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('username', username);
      formData.append('message', trimmedInput);

      try {
        await fetch('http://localhost:3000/upload', {
          method: 'POST',
          body: formData,
        });
      } catch (error) {
        console.error("File upload failed:", error);
        alert("File upload failed!");
      }

      setSelectedFile(null);
      fileInputRef.current.value = null;
      setUserInput("");

    } else if (trimmedInput) {
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
    .chat-messages { flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}
    .online-users { font-size:0.8rem; color:#4b5563; margin-top:0.5rem; }
    .message-wrapper { display:flex; margin-bottom:1rem; flex-direction: column; }
    .message-wrapper.user { align-items:flex-end; }
    .message-wrapper.other { align-items:flex-start; }
    .message { border-radius:1.25rem; padding:0.75rem 1.25rem; max-width:80%; line-height:1.5; word-wrap: break-word; }
    .message.user { background:#3b82f6; color:#fff; border-bottom-right-radius:0.25rem; }
    .message.bot { background:#d1fae5; color:#065f46; border-bottom-left-radius:0.25rem; }
    .message.other { background:#e2e8f0; color:#111827; border-bottom-left-radius:0.25rem; }
    .message.system { text-align: center; color: #6b7280; font-style: italic; font-size: 0.875rem; background: transparent; width: 100%; padding: 0.5rem 0; }
    .message-sender { font-size: 0.8rem; font-weight: 600; color: #4b5563; margin: 0 0.75rem 0.25rem; }
    .message-input-area { padding:1rem 1.5rem; border-top:1px solid #e5e7eb; background:#f9fafb; }
    .message-input-area form { display:flex; align-items:center; gap:0.5rem; }
    .message-input-area input[type="text"] { flex-grow:1; padding:0.75rem 1.25rem; border:1px solid #d1d5db; border-radius:9999px; font-size:1rem; }
    .message-input-area button { background:#3b82f6; color:white; border-radius:50%; padding:0.75rem; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .message-input-area button:disabled { background:#9ca3af; cursor:not-allowed; }
    .message.pdf { background: #fdf2f2; color: #991b1b; border: 1px solid #fecaca; border-bottom-left-radius: 0.25rem; }
    .pdf-link { color: #be123c; text-decoration: underline; font-weight: 600; }
    .attach-button { background: #f3f4f6; border:1px solid #d1d5db; color: #374151;}
    .file-indicator { font-size: 0.75rem; color: #4b5563; padding: 0.5rem 1.5rem 0; text-align: left; }
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
            const isPdf = !!msg.file;

            let role = "other";
            if (isPdf) role = "pdf"; // PDF styling takes precedence
            else if (isSelf) role = "user";
            else if (isBot) role = "bot";
            else if (isSystem) role = "system";
            
            const showSender = !isSelf && !isSystem;

            return (
              <div key={msg._id || index} className={`message-wrapper ${isSelf ? 'user' : 'other'}`}>
                  {showSender && <div className="message-sender">{msg.user}</div>}
                  <div className={`message ${role}`}>
                    {/* 👇 START OF CHANGES */}
                    {/* If there's a caption, show it. If not, don't show anything for non-PDFs. */}
                    {msg.text && <div>{msg.text}</div>}
                    {/* 👆 END OF CHANGES */}
                    
                    {isPdf && (
                      <p style={{ marginTop: msg.text ? '0.5rem' : '0', marginBottom: '0' }}>
                        📄 <a href={`http://localhost:3000${msg.file.path}`} target="_blank" rel="noopener noreferrer" className="pdf-link">
                          {msg.file.name}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="message-input-area">
          <form onSubmit={handleSendMessage}>
            <button type="button" onClick={handleAttachClick} className="attach-button">📎</button>
            <input
              type="file"
              ref={fileInputRef}
              // --- THIS IS THE FIX ---
              onChange={handleFileChange} 
              style={{ display: 'none' }}
              accept=".pdf"
            />
            
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={selectedFile ? "Add a caption for your PDF..." : "Type a message..."}
            />
            <button type="submit" disabled={!userInput.trim() && !selectedFile}>Send</button>
          </form>
          {selectedFile && <div className="file-indicator">Attached: {selectedFile.name}</div>}
        </div>
      </div>
    </>
  );
};

export default GroupChatArea;