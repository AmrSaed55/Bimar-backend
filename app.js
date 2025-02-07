import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import Message from "./models/chatModel.js";

import patientAuth from "./Routes/patientAuth.js";
import medicalRecordRoutes from "./Routes/medicalRecordRoutes.js";
import doctorRoutes from "./Routes/doctorRoute.js";
import diagnosisRoute from "./Routes/diagnosisRoute.js";
import patientRecordRoute from "./Routes/personalRecordRoute.js";
import bookingRoutes from "./Routes/bookingRoutes.js"
import accessRecordRoute from "./Routes/accessRecordRoute.js"
import chatRoutes from "./Routes/chatRoutes.js";
import connectToMongoDB from "./db/connectToMongoDB.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type"]
  },
  // Add transport options
  transports: ['websocket', 'polling']
});

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "")));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Routes
app.use("/patientsAuth", patientAuth);
app.use("/medical-records", medicalRecordRoutes);
app.use("/Diagnosis", diagnosisRoute);
app.use("/doctor", doctorRoutes);
app.use("/patientRecords", patientRecordRoute);
app.use("/bookings",bookingRoutes);
app.use("/access",accessRecordRoute)
app.use("/chat", chatRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a chat room
  socket.on("join_chat", (data) => {
    socket.join(data.chatRoom);
    console.log(`User joined room: ${data.chatRoom}`);
  });

  // Handle new messages
  socket.on("send_message", async (data) => {
    try {
      // Access the data directly from the message data
      const newMessage = await Message.create({
        sender: data.data.senderId,
        senderModel: data.data.senderType,
        receiver: data.data.receiverId,
        receiverModel: data.data.receiverType,
        message: data.data.message
      });

      io.to(data.data.chatRoom).emit("receive_message", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const Port = process.env.PORT || 3000;
httpServer.listen(Port, () => {
  connectToMongoDB();
  console.log(`Server running on port ${Port}`);
});