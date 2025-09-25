import React, { useState, useEffect, useRef } from 'react';

const ChatApp = () => {
    // State to hold all messages in the chat
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm HackBot. How can I help with your project today?", sender: "bot" },
    ]);
    // State for the user's current input
    const [userInput, setUserInput] = useState('');
    // State to show/hide the bot's typing indicator
    const [isTyping, setIsTyping] = useState(false);
    
    // Ref to the message container for auto-scrolling
    const messagesEndRef = useRef(null);

    // Function to scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // useEffect hook to scroll down whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Function to handle sending a message
    const handleSendMessage = (e) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput) return; // Don't send empty messages

        // Add user's message to the state
        const newUserMessage = {
            id: Date.now(),
            text: trimmedInput,
            sender: 'user'
        };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput(''); // Clear the input field
        
        // Simulate bot response
        simulateBotResponse(trimmedInput);
    };

    // Function to simulate a bot's reply
    const simulateBotResponse = (userText) => {
        setIsTyping(true); // Show typing indicator
        
        // Simulate a delay for the bot's "thinking" time
        setTimeout(() => {
            const botResponses = [
                `That's an interesting point about "${userText}". Could you elaborate?`,
                "I'm processing your request. One moment...",
                "How does this relate to your project's main goal?",
                "Let's break that down. What's the first step?",
                "I've found some resources related to your query. Should I share them?"
            ];
            const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

            const newBotMessage = {
                id: Date.now() + 1,
                text: randomResponse,
                sender: 'bot'
            };

            setIsTyping(false); // Hide typing indicator
            setMessages(prev => [...prev, newBotMessage]); // Add bot's message
        }, 2000);
    };

    const styles = `
        .chat-container {
            display: flex;
            flex-direction: column;
            height: 90vh;
            max-width: 800px;
            width: 100%;
            margin: auto;
            background-color: #ffffff;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            border-radius: 0.75rem;
            overflow: hidden;
            font-family: 'Inter', sans-serif;
        }
        .chat-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            text-align: center;
            background-color: #f9fafb;
        }
        .chat-header h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
        }
        .chat-header p {
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0.25rem 0 0;
        }
        .chat-header span {
            display: inline-block;
            background-color: #e5e7eb;
            color: #4b5563;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-top: 0.75rem;
        }
        .chat-messages {
            flex-grow: 1;
            padding: 1.5rem;
            overflow-y: auto;
        }
        .message-wrapper {
            display: flex;
            margin-bottom: 1rem;
        }
        .message-wrapper.user {
            justify-content: flex-end;
        }
        .message-wrapper.bot {
            justify-content: flex-start;
        }
        .message {
            border-radius: 1.25rem;
            padding: 0.75rem 1.25rem;
            max-width: 80%;
            line-height: 1.5;
        }
        .message.user {
            background-color: #3b82f6;
            color: white;
            border-bottom-right-radius: 0.25rem;
        }
        .message.bot {
            background-color: #f3f4f6;
            color: #1f2937;
            border-bottom-left-radius: 0.25rem;
        }
        .typing-indicator {
            display: flex;
            justify-content: flex-start;
            margin-bottom: 1rem;
        }
        .typing-indicator .bubble {
            background-color: #f3f4f6;
            border-radius: 1.25rem;
            border-bottom-left-radius: 0.25rem;
            padding: 0.75rem 1.25rem;
        }
        .typing-indicator .dots {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.375rem;
            height: 1.25rem;
        }
        .typing-indicator .dot {
            height: 0.5rem;
            width: 0.5rem;
            background-color: #9ca3af;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
        }
        .typing-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator .dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        .message-input-area {
            padding: 1rem 1.5rem;
            border-top: 1px solid #e5e7eb;
            background-color: #f9fafb;
        }
        .message-input-area form {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .message-input-area input {
            flex-grow: 1;
            width: 100%;
            padding: 0.75rem 1.25rem;
            color: #374151;
            background-color: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 9999px;
            transition: all 0.2s ease-in-out;
            font-size: 1rem;
        }
        .message-input-area input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
        }
        .message-input-area button {
            background-color: #3b82f6;
            color: white;
            border-radius: 50%;
            padding: 0.75rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            flex-shrink: 0;
        }
        .message-input-area button:hover {
            background-color: #2563eb;
            transform: scale(1.1);
        }
        .message-input-area button:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
        }
        .message-input-area button:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
            transform: scale(1);
        }
        .message-input-area button svg {
            height: 1.5rem;
            width: 1.5rem;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #94a3b8;
            border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #64748b;
        }
    `;

    return (
        <React.Fragment>
            <style>{styles}</style>
            <div className="chat-container">
                {/* Chat Header */}
                <div className="chat-header">
                    <h1># Hackathon</h1>
                    <p>Hackbot / Agent Area</p>
                    <span>Slack/Discord</span>
                </div>

                {/* Chat Messages Area */}
                <div className="chat-messages custom-scrollbar">
                    {messages.map(message => (
                        <div key={message.id} className={`message-wrapper ${message.sender}`}>
                            <div className={`message ${message.sender}`}>
                                {message.text}
                            </div>
                        </div>
                    ))}
                    
                    {/* Bot Typing Indicator */}
                    {isTyping && (
                        <div className="typing-indicator">
                            <div className="bubble">
                                <div className="dots">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Empty div to help with auto-scrolling */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input Area */}
                <div className="message-input-area">
                    <form onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Plan your next steps..."
                        />
                        <button
                            type="submit"
                            disabled={!userInput.trim()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </React.Fragment>
    );
};

export default ChatApp;

