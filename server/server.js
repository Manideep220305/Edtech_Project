const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const messageRoutes = require("./routes/messages");
const Message = require("./models/Message");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/messages", messageRoutes);

const PORT = 5000;

// MongoDB connection
mongoose.connect("mongodb+srv://rohithm16:rohith@studyhubcluster.cssbc4o.mongodb.net/")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// HTTP server for Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }, // ✅ Vite port
});

// Track active users
const activeUsers = new Map();

// Socket.IO events
io.on("connection", (socket) => {
  // assign first free username
  let username = `User${activeUsers.size + 1}`;
  activeUsers.set(socket.id, username);

  console.log("✅ User connected:", socket.id, "as", username);
  socket.emit("setUsername", username); // send assigned username to client

  socket.on("sendMessage", async (data) => {
    console.log("📩 New message received:", data);

    const message = new Message(data);
    await message.save();

    io.emit("receiveMessage", message); // broadcast to all users
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id, "was", activeUsers.get(socket.id));
    activeUsers.delete(socket.id);
  });
});

// Start server
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
