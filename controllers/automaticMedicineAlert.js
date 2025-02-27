import admin from "../services/firebaseAdmin.js";
import cron from "node-cron";
import moment from "moment";
import PatientModel from "../models/PatientAuth_Model.js";

const scheduledJobs = new Map(); // Track scheduled jobs to prevent duplicates

// Function to send push notifications
const sendPushNotification = async (fcmToken, medication, dosage) => {
  if (!fcmToken) return

  const message = {
    notification: {
      title: "🔔 Medication Reminder",
      body: `💊 Time to take ${medication} (${dosage})`,
    },
    token: fcmToken,
  }  

  try {
    const response = await admin.messaging().send(message)
    console.log(`Notification sent: ${medication} - ${response}`)
  } catch (error) {
    console.error(`Error sending notification for ${medication}:`, error.message)
  }
}

// Function to schedule medication reminders
const scheduleReminders = async () => {
  try {
    // console.log("Checking for medication reminders...")

    const patients = await PatientModel.find({ "Diagnosis.prescription.prescriptionStatus": "Issued" })

    // console.log(`Found ${patients.length} patients with issued prescriptions.`)

    patients.forEach((patient) => {
      try {
        // console.log(`Patient: ${patient.userName}, FCM Token: ${patient.fcmToken ? "Exists" : "Missing"}`)

        if (!patient.fcmToken) return

        patient.Diagnosis.forEach((diagnosis) => {
          try {
            const prescription = diagnosis.prescription
            if (!prescription || !prescription.prescriptionInstruction) {
              console.log(`No prescription instructions found for ${patient.userName}`)
              return
            }

            prescription.prescriptionInstruction.forEach((instruction) => {
              try {
                const medication = instruction.medication
                const dosage = instruction.dosage
                const frequency = instruction.frequency
                const startDate = moment(prescription.prescriptionDate)
                const endDate = startDate.clone().add(instruction.duration, "weeks").endOf("day")

                if (!medication || !frequency || !dosage || !endDate) {
                  console.log("Skipping due to missing data.")
                  return
                }

                // console.log(`Prescription Date: ${startDate.format("YYYY-MM-DD")}`)
                // console.log(`Calculated End Date: ${endDate.format("YYYY-MM-DD HH:mm:ss")}`)
                // console.log(`Current Date: ${moment().format("YYYY-MM-DD HH:mm:ss")}`)
                // console.log("Is today before end date?", moment().isBefore(endDate))

                if (moment().isBefore(endDate)) {
                //   console.log(`Scheduling reminder for ${patient.userName}`)
                  schedulePushNotification(patient.userName, patient.fcmToken, medication, dosage, frequency, endDate)
                } else {
                  console.log(`Medication ${medication} expired, skipping...`)
                }
              } catch (error) {
                console.error(`Error processing prescription instruction: ${error.message}`)
              }
            })
          } catch (error) {
            console.error(`Error processing diagnosis for ${patient.userName}: ${error.message}`)
          }
        })
      } catch (error) {
        console.error(`Error processing patient ${patient.userName}: ${error.message}`)
      }
    })
  } catch (error) {
    console.error("Error fetching patients from database:", error.message)
  }
}

// Function to schedule push notifications
const schedulePushNotification = (patientName, fcmToken, medication, dosage, frequency, endDate) => {
    try {
      const jobKey = `${patientName}-${medication}`
  
      // Check if a job for this patient & medication already exists
      if (scheduledJobs.has(jobKey)) {
        console.log(`Skipping duplicate cron job for ${jobKey}`)
        return
      }
  
      //Mark this job as scheduled
      scheduledJobs.set(jobKey, true)
  
    //   console.log(`Scheduling ${medication} reminders (${frequency} times per day) for ${patientName}...`)
  
      const interval = Math.floor(24 / frequency)
  
      for (let i = 0; i < frequency; i++) {
        const reminderTime = moment().startOf("day").add(i * interval, "hours")
        const cronExpression = `${reminderTime.minutes()} ${reminderTime.hours()} * * *`
  
        // console.log(`Setting cron job for ${medication} at ${reminderTime.format("HH:mm")} (Cron: ${cronExpression})`)
  
        const job = cron.schedule(cronExpression, async () => {
          try {
            if (moment().isAfter(endDate)) {
              console.warn(`Skipping expired medication ${medication}`)
              return
            }
  
            console.log(`Sending reminder for ${medication} at ${reminderTime.format("HH:mm")}`)
            await sendPushNotification(fcmToken, medication, dosage)
  
            if (moment().isSame(endDate, "day") && i === frequency - 1) {
              console.log(`Sending final congratulatory notification for ${medication}`)
              await sendPushNotification(fcmToken, "Congratulations!", `You've completed your ${medication} course!`)
            }
          } catch (error) {
            console.error(`Error in cron job for ${medication}: ${error.message}`)
          }
        })
  
        // Store the job reference to allow cancellation if needed
        scheduledJobs.set(jobKey, job)
      }
    } catch (error) {
      console.error(`Error scheduling notifications for ${patientName}: ${error.message}`)
    }
  }
  

// Schedule reminders to run every midnight
cron.schedule("0 0 * * *", scheduleReminders)

export { scheduleReminders };
