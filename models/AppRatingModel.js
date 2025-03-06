import mongoose from "mongoose";

const AppRatingSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        requird:true,
        refPath:'userModel',
    },
    userModel:{
        type:String,
        required:true,
        enum:['Doctor','PatientData'],
    },
    rating:{
        type:Number,
        required: true,
        main:1,
        max:5,
    },
    comment:{
        type:String,
        maxLength: 500,
    },
    createdAt:{
        type:Date,
        default: Date.now,
    },
    updateAt:{
        type:Date,
    },
});

AppRatingSchema.index({userId:1}, {unique:true});

const AppRating = mongoose.model("AppRating",AppRatingSchema);
export default AppRating;