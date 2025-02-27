import mongoose from "mongoose";

const AppointmentsSchema = mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientModel",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true,
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentStartTime: {
    type: Date,
    required: true,
  },
  appointmentEndTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending",
  },
  bookingType: {
    type: String,
    enum: ["follow-up", "first-Visit"],
  },
  notes: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending",
  },
  Price: {
    type: Number,
    required: true,
  },
});

AppointmentsSchema.index({
  appointmentStartTime: 1,
  appointmentEndTime: 1,
  appointmentDate: 1,
});

const Appointments = mongoose.model("Appointments", AppointmentsSchema);
export default Appointments;
