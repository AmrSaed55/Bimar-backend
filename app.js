const express = require("express");
const app = express();
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const cookieParse = require('cookie-parser')
const helmet = require('helmet')
const path = require('node:path')
const Cors = require('cors')


const patientAuth = require("./Routes/PatientAuth");
const medicalRecordRoutes = require('./Routes/medicalRecordRoutes');
const doctorRoutes = require('./Routes/doctorRoute');


const errorMW = require('./middlewares/errorMw');
const diagnosisRoute = require('./Routes/diagnosisRoute');
// const chatBot = require('./Routes/chatBot');
// const rating = require('./Routes/rate');

//load environment variables for debugging 
console.log(process.env);

mongoose.connect(process.env.DB).then(()=>{
  console.log('DB Connected')
}).catch((err)=>{
  console.log(err);
})

app.use(Cors({
  origin : 'http://localhost:5173',
  credentials : true
}))

app.listen(process.env.port||3000, () => {
  console.log(`Listening on port ${process.env.port}`);
});



app.use(errorMW);
app.use(express.static(path.join(__dirname,'')))
app.use(express.json())
app.use(cookieParse())
app.use(helmet());
app.use('/patientsAuth',patientAuth)
app.use('/medical-records',medicalRecordRoutes)
app.use('/Diagnosis',diagnosisRoute)
app.use('/doctor',doctorRoutes)
