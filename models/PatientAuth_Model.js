const mongoose = require ('mongoose')

const PatientSchema = mongoose.Schema({
    userName : String,
    userPhone : String,
    userEmail : String,
    userPassword : String,
    City : String,
    Area : String,
    Gender : { type : String , enum : ['Male' , 'Female']},
    userWeight : Number,
    userHeight : Number,
    DateofBirth : String,
    BooldType : String
})

const PatientModel = mongoose.model('PatientData',PatientSchema)

module.exports = PatientModel

