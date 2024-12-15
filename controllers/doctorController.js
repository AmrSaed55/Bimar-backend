// Required Modules
const doctor = require("./../models/doctorModel");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const responseMsgs = require("./../utilities/responseMsgs");
const errorHandler = require("./../utilities/errorHandler");
const nodemailer = require("nodemailer");



// Register Function
const register = async (req, res) => {
  try {
    let newDoctorData = req.body;
    let validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      throw validationError;
    }

    let hashedPassword = await bcrypt.hash(newDoctorData.doctorPassword, 6);
    let addDoctor = await doctor.create({
      ...newDoctorData,
      doctorPassword: hashedPassword,
    });

    res.status(201).json({
      status: responseMsgs.SUCCESS,
      data: "SignUp Successfully",
    });
  } catch (er) {
    console.log(er);
    errorHandler(res, er);
  }
};

// Login Function
const login = async (req, res) => {
  try {
    let credentials = req.body;
    let getDoctor = await doctor.findOne({ doctorEmail: credentials.doctorEmail });
    if (!getDoctor) {
      throw "User Not Found";
    }

    let checkPassword = await bcrypt.compare(
      credentials.doctorPassword,
      getDoctor.doctorPassword
    );
    if (!checkPassword) {
      throw "Wrong Password";
    }

    const doctorData = {
      doctorName: getDoctor.doctorName,
      doctorPhone: getDoctor.doctorPhone,
      doctorEmail: getDoctor.doctorEmail,
      Gender: getDoctor.Gender,
      field: getDoctor.field,
    };

    let token = jwt.sign({ email: credentials.doctorEmail }, process.env.jwtKey);
    res.status(200).cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    }).json({
      status: responseMsgs.SUCCESS,
      data: "Logged In Successfully",
      doctor: doctorData,
    });
  } catch (er) {
    console.log(er);
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

    const token = jwt.sign({ email: doctorEmail }, process.env.jwtKey, {
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
      </div>`
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
      decoded = jwt.verify(token, process.env.jwtKey);
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

    res.status(200).json(
      update
        ? { data: "Password updated" }
        : { data: "Password update failed" }
    );
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

module.exports = {
  register,
  login,
  forgetPassword,
  resetPassword,
  verifyOtp,
};