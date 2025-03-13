import doctor from "../models/doctorModel.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import responseMsgs from "../utilities/responseMsgs.js";
import errorHandler from "../utilities/errorHandler.js";
import nodemailer from "nodemailer";
import generateTokenAndSetCookie from "./../utilities/generateToken.js";

// Register Function
const register = async (req, res) => {
  try {
    let newDoctorData = req.body;

    if (req.files) {
      // Assign doctorImage and syndicateCard
      newDoctorData.doctorImage =
        req.files.find((file) => file.fieldname === "doctorImage")?.path ||
        null;
      newDoctorData.syndicateCard =
        req.files.find((file) => file.fieldname === "syndicateCard")?.path ||
        null;
      newDoctorData.certificates = req.files
        .filter((file) => file.fieldname === "certificates")
        .map((file) => file.path);

      // Process clinicLicense inside the clinic array
      if (Array.isArray(newDoctorData.clinic)) {
        newDoctorData.clinic = newDoctorData.clinic.map((clinic, index) => {
          const clinicLicenseFile = req.files.find(
            (file) => file.fieldname === `clinic[${index}][clinicLicense]`
          );
          return {
            ...clinic,
            clinicLicense: clinicLicenseFile ? clinicLicenseFile.path : null,
          };
        });
      }
    }

    let validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      throw validationError;
    }

    let hashedPassword = await bcrypt.hash(newDoctorData.doctorPassword, 6);
    let addDoctor = await doctor.create({
      ...newDoctorData,
      doctorPassword: hashedPassword,
    });

    // Send a welcome email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: "bimar.med24@gmail.com",
      to: newDoctorData.doctorEmail,
      subject: "Welcome to Bimar",
      html: ` <div style="font-family: Arial, sans-serif; background-color: #F0F4F9; padding: 40px;"> 
                <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px;"> 
                  <h1 style="background-color: #16423C; color: white; padding: 30px; text-align: center;">👋 Welcome to Our App</h1> 
                  <div style="padding: 30px;"> 
                  <h2>Hello, ${newDoctorData.doctorName} 👋</h2> 
                  <p>We're excited to have you on board as part of our community. You can now log in and start exploring our platform.</p> 
                  <p>If you have any questions, feel free to reach out to our support team.</p> 
                  <p>Best regards,</p> 
                  <p>Bimar's Team</p> 
                  </div> 
                </div> 
              </div>`,
    };

    if (addDoctor) {
      generateTokenAndSetCookie(addDoctor._id, "Doctor", res);
      await transporter.sendMail(mailOptions);
      res.status(201).json({
        status: responseMsgs.SUCCESS,
        data: "SignUp Successfully",
      });
    }
  } catch (er) {
    console.log("Error in register DOCTOR controller", er.message);
    errorHandler(res, er);
  }
};

const login = async (req, res) => {
  try {
    let credentials = req.body;
    let getDoctor = await doctor.findById(credentials.doctorId);
    if (!getDoctor) {
      return res.status(400).json({ error: "Doctor not found" });
    }

    let checkPassword = await bcrypt.compare(
      credentials.doctorPassword,
      getDoctor.doctorPassword
    );
    if (!checkPassword) {
      return res.status(400).json({ error: "wrong password" });
    }

    const doctorData = getDoctor;

    generateTokenAndSetCookie(getDoctor._id, "Doctor", res);

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: "Logged In Successfully",
      doctor: doctorData,
    });
  } catch (er) {
    console.log("Error in login doctor controller", er.message);
    errorHandler(res, er);
  }
};

// Generate OTP Function
const generateOtp = () => {
  return String(Math.floor(10000 + Math.random() * 90000)).padStart(5, "0");
};

