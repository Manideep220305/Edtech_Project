// server.js (ESM version)
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // allow frontend to connect
});

// Local in-memory DB
let messages = [];
let aiMessages = [];

// Track usernames
let availableUserNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // you can expand this
let userMap = {}; // socket.id -> username

io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  // Assign username
  let userNumber = availableUserNumbers.shift() || Date.now(); // fallback if too many users
  let username = `User${userNumber}`;
  userMap[socket.id] = { username, number: userNumber };

  // Send chat history
  socket.emit("chat-history", messages);
  // After assigning username
  socket.emit("your-username", username);


  // Notify everyone that user joined
  const joinMsg = {
    id: Date.now(),
    user: "System",
    text: `${username} joined the chat`,
  };
  messages.push(joinMsg);
  io.emit("chat-message", joinMsg);

  // Listen for chat messages
  socket.on("chat-message", (msg) => {
    const newMessage = {
      id: Date.now(),
      user: username,
      text: msg,
    };

    messages.push(newMessage);

    if (msg.startsWith("@ai")) {
      aiMessages.push(newMessage);
      console.log(`[AI MESSAGE] ${username}: ${msg}`);
    } else {
      console.log(`[USER MESSAGE] ${username}: ${msg}`);
    }

    io.emit("chat-message", newMessage);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const leftUser = userMap[socket.id];
    if (leftUser) {
      availableUserNumbers.push(leftUser.number); // free the number
      const leaveMsg = {
        id: Date.now(),
        user: "System",
        text: `${leftUser.username} left the chat`,
      };
      messages.push(leaveMsg);
      io.emit("chat-message", leaveMsg);
      delete userMap[socket.id];
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
