import mongoose from "mongoose";

const AppointmentsSchema = mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PatientData",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  bookingNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed","cancelled"],
    default: "Pending",
  },
  Price: Number,
  bookingType: {
    type: String,
    default: "first-Visit",
    enum: ["follow-up", "first-Visit"],
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending",
  },
});

// Create a compound index for date and clinic to help with booking number queries
AppointmentsSchema.index({ appointmentDate: 1, clinicId: 1 });

const Appointments = mongoose.model("Appointments", AppointmentsSchema);
export default Appointments;