// Forget Password Function
const forgetPassword = async (req, res) => {
  try {
    const { doctorEmail } = req.body;
    const foundDoctor = await doctor.findOne({ doctorEmail });
    if (!foundDoctor) {
      throw "User With This Email does not exist";
    }

    const otp = generateOtp();

    const token = jwt.sign({ email: doctorEmail }, process.env.JWT_KEY, {
      expiresIn: "10m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: "bimar.med24@gmail.com",
      to: doctorEmail,
      subject: "Password Reset OTP",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #F0F4F9; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px;">
          <h1 style="background-color: #16423C; color: white; padding: 30px; text-align: center;">🔒 Password Reset</h1>
          <div style="padding: 30px;">
            <h2>Hello, ${doctorEmail} 👋</h2>
            <p>We've received a request to reset your password. Use OTP below:</p>
            <h3 style="color: #16423C; text-align: center;">${otp}</h3>
            <p>This OTP is valid for 10 minutes. If not requested, ignore this email.</p>
          </div>
        </div>
      </div>`,
    };

    await transporter.sendMail(mailOptions);

    res.cookie("otp", otp, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 60 * 1000,
    });

    res.status(200).cookie("jwt", token).json({
      status: responseMsgs.SUCCESS,
      data: "OTP sent to your email",
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

// Verify OTP Function
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const storedOtp = req.cookies.otp;

    if (!storedOtp) {
      return res.status(400).json({
        status: responseMsgs.FAILURE,
        data: "OTP has expired or does not exist",
      });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({
        status: responseMsgs.FAILURE,
        data: "Incorrect OTP. Please try again.",
      });
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: "OTP verified successfully. Now you can reset your password",
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

// Reset Password Function
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const token = req.cookies.jwt;

    if (!token) {
      throw "No Token Provided";
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      throw "Invalid or expired token";
    }

    const email = decoded.email;

    const foundDoctor = await doctor.findOne({ doctorEmail: email });
    if (!foundDoctor) {
      throw "User Not Found";
    }

    const hashedPassword = await bcrypt.hash(newPassword, 6);

    const update = await doctor.updateOne(
      { doctorEmail: email },
      { doctorPassword: hashedPassword }
    );

    res.clearCookie("otp");

    res
      .status(200)
      .json(
        update
          ? { data: "Password updated" }
          : { data: "Password update failed" }
      );
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

// Get All Doctors Function
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctor.find({});
    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: doctors,
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

// Delete Doctor Function
const deleteDoctor = async (req, res) => {
  try {
    const { email } = req.body; // Assuming the email is sent in the request body

    if (!email) {
      throw "Email is required to delete the account";
    }

    const result = await doctor.deleteOne({ doctorEmail: email });

    if (result.deletedCount === 0) {
      throw "Doctor not found or already deleted";
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: "Doctor account deleted successfully",
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

// Delete Clinic Function
const deleteClinic = async (req, res) => {
  try {
    const { doctorEmail, clinicId } = req.body; // Assuming the email and clinic ID are sent in the request body

    if (!doctorEmail || !clinicId) {
      throw "Doctor email and clinic ID are required to delete the clinic";
    }

    const result = await doctor.updateOne(
      { doctorEmail: doctorEmail },
      { $pull: { clinic: { _id: clinicId } } } // Use $pull to remove the clinic by ID
    );

    if (result.modifiedCount === 0) {
      throw "Clinic not found or already deleted";
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: "Clinic deleted successfully",
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

// Update Doctor Function
const updateDoctor = async (req, res) => {
  try {
    const { email } = req.body; // Extract email from the request body

    if (!email) {
      throw "Email is required to update the doctor";
    }

    // Create an object to hold the fields to update
    const updateData = {};

    // Check for each field and add it to updateData if it exists in the request body
    if (req.body.doctorName) updateData.doctorName = req.body.doctorName;
    if (req.body.doctorDateOfBirth)
      updateData.doctorDateOfBirth = req.body.doctorDateOfBirth;
    if (req.body.doctorPhone) updateData.doctorPhone = req.body.doctorPhone;
    if (req.body.doctorEmail) updateData.doctorEmail = req.body.doctorEmail;

    // Do not allow changes to the following fields
    // Commented out to prevent updates
    // if (req.body.nationalID) updateData.nationalID = req.body.nationalID;
    // if (req.body.field) updateData.field = req.body.field;
    // if (req.body.syndicateID) updateData.syndicateID = req.body.syndicateID;
    // if (req.body.syndicateCard) updateData.syndicateCard = req.body.syndicateCard;
    // if (req.body.certificates) updateData.certificates = req.body.certificates;

    // Update the doctor in the database
    const result = await doctor.updateOne(
      { doctorEmail: email },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      throw "Doctor not found or no changes made";
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: "Doctor updated successfully",
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const updateClinic = async (req, res) => {
  try {
    const { doctorEmail, clinicId, clinicData } = req.body; // Extract email, clinic ID, and new clinic data

    if (!doctorEmail || !clinicId || !clinicData) {
      throw "Doctor email, clinic ID, and clinic data are required to update the clinic";
    }

    // Create an object to hold the fields to update
    const updateData = {};

    // Check for each field in clinicData and add it to updateData if it exists
    if (clinicData.clinicCity)
      updateData["clinic.$.clinicCity"] = clinicData.clinicCity;
    if (clinicData.clinicArea)
      updateData["clinic.$.clinicArea"] = clinicData.clinicArea;
    if (clinicData.clinicAddress)
      updateData["clinic.$.clinicAddress"] = clinicData.clinicAddress;
    if (clinicData.clinicPhone)
      updateData["clinic.$.clinicPhone"] = clinicData.clinicPhone;
    if (clinicData.clinicEmail)
      updateData["clinic.$.clinicEmail"] = clinicData.clinicEmail;
    if (clinicData.clinicWebsite)
      updateData["clinic.$.clinicWebsite"] = clinicData.clinicWebsite;
    if (clinicData.clinicLocationLinks)
      updateData["clinic.$.clinicLocationLinks"] =
        clinicData.clinicLocationLinks;
    if (clinicData.Price) updateData["clinic.$.Price"] = clinicData.Price;

    // Do not allow changes to the following fields
    // Commented out to prevent updates
    // if (clinicData.clinicLicense) updateData.clinicLicense = clinicData.clinicLicense;

    // Update the specific clinic in the database
    const result = await doctor.updateOne(
      { doctorEmail: doctorEmail, "clinic._id": clinicId },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      throw "Clinic not found or no changes made";
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: "Clinic updated successfully",
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const getField = async (req, res) => {
  try {
    const { field } = req.body; // Extract field from the request body
    const doctors = await doctor.find({ field: field });
    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: doctors,
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

export default {
  register,
  login,
  forgetPassword,
  resetPassword,
  verifyOtp,
  getAllDoctors,
  deleteDoctor,
  deleteClinic,
  updateDoctor,
  updateClinic,
  getField,
};
