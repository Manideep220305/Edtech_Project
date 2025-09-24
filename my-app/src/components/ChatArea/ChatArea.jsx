import React, { useState, useEffect } from 'react';
import './ChatArea.css';

const ChatArea = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, how can I help with your project?", sender: "bot" },
    { id: 2, text: "Need help planning my next steps?", sender: "bot" }
  ]);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, 
        { id: 3, text: "Need planning my next steps?", sender: "bot" }
      ]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="chat-area">
      <div className="chat-header">
        <h2># Hackathon</h2>
        <div className="chat-subtitle">Hackbot/Agent Area</div>
        <div className="chat-tag">Stack/Discord</div>
      </div>
      
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
        {typing && (
          <div className="message bot typing">
            <div className="typing-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="user-section">
        <div className="user-header">
          <h3>Tom Alpha</h3>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;