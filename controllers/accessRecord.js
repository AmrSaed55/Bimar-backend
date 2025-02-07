import QRcode from "qrcode";
import jwt from "jsonwebtoken";
import PatientModel from "../models/PatientAuth_Model.js";
import DoctorModel from "../models/doctorModel.js";
import { validationResult } from "express-validator";
import errorHandler from "../utilities/errorHandler.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const QRcodeGeneration = async (req, res) => {
  try {
    const { patientEmail, doctorEmail, accessDuration } = req.body;
    let validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      throw validationError;
    }

    const patient = await PatientModel.findOne({ userEmail: patientEmail });
    const doctor = await DoctorModel.findOne({ userEmail: doctorEmail });

    if (!patient || !doctor) {
      throw "Patient or doctor not found";
    }

    const payload = {
      patientEmail,
      doctorEmail,
      exp: Math.floor(Date.now() / 1000) + accessDuration * 60,
    };

    const token = jwt.sign(payload, process.env.JWT_KEY);
    const qrcodeData = await QRcode.toDataURL(token);

    res.json({
      qrcodeData,
      token,
      expiresIn: accessDuration * 60,
    });
  } catch (er) {
    console.log(er);
    errorHandler(res, er);
  }
};

const QRcodeVerification = async (req, res) => {
  try {
    const { token, doctorEmail } = req.body;
    let validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      throw validationError;
    }
    const decode = jwt.verify(token, process.env.JWT_KEY);
    if (decode.doctorEmail !== doctorEmail) {
      throw "Access Denied";
    }
    const patient = await PatientModel.findOne({
      userEmail: decode.patientEmail,
    });
    if (!patient) {
      throw "Patient Not Found";
    }

    res.json({
      valid: true,
      information: {
        medicalRecord: patient.medicalRecord || "No medical records available",
        personalRecords:
          patient.personalRecords || "No personal records available",
      },
      data: "Access Granted",
    });
  } catch (er) {
    console.log(er);
    errorHandler(res, er);
  }
};

const accessRequests = new Map();

