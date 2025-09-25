// server.js (ESM version)
import express from "express";
import http from "http";
import { Server } from "socket.io";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors"; // --- IMPORTED ---

const app = express();
app.use(cors()); // --- ADDED: This is the main fix ---
app.use(express.urlencoded({ extended: true })); // --- ADDED: Helps parse form data ---

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let regularMessages = [];
let aiMessages = [];
let pdfMessages = [];
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

app.post('/upload', upload.single('pdf'), (req, res) => {
  const { username, message } = req.body;
  if (!req.file || !username) {
    return res.status(400).send('File or username missing.');
  }
  console.log(`[PDF Upload] from ${username}: "${message || 'No caption'}" | File: ${req.file.originalname}`);
  const newPdfMessage = {
    id: Date.now(),
    user: username,
    text: message,
    file: {
      name: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
    },
  };

  pdfMessages.push(newPdfMessage);
  io.emit("chat-message", newPdfMessage);

  res.status(200).send('File uploaded and message broadcast.');
});

// ... (The rest of your server.js code remains exactly the same) ...

const broadcastOnlineUsers = () => {
  const onlineUsers = Array.from(userMap.values()).map(user => user.username);
  io.emit("online-users", onlineUsers);
  console.log("📢 Broadcasting online users:", onlineUsers);
};

const handleAiQuery = (originalMessage) => {
  const { user, text } = originalMessage;
  const query = text.substring(3).trim();
  setTimeout(() => {
    const aiResponse = {
      id: Date.now(),
      user: "AI Assistant",
      text: `Hello, ${user}. You asked about "${query}". I am a simulated assistant.`,
    };
    aiMessages.push(aiResponse);
    io.emit("chat-message", aiResponse);
    console.log(`[AI Response] to ${user}: ${aiResponse.text}`);
  }, 1500);
};

io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  const userNumber = availableUserNumbers.shift() || Math.floor(Math.random() * 1000);
  const username = `User${userNumber}`;
  userMap.set(socket.id, { username, number: userNumber });

  const allMessages = [...regularMessages, ...aiMessages, ...pdfMessages];
  allMessages.sort((a, b) => a.id - b.id);
  socket.emit("chat-history", allMessages);

  socket.emit("your-username", username);

  const joinMsg = { id: Date.now(), user: "System", text: `${username} joined the chat`};
  io.emit("chat-message", joinMsg);
  
  broadcastOnlineUsers();
  socket.on("chat-message", (msgText) => {
    const senderUsername = userMap.get(socket.id)?.username;
    if (!senderUsername) return;

    // Determine the message type first
    const isAiQuery = msgText.trim().toLowerCase().startsWith("@ai");
    const messageType = isAiQuery ? "AI Query" : "Regular";

    // New dynamic console log
    console.log(`[${messageType}] from ${senderUsername}: ${msgText}`);

    const newMessage = { id: Date.now(), user: senderUsername, text: msgText };

    if (isAiQuery) { // Use the variable we already created
      aiMessages.push(newMessage);
      handleAiQuery(newMessage);
    } else {
      regularMessages.push(newMessage);
    }
    
    io.emit("chat-message", newMessage);
  });


  socket.on("disconnect", () => {
    const disconnectedUser = userMap.get(socket.id);
    if (disconnectedUser) {
      console.log(`❌ ${disconnectedUser.username} disconnected.`);
      availableUserNumbers.unshift(disconnectedUser.number);
      availableUserNumbers.sort((a, b) => a - b);
      const leaveMsg = { id: Date.now(), user: "System", text: `${disconnectedUser.username} left the chat` };
      io.emit("chat-message", leaveMsg);
      userMap.delete(socket.id);
      broadcastOnlineUsers();
    }
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});