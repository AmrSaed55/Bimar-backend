import AppRating from "../models/AppRatingModel.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/PatientAuth_Model.js";
import jwt from "jsonwebtoken";
import errorHandler from "../utilities/errorHandler.js";
import responseMsgs from "../utilities/responseMsgs.js";


const submitAppRating = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) throw "Token not found";

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId;

        // Check if user is doctor or patient
        const doctor = await Doctor.findById(userId);
        const patient = await Patient.findById(userId);
        
        if (!doctor && !patient) {
            throw "User not found";
        }

        const userModel = doctor ? 'Doctor' : 'PatientData';
        const { rating, comment } = req.body;

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw "Rating must be between 1 and 5";
        }

        // Check if user has already rated
        const existingRating = await AppRating.findOne({ userId });
        if (existingRating) {
            throw "You have already rated the application";
        }

        // Create new rating
        const newRating = await AppRating.create({
            userId,
            userModel,
            rating,
            comment
        });

        res.status(200).json({
            status: responseMsgs.SUCCESS,
            message: "Thank you for rating our application!",
            data: newRating
        });

    } catch (err) {
        console.log(err);
        errorHandler(res, err);
    }
};

const updateAppRating = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) throw "Token not found";

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId;

        const { rating, comment } = req.body;

        // Validate rating if provided
        if (rating && (rating < 1 || rating > 5)) {
            throw "Rating must be between 1 and 5";
        }

        // Find existing rating
        const existingRating = await AppRating.findOne({ userId });
        if (!existingRating) {
            throw "You haven't rated the application yet";
        }

        // Update rating
        const updatedRating = await AppRating.findOneAndUpdate(
            { userId },
            {
                ...(rating && { rating }),
                ...(comment && { comment }),
                updatedAt: new Date()
            },
            { new: true }
        );

        res.status(200).json({
            status: responseMsgs.SUCCESS,
            message: "Rating updated successfully",
            data: updatedRating
        });

    } catch (err) {
        console.log(err);
        errorHandler(res, err);
    }
};

const getAppRatings = async (req, res) => {
    try {
        // Get all ratings with user details
        const ratings = await AppRating.find()
            .populate({
                path: 'userId',
                select: 'doctorName userName profileImage doctorImage',
                refPath: 'userModel'
            })
            .sort({ createdAt: -1 });

        // Calculate statistics
        const totalRatings = ratings.length;
        const ratingDistribution = {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        };

        let totalScore = 0;
        ratings.forEach(rating => {
            ratingDistribution[rating.rating]++;
            totalScore += rating.rating;
        });

        const averageRating = totalRatings > 0 ? (totalScore / totalRatings).toFixed(1) : 0;

        // Calculate percentages
        const ratingPercentages = {};
        for (let i = 1; i <= 5; i++) {
            ratingPercentages[i] = totalRatings > 0 
                ? ((ratingDistribution[i] / totalRatings) * 100).toFixed(1)
                : 0;
        }

        // Separate doctor and patient ratings
        const doctorRatings = ratings.filter(r => r.userModel === 'Doctor');
        const patientRatings = ratings.filter(r => r.userModel === 'PatientData');

        res.status(200).json({
            status: responseMsgs.SUCCESS,
            data: {
                overview: {
                    totalRatings,
                    averageRating,
                    distribution: ratingDistribution,
                    percentages: ratingPercentages
                },
                userTypeStats: {
                    doctors: {
                        count: doctorRatings.length,
                        average: doctorRatings.length > 0 
                            ? (doctorRatings.reduce((acc, r) => acc + r.rating, 0) / doctorRatings.length).toFixed(1)
                            : 0
                    },
                    patients: {
                        count: patientRatings.length,
                        average: patientRatings.length > 0 
                            ? (patientRatings.reduce((acc, r) => acc + r.rating, 0) / patientRatings.length).toFixed(1)
                            : 0
                    }
                },
                ratings: ratings.map(rating => ({
                    id: rating._id,
                    rating: rating.rating,
                    comment: rating.comment,
                    userType: rating.userModel === 'Doctor' ? 'Doctor' : 'Patient',
                    user: {
                        id: rating.userId._id,
                        name: rating.userModel === 'Doctor' ? rating.userId.doctorName : rating.userId.userName,
                        image: rating.userModel === 'Doctor' ? rating.userId.doctorImage : rating.userId.profileImage
                    },
                    createdAt: rating.createdAt,
                    updatedAt: rating.updatedAt
                }))
            }
        });

    } catch (err) {
        console.log(err);
        errorHandler(res, err);
    }
};

const deleteAppRating = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) throw "Token not found";

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.userId;

        // Find and delete rating
        const deletedRating = await AppRating.findOneAndDelete({ userId });
        
        if (!deletedRating) {
            throw "Rating not found";
        }

        res.status(200).json({
            status: responseMsgs.SUCCESS,
            message: "Rating deleted successfully"
        });

    } catch (err) {
        console.log(err);
        errorHandler(res, err);
    }
};

export default {
    submitAppRating,
    updateAppRating,
    getAppRatings,
    deleteAppRating
};