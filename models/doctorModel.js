import mongoose from "mongoose";

const DoctorSchema = mongoose.Schema({
  doctorName: { type: String, required: true },
  doctorDateOfBirth: { type: String, required: true },
  doctorPhone: { type: String, required: true },
  doctorEmail: { type: String, required: true, unique: true },
  doctorPassword: { type: String, required: true },
  nationalID: { type: String, required: true, unique: true },
  Gender: { type: String, enum: ["Male", "Female"], required: true },
  doctorImage: { type: String, default: null },
  field: {
    type: String,
    enum: [
      // Doctor Specialists
      "Allergist", // أخصائي الحساسية
      "Cardiologist", // أخصائي القلب
      "Dermatologist", // أخصائي الجلدية
      "Endocrinologist", // أخصائي الغدد الصماء
      "Gastroenterologist", // أخصائي الجهاز الهضمي
      "Gynecologist", // أخصائي النساء والتوليد
      "Hepatologist", // أخصائي الكبد
      "Internal Medicine", // الطب الباطني
      "Neurologist", // أخصائي الأعصاب
      "Otolaryngologist", // أخصائي الأنف والأذن والحنجرة
      "Pediatrician", // طبيب الأطفال
      "Phlebologist", // أخصائي الأوردة
      "Pulmonologist", // أخصائي الرئة
      "Rheumatologist", // أخصائي الروماتيزم
      "Physical Medicine and Rehabilitation", // الطب الطبيعي وإعادة التأهيل
      "Dentistry", // طب الأسنان
      "Psychiatry", // الطب النفسي
      "Plastic Surgery", // الجراحة التجميلية
    ],
    required: true,
  },
  yearsOfExprience: String,
  syndicateID: { type: String, required: true },
  syndicateCard: { type: String, required: true, default: null },
  certificates: [{ type: String, default: null }],
  clinic: [
    {
      clinicName: { 
        type: String, 
        default: function() {
            return this.parent().doctorName;
        }
    },
      clinicLicense: { type: String, default: null },
      clinicCity: { type: String, required: true },
      clinicArea: { type: String, required: true },
      clinicAddress: { type: String, required: true },
      clinicPhone: { type: [String], required: true },
      clinicEmail: { type: String, required: true },
      clinicWebsite: { type: String, required: true },
      clinicWorkDays: [
        {
          day: {
            type: String,
            enum: [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            required: true,
          },
          workingHours: { type: [String], required: true },
          NoBookings: { type: Number, required: true },
        },
      ],
      clinicLocationLinks: { type: String, required: true },
      Price: { type: Number, required: true },
    },
  ],
  ratings: {
    averageRating: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5 
    },
    totalRatings: { 
      type: Number, 
      default: 0 
    },
  },
});

const Doctor = mongoose.model("Doctor", DoctorSchema);

export default Doctor;
