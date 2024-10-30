const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const patients = require("./Routes/patient");
const doctors = require("./Routes/doctor");
const labs = require("./Routes/labs");
const clinc = require("./Routes/clinc");
const chats = require("./Routes/chat");
const doctorAuth = require("./Routes/doctorAuth");
const patientAuth = require("./Routes/patientAuth");
const appointments = require("./Routes/appointment");
// const chatBot = require('./Routes/chatBot');
// const rating = require('./Routes/rate');

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
