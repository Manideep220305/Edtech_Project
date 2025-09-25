// server.js (ESM version)
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // Allow frontend to connect
});

// In-memory data stores
let messages = [];
const availableUserNumbers = Array.from({ length: 100 }, (_, i) => i + 1); // A pool of numbers 1-100
const userMap = new Map(); // Use a Map for better performance: socket.id -> { username, number }

// --- NEW: Function to broadcast the current list of online users ---
const broadcastOnlineUsers = () => {
  const onlineUsers = Array.from(userMap.values()).map(user => user.username);
  io.emit("online-users", onlineUsers);
  console.log("📢 Broadcasting online users:", onlineUsers);
};

// --- NEW: Function to handle AI queries ---
const handleAiQuery = (originalMessage) => {
  const { user, text } = originalMessage;
  const query = text.substring(3).trim(); // Remove "@ai"

  // Simulate AI thinking delay
  setTimeout(() => {
    const aiResponse = {
      id: Date.now(),
      user: "AI Assistant",
      text: `Hello, ${user}. You asked me about "${query}". I am a simulated assistant, but I'm here to help!`,
    };

    messages.push(aiResponse);
    io.emit("chat-message", aiResponse); // Broadcast AI response to everyone
    console.log(`[AI Response] to ${user}: ${aiResponse.text}`);
  }, 1500); // 1.5 second delay
};

io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  // 1. Assign a username
  const userNumber = availableUserNumbers.shift() || Math.floor(Math.random() * 1000);
  const username = `User${userNumber}`;
  userMap.set(socket.id, { username, number: userNumber });

  // 2. Send history and the assigned username to the connected client
  socket.emit("chat-history", messages);
  socket.emit("your-username", username);

  // 3. Notify everyone else that a new user has joined
  const joinMsg = {
    id: Date.now(),
    user: "System",
    text: `${username} joined the chat`,
  };
  messages.push(joinMsg);
  io.emit("chat-message", joinMsg);

  // NEW: Update and broadcast the online user list
  broadcastOnlineUsers();

  // 4. Listen for new messages from this client
  socket.on("chat-message", (msgText) => {
    const senderUsername = userMap.get(socket.id)?.username;
    if (!senderUsername) return; // Safety check

    const newMessage = {
      id: Date.now(),
      user: senderUsername,
      text: msgText,
    };

    messages.push(newMessage);
    console.log(`[Message] ${senderUsername}: ${msgText}`);
    
    // Broadcast the original message to all connected clients
    io.emit("chat-message", newMessage);

    // NEW: Check if the message is an AI command
    if (msgText.trim().toLowerCase().startsWith("@ai")) {
      handleAiQuery(newMessage);
    }
  });

  // 5. Handle user disconnection
  socket.on("disconnect", () => {
    const disconnectedUser = userMap.get(socket.id);
    if (disconnectedUser) {
      console.log(`❌ ${disconnectedUser.username} disconnected.`);
      
      // Add the user number back to the available pool
      availableUserNumbers.unshift(disconnectedUser.number);
      availableUserNumbers.sort((a, b) => a - b); // Keep the array sorted

      const leaveMsg = {
        id: Date.now(),
        user: "System",
        text: `${disconnectedUser.username} left the chat`,
      };
      messages.push(leaveMsg);
      io.emit("chat-message", leaveMsg);
      
      userMap.delete(socket.id); // Clean up the map

      // NEW: Update and broadcast the online user list
      broadcastOnlineUsers();
    }
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});