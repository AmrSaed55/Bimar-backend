const express = require("express");
const app = express();
// const { MongoClient, ServerApiVersion } = require('mongodb');
const PORT = process.env.PORT || 3000;
const uri = "mongodb+srv://Bimar:Bimar123@bimarcluster.2kvr9.mongodb.net/";
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
// const chatBot = require('./Routes/chatBot');
// const rating = require('./Routes/rate');


mongoose.connect(process.env.DB).then(()=>{
  console.log('DB Connected')
})

app.listen(process.env.port, () => {
  console.log(`Listening on port ${PORT}`);
});


app.use(express.json())
app.use(cookieParse())
app.use('/patientsAuth',patientAuth)