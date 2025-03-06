import mongoose from "mongoose";

const RatingSchema = mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        require:true,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PatientData",
        require:true,
    },
    rating:{
        type:Number,
        required:true,
        min:1,
        max:5,
    },
    comment:{
        type:String,
        maxLength: 500,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
});

// Ensure a patient can only rate a doctor once
RatingSchema.index({doctorId: 1,patientId: 1}, {unique: true});

const Rating = mongoose.model("Rating",RatingSchema);
export default Rating;