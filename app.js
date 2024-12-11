const express = require("express");
const app = express();

const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const cookieParse = require('cookie-parser');
//for executing the webhook
const exec = require('child_process');

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

//load environment variables for debugging 
console.log(process.env);

mongoose.connect(process.env.DB).then(()=>{
  console.log('DB Connected')
})

// for applying automatic pull after each push
app.post('/webhook', (req, res) => {
  console.log('Webhook received!');
  exec('git -C C:\\Users\\Administrator\\Desktop\\Bimar\\Bimar-backend pull origin main', (err, stdout, stderr) => {
    if (err) {
      console.error('Error pulling from GitHub:', stderr);
      res.status(500).send('Error pulling from GitHub');
      return;
    }
    console.log('Git pull successful:', stdout);
    res.status(200).send('Git pull successful');
  });
});

app.listen(process.env.port||3000, () => {
  console.log(`Listening on port ${process.env.port}`);
});




app.use(express.json())
app.use(cookieParse())
app.use('/patientsAuth',patientAuth)
app.use('/medical-records',medicalRecordRoutes)


