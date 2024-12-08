const express = require("express");
const app = express();

const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const cookieParse = require('cookie-parser')


const patients = require("./Routes/patient");
const doctors = require("./Routes/doctor");
const labs = require("./Routes/labs");
const clinc = require("./Routes/clinc");
const chats = require("./Routes/chat");
const doctorAuth = require("./Routes/doctorAuth");
const patientAuth = require("./Routes/PatientAuth");
const appointments = require("./Routes/appointment");
const patientsAuth = require("./Routes/PatientAuth");
const medicalRecordRoutes = require('./Routes/medicalRecordRoutes');
// const chatBot = require('./Routes/chatBot');
// const rating = require('./Routes/rate');


mongoose.connect(process.env.DB).then(()=>{
  console.log('DB Connected')
})

app.listen(process.env.port, () => {
  console.log(`Listening on port ${process.env.port}`);
});


app.use(express.json())
app.use(cookieParse())
app.use('/patientsAuth',patientAuth)
app.use('/medical-records',medicalRecordRoutes)