const generateAccessLink = async (req, res) => {
  try {
    const { patientEmail, doctorEmail, accessDuration } = req.body;

    let validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      throw validationError;
    }

    const patient = await PatientModel.findOne({ userEmail: patientEmail });
    const doctor = await DoctorModel.findOne({ doctorEmail: doctorEmail });

    if (!patient || !doctor) {
      throw "Patient or doctor not found";
    }

    const accessPassword = crypto.randomBytes(4).toString("hex");

    const payload = {
      patientEmail,
      doctorEmail,
      exp: Math.floor(Date.now() / 1000) + accessDuration * 60,
    };

    const token = jwt.sign(payload, process.env.JWT_KEY);
    const accessLink = `${process.env.FRONTEND_URL}/access/${token}`;

    accessRequests.set(token, {
      accessPassword,
      expiresAt: Date.now() + accessDuration * 60 * 1000,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: doctor.doctorEmail,
      subject: "Patient Medical Record Access Link",
      html: `<div
  style="font-family: Arial, sans-serif; background-color: #F0F4F9; padding: 40px;"
>
  <div
    style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); overflow: hidden; width: 100%;"
  >
    <!-- Header Section -->
    <div style="background-color: #16423C; padding: 30px; text-align: center;">
      <h1
        style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: bold;"
      >
        🩺 Record Access Request
      </h1>
    </div>

    <!-- Content Section -->
    <div style="padding: 30px;">
      <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">
        Dr. ${doctor.doctorName}
      </h2>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        You requested access to medical records for
        <strong>${patient.userName}</strong>:
      </p>

      <div style="margin: 25px 0;">
        <div
          style="background-color: #F0F4F9; padding: 20px; border-radius: 8px;"
        >
          <p style="text-align: center; margin: 20px 0;">
            <a
              href="${accessLink}"
              style="display: inline-block; background-color: #16423C; color: #FFFFFF; font-size: 18px; font-weight: bold; text-decoration: none; padding: 14px 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"
            >
              Click Here
            </a>
          </p>
        </div>
      </div>

      <div
        style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeeba;"
      >
        <p style="color: #856404; margin: 0; font-size: 16px;">
          🔴 You must obtain the access password from the patient
        </p>
      </div>
    </div>

    <!-- Footer Section -->
    <div
      style="background-color: #E1DEDE; text-align: center; padding: 20px; font-size: 14px; color: #777;"
    >
      <p style="margin: 0;">
        Need assistance? Contact us at
        <a
          href="mailto:bimar.med24@gmail.com"
          style="color: #16423C; text-decoration: underline;"
          >bimar.med24@gmail.com</a
        >
      </p>
      <p style="margin-top: 8px;">
        &copy; 2024
        <span style="color: #16423C; font-weight: bold;">Bimar</span>. All
        Rights Reserved.
      </p>
    </div>
  </div>
</div>

<!-- Media Query -->
<style>
  @media only screen and (max-width: 600px) {
         div[style*="padding: 40px;"] {
             padding: 20px !important;
         }

         div[style*="padding: 30px;"] {
             padding: 20px !important;
         }

         h1, h2 {
             font-size: 20px !important;
         }

         p, a {
             font-size: 14px !important;
         }

         span[style*="font-size: 28px;"] {
             font-size: 20px !important;
             padding: 10px 20px !important;
         }

         a[style*="padding: 14px 40px;"] {
             padding: 10px 20px !important;
         }
     }
</style>
`,
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: patient.userEmail,
      subject: "Doctor Access Password",
      html: `<div
  style="font-family: Arial, sans-serif; background-color: #F0F4F9; padding: 40px;"
>
  <div
    style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); overflow: hidden; width: 100%;"
  >
    <!-- Header Section -->
    <div style="background-color: #16423C; padding: 30px; text-align: center;">
      <h1
        style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: bold;"
      >
        🔑 Access Authorization
      </h1>
    </div>

    <!-- Content Section -->
    <div style="padding: 30px;">
      <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">
        Hello, ${patient.userName} 👋
      </h2>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        <strong>Dr. ${doctor.doctorName}</strong> has requested access to your
        medical records.
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <div
          style="background-color: #F0F4F9; padding: 20px; border-radius: 8px;"
        >
          <p
            style="color: #16423C; font-size: 24px; margin: 0; font-weight: bold;"
          >
            Your Access Password<br />
            <span
              style="display: inline-block; margin-top: 10px; padding: 12px 24px; background-color: #FFFFFF; border-radius: 6px;"
            >
              ${accessPassword}
            </span>
          </p>
        </div>
      </div>

      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        Share this password only with your trusted healthcare provider. It will
        expire after 24 hours.
      </p>
    </div>

    <!-- Footer Section -->
    <div
      style="background-color: #E1DEDE; text-align: center; padding: 20px; font-size: 14px; color: #777;"
    >
      <p style="margin: 0;">
        Didn't request this? Contact us immediately at
        <a
          href="mailto:bimar.med24@gmail.com"
          style="color: #16423C; text-decoration: underline;"
          >bimar.med24@gmail.com</a
        >
      </p>
      <p style="margin-top: 8px;">
        &copy; 2024
        <span style="color: #16423C; font-weight: bold;">Bimar</span>. All
        Rights Reserved.
      </p>
    </div>
  </div>
</div>

<!-- Media Query -->
<style>
  @media only screen and (max-width: 600px) {
         div[style*="padding: 40px;"] {
             padding: 20px !important;
         }

         div[style*="padding: 30px;"] {
             padding: 20px !important;
         }

         h1, h2 {
             font-size: 20px !important;
         }

         p, a {
             font-size: 14px !important;
         }

         span[style*="font-size: 28px;"] {
             font-size: 20px !important;
             padding: 10px 20px !important;
         }

         a[style*="padding: 14px 40px;"] {
             padding: 10px 20px !important;
         }
     }
</style>
`,
    });

    res.status(200).json({
      accessLink,
      token,
      expiresIn: accessDuration * 60,
      data: "Access link sent to doctor and password sent to patient",
    });
  } catch (er) {
    console.log(er);
    errorHandler(res, er);
  }
};

const verifyAccessLink = async (req, res) => {
  try {
    const { token, doctorEmail, password } = req.body;

    let validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      throw validationError;
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    if (decoded.doctorEmail !== doctorEmail) {
      throw "Access Denied";
    }
    const patient = await PatientModel.findOne({
      userEmail: decoded.patientEmail,
    });
    if (!patient) {
      throw "Patient Not Found";
    }
    const storedAccess = accessRequests.get(token);
    if (!storedAccess || Date.now() > storedAccess.expiresAt) {
      accessRequests.delete(token);
      throw "Access Link Expired";
    }
    if (password !== storedAccess.accessPassword) {
      throw "Incorrect Password";
    }

    res.status(200).json({
      valid: true,
      information: {
        medicalRecord: patient.medicalRecord || "No medical records available",
        personalRecords:
          patient.personalRecords || "No personal records available",
      },
      data: "Access Granted",
    });

    accessRequests.delete(token);
  } catch (er) {
    console.log(er);
    errorHandler(res, er);
  }
};

export {
  QRcodeGeneration,
  QRcodeVerification,
  generateAccessLink,
  verifyAccessLink,
};
