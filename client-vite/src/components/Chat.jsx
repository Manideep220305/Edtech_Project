import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect socket when component mounts
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Load old messages
    axios.get("http://localhost:5000/messages").then((res) => {
      setMessages(res.data);
    });

    // Listen for incoming messages
    newSocket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      console.log("Received message:", msg);
    });

    // Listen for username assignment
    newSocket.on("setUsername", (name) => {
      setUsername(name);
      console.log(`Your username is: ${name}`);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim() || !username || !socket) return;
    const msg = { sender: username, text };
    socket.emit("sendMessage", msg);
    console.log("Sent message:", msg);
    setText("");
  };

  return (
    <div style={{ width: "400px", margin: "auto" }}>
      <h2>Group Chat</h2>
      <div
        style={{
          border: "1px solid gray",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, idx) => (
          <p key={idx}>
            <b>{msg.sender}:</b> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
        style={{ width: "70%", padding: "5px" }}
      />
      <button onClick={sendMessage} style={{ padding: "5px 10px" }}>
        Send
      </button>
    </div>
  );
};

export default Chat;
