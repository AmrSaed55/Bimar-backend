import Admin from "../models/AdminAuthModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import responseMsgs from "../utilities/responseMsgs.js";
import errorHandler from "../utilities/errorHandler.js";
import dotenv from "dotenv";
import PatientModel from "../models/PatientAuth_Model.js";
import Appointments from "../models/AppointmentsModel.js";

dotenv.config();

const register = async (req, res) => {
  try {
    const newAdminData = req.body;

    // Validate that required fields exist
    if (
      !newAdminData.email ||
      !newAdminData.password ||
      !newAdminData.username
    ) {
      throw "Missing required fields";
    }

    // Check if admin with this email already exists
    const existingAdmin = await Admin.findOne({ email: newAdminData.email });
    if (existingAdmin) {
      throw "Admin with this email already exists";
    }

    const hashedPassword = await bcrypt.hash(newAdminData.password, 6);
    const addAdmin = await Admin.create({
      ...newAdminData,
      password: hashedPassword,
    });

    if (addAdmin) {
      res.status(200).json({
        status: responseMsgs.SUCCESS,
        data: "Admin Added Successfully",
      });
    }
  } catch (err) {
    console.log("Error in register admin:", err);
    errorHandler(res, err);
  }
};

const getAllPatients = async (req, res) => {
  try {
    // Verify this is an admin request
    const token = req.cookies.jwt;
    if (!token) throw "Token not provided";

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (!decoded.isAdmin) throw "Unauthorized: Admin access required";

    // Fetch all patients with selected fields
    const patients = await PatientModel.find({});

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      count: patients.length,
      data: patients,
    });
  } catch (err) {
    console.log("Error in getAllPatients:", err);
    errorHandler(res, err);
  }
};

const getAllAppointments = async (req, res) => {
  try {
    // Verify this is an admin request
    const token = req.cookies.jwt;
    if (!token) throw "Token not provided";

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (!decoded.isAdmin) throw "Unauthorized: Admin access required";

    // Fetch all appointments with full populated references
    const appointments = await Appointments.find({})
      .populate("patientId") // Get all patient fields
      .populate("doctorId") // Get all doctor fields
      .populate("clinicId") // Get all clinic fields
      .sort({ appointmentDate: -1 }); // Most recent first

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      count: appointments.length,
      data: appointments,
    });
  } catch (err) {
    console.log("Error in getAllAppointments:", err);
    errorHandler(res, err);
  }
};

export default {
  register,
  getAllPatients,
  getAllAppointments,
};
