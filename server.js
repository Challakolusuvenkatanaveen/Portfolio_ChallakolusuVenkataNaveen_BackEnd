require("dotenv").config();
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { generateResponse } = require("./services/chatService");
connectDB();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/menu",         require("./routes/menuRoutes"));
app.use("/api/profile",      require("./routes/profileRoutes"));
app.use("/api/skills",       require("./routes/skillRoutes"));
app.use("/api/projects",     require("./routes/projectRoutes"));
app.use("/api/experience",   require("./routes/experienceRoutes"));
app.use("/api/education",    require("./routes/educationRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/recognition",  require("./routes/recognitionRoutes"));
app.use("/api/contact",      require("./routes/contactRoutes"));
app.use("/api/upload",       require("./routes/uploadRoutes"));
app.use("/api/chat",         require("./routes/chatRoutes"));
app.use("/api/admin",        require("./routes/adminRoutes"));

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("chat_message", async (data) => {
    try {
      const { message, sessionId = socket.id, user = "guest" } = data;

      if (!message || message.trim() === "") {
        socket.emit("chat_error", { error: "Message is required" });
        return;
      }

      const response = await generateResponse(message);

      socket.emit("chat_response", {
        message,
        response,
        timestamp: Date.now(),
      });
    } catch (error) {
      socket.emit("chat_error", { error: "Failed to process message", details: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// Function to start server with error handling
function startServer(port) {
  httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
