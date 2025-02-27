import express from "express";
import mongoose from "mongoose";
import Appointments from "../models/AppointmentsModel.js";

const getAnalytics = async (doctorId, startDate = null, endDate = null) => {
  const matchStage = { doctorId: new mongoose.Types.ObjectId(doctorId) };
  if (startDate && endDate) {
    matchStage.appointmentDate = { $gte: startDate, $lte: endDate };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "doctors",
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: "$doctor" },
    { $unwind: "$doctor.clinic" },
    {
      $match: {
        $expr: { $eq: ["$doctor.clinic._id", "$clinicId"] },
      },
    },
    {
      $group: {
        _id: null,
        totalPatients: { $sum: 1 },
        totalMoney: { $sum: "$doctor.clinic.Price" },
      },
    },
  ];

  const result = await Appointments.aggregate(pipeline);
  console.log(result); // Debug: log the result
  return result[0] || { totalPatients: 0, totalMoney: 0 };
};

const getDailyAnalytics = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const analytics = await getAnalytics(doctorId, startOfDay, endOfDay);
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const getWeeklyAnalytics = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const today = new Date();

    // Clone the current date before modifying
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);

    console.log(`Weekly Range: ${firstDayOfWeek} - ${lastDayOfWeek}`); // Debugging

    const analytics = await getAnalytics(
      doctorId,
      firstDayOfWeek,
      lastDayOfWeek
    );
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const getMonthlyAnalytics = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    const analytics = await getAnalytics(
      doctorId,
      firstDayOfMonth,
      lastDayOfMonth
    );
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const getYearlyAnalytics = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const analytics = await getAnalytics(
      doctorId,
      firstDayOfYear,
      lastDayOfYear
    );
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const getTotalAnalytics = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const analytics = await getAnalytics(doctorId);
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

export default {
  getDailyAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getYearlyAnalytics,
  getTotalAnalytics,
};
