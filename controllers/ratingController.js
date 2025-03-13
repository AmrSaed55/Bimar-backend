import Rating from "../models/RatingModel.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/PatientAuth_Model.js";
import Appointment from "../models/AppointmentsModel.js";
import jwt from "jsonwebtoken";
import errorHandler from "../utilities/errorHandler.js";
import responseMsgs from "../utilities/responseMsgs.js";

const submitRating = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) throw "Token not found";

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const patient = await Patient.findById(decoded.userId);
    if (!patient) throw "Patient not found";

    const { doctorId, rating, comment } = req.body;

    if (rating < 1 || rating > 5) throw "rating must be between 1 adn 5";

    const hasCompletedAppointment = await Appointment.findOne({
      doctorId,
      patientId: patient._id,
      status: "Completed",
    });

    if (!hasCompletedAppointment)
      throw "you must have at least one completed appointment with this doctor to rate him";

    const newRating = await Rating.create({
      doctorId,
      patientId: patient._id,
      rating,
      comment,
    });

    //update the doctor's average rating
    const doctor = await Doctor.findById(doctorId);
    const totalRatings = doctor.ratings.totalRatings + 1;
    const newAverageRating =
      (doctor.ratings.averageRating * doctor.ratings.totalRatings + rating) /
      totalRatings;

    await Doctor.findByIdAndUpdate(doctorId, {
      "ratings.averageRating": newAverageRating,
      "ratings.totalRatings": totalRatings,
    });

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      message: "Rating submitted successfully",
      data: newRating,
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const getDoctorRatings = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Get all ratings for the doctor with patient details
    const ratings = await Rating.find({ doctorId })
      .populate("patientId", "userName profileImage")
      .sort({ createdAt: -1 }); // Sort by newest first

    // Get doctor details
    const doctor = await Doctor.findById(doctorId).select(
      "ratings doctorName field"
    );

    if (!doctor) {
      throw "Doctor not found";
    }

    // Calculate rating distribution
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    // Calculate total ratings and rating distribution
    ratings.forEach((rating) => {
      ratingDistribution[rating.rating]++;
    });

    // Format ratings with required information
    const formattedRatings = ratings.map((rating) => ({
      id: rating._id,
      rating: rating.rating,
      comment: rating.comment,
      createdAt: rating.createdAt,
      patient: {
        id: rating.patientId._id,
        name: rating.patientId.userName,
        profileImage: rating.patientId.profileImage,
      },
    }));

    // Calculate percentages for each rating
    const totalRatings = ratings.length;
    const ratingPercentages = {};
    for (let i = 1; i <= 5; i++) {
      ratingPercentages[i] =
        totalRatings > 0
          ? ((ratingDistribution[i] / totalRatings) * 100).toFixed(1)
          : 0;
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.doctorName,
          field: doctor.field,
          averageRating: doctor.ratings.averageRating,
          totalRatings: doctor.ratings.totalRatings,
        },
        ratingStats: {
          distribution: ratingDistribution,
          percentages: ratingPercentages,
          totalRatings,
          averageRating: doctor.ratings.averageRating,
        },
        ratings: formattedRatings,
      },
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const updateRating = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) throw "Token not found";

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const patient = await Patient.findById(decoded.userId);
    if (!patient) throw "Patient not found";

    const { ratingId, rating, comment } = req.body;

    // Validate rating value
    if (rating && (rating < 1 || rating > 5)) {
      throw "Rating must be between 1 and 5";
    }

    // Find the existing rating
    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
      throw "Rating not found";
    }

    // Verify ownership
    if (existingRating.patientId.toString() !== patient._id.toString()) {
      throw "Unauthorized to update this rating";
    }

    // Store old rating value for average recalculation
    const oldRating = existingRating.rating;

    // Update rating
    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      {
        ...(rating && { rating }),
        ...(comment && { comment }),
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("patientId", "userName profileImage");

    // Update doctor's average rating if rating value changed
    if (rating && rating !== oldRating) {
      const doctor = await Doctor.findById(existingRating.doctorId);
      const totalRatings = doctor.ratings.totalRatings;
      const currentTotal = doctor.ratings.averageRating * totalRatings;
      const newTotal = currentTotal - oldRating + rating;
      const newAverage = newTotal / totalRatings;

      await Doctor.findByIdAndUpdate(existingRating.doctorId, {
        "ratings.averageRating": newAverage,
      });
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      message: "Rating updated successfully",
      data: updatedRating,
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const deleteRating = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) throw "Token not found";

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const patient = await Patient.findById(decoded.userId);
    if (!patient) throw "Patient not found";

    const { ratingId } = req.params;

    // Find the rating
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      throw "Rating not found";
    }

    // Verify ownership
    if (rating.patientId.toString() !== patient._id.toString()) {
      throw "Unauthorized to delete this rating";
    }

    // Get doctor before deleting rating
    const doctor = await Doctor.findById(rating.doctorId);
    if (!doctor) {
      throw "Doctor not found";
    }

    // Calculate new average rating
    const totalRatings = doctor.ratings.totalRatings - 1;
    let newAverage = 0;

    if (totalRatings > 0) {
      const currentTotal =
        doctor.ratings.averageRating * doctor.ratings.totalRatings;
      const newTotal = currentTotal - rating.rating;
      newAverage = newTotal / totalRatings;
    }

    // Delete the rating
    await Rating.findByIdAndDelete(ratingId);

    // Update doctor's rating statistics
    await Doctor.findByIdAndUpdate(rating.doctorId, {
      "ratings.averageRating": newAverage,
      "ratings.totalRatings": totalRatings,
    });

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      message: "Rating deleted successfully",
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

export default {
  submitRating,
  getDoctorRatings,
  updateRating,
  deleteRating,
};
