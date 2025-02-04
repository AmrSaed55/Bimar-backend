import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";

import patientAuth from "./Routes/patientAuth.js";
import medicalRecordRoutes from "./Routes/medicalRecordRoutes.js";
import doctorRoutes from "./Routes/doctorRoute.js";
import diagnosisRoute from "./Routes/diagnosisRoute.js";
import patientRecordRoute from "./Routes/personalRecordRoute.js";
import accessRecordRoute from "./Routes/accessRecordRoute.js"
import connectToMongoDB from "./db/connectToMongoDB.js";

dotenv.config();

const app = express();

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
app.use("/access",accessRecordRoute)

const Port = process.env.PORT || 3000;
app.listen(Port, () => {
  connectToMongoDB();
  console.log(`Listening on port ${Port}`);
});

//test new branch