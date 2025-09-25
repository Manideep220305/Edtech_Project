// server.js (ESM version with MongoDB)
import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";
import mongoose from "mongoose"; // --- 1. IMPORT MONGOOSE ---
import Message from "./models/Message.js"; // --- 2. IMPORT MESSAGE MODEL ---
import messageRoutes from "./routes/messages.js";

const app = express();




app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/messages", messageRoutes);

// --- 3. CONNECT TO MONGODB ---
// Make sure to replace this with your actual connection string
mongoose.connect("mongodb+srv://rohithm16:roro@studycluster.20dcyhi.mongodb.net/")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 4. REMOVE ARRAYS ---
// let regularMessages = [];
// let aiMessages = [];
// let pdfMessages = [];
const userMap = new Map();
const availableUserNumbers = Array.from({ length: 100 }, (_, i) => i + 1);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `pdf-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 5. UPDATE UPLOAD ROUTE TO SAVE TO DB ---
app.post('/upload', upload.single('pdf'), async (req, res) => { // added async
  const { username, message } = req.body;
  if (!req.file || !username) {
    return res.status(400).send('File or username missing.');
  }
  console.log(`[PDF Upload] from ${username}: "${message || 'No caption'}" | File: ${req.file.originalname}`);

  const newPdfMessage = new Message({
    user: username,
    text: message,
    file: {
      name: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
    },
  });

  // server.js (Recommended code)
  try {
    await newPdfMessage.save();
    io.emit("chat-message", newPdfMessage);
    res.status(200).send('File uploaded and message broadcast.');
  } catch (error) {
    console.error("❌ Error saving PDF message to DB:", error);
    res.status(500).send('Failed to save message.');
  }
});

const broadcastOnlineUsers = () => {
  const onlineUsers = Array.from(userMap.values()).map(user => user.username);
  io.emit("online-users", onlineUsers);
  console.log("📢 Broadcasting online users:", onlineUsers);
};

// --- 6. UPDATE AI HANDLER TO SAVE TO DB ---
const handleAiQuery = (originalMessage) => {
  const { user, text } = originalMessage;
  const query = text.substring(3).trim();

  setTimeout(async () => { // added async
    const aiResponse = new Message({
      user: "AI Assistant",
      text: `Hello, ${user}. You asked about "${query}". I am a simulated assistant.`,
    });
    
    try {
      await aiResponse.save();
      io.emit("chat-message", aiResponse);
      console.log(`[AI Response] to ${user}: ${aiResponse.text}`);
    } catch (error) {
      console.error("❌ Error saving AI response to DB:", error);
    }
  }, 1500);
};

io.on("connection", async (socket) => { // added async
  console.log("✅ New user connected:", socket.id);

  const userNumber = availableUserNumbers.shift() || Math.floor(Math.random() * 1000);
  const username = `User${userNumber}`;
  userMap.set(socket.id, { username, number: userNumber });

  // --- 7. FETCH CHAT HISTORY FROM DB ---
  const allMessages = await Message.find().sort({ createdAt: 1 });
  socket.emit("chat-history", allMessages);

  socket.emit("your-username", username);


  broadcastOnlineUsers();

  // --- 8. UPDATE MESSAGE HANDLER TO SAVE TO DB ---
  socket.on("chat-message", async (msgText) => { // added async
    const senderUsername = userMap.get(socket.id)?.username;
    if (!senderUsername) return;

    const isAiQuery = msgText.trim().toLowerCase().startsWith("@ai");
    const messageType = isAiQuery ? "AI Query" : "Regular";
    console.log(`[${messageType}] from ${senderUsername}: ${msgText}`);

    const newMessage = new Message({
      user: senderUsername,
      text: msgText,
    });
    
    try {
      await newMessage.save();
      const allMessages = await Message.find().sort({ createdAt: 1 });
      io.emit("chat-history", allMessages);
      if (isAiQuery) {
        handleAiQuery(newMessage);
      }
    } catch (error) {
      console.error("❌ Error saving chat message to DB:", error);
    }
  });

  socket.on("disconnect", () => {
    const disconnectedUser = userMap.get(socket.id);
    if (disconnectedUser) {
      console.log(`❌ ${disconnectedUser.username} disconnected.`);
      availableUserNumbers.unshift(disconnectedUser.number);
      availableUserNumbers.sort((a, b) => a - b);
      userMap.delete(socket.id);
      broadcastOnlineUsers();
    }
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});