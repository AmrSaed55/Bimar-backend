const mongoose = require("mongoose");


const DoctorSchema = mongoose.Schema({
  doctorName: String,
  doctorDateOfBirth: String,
  doctorPhone: String,
  doctorEmail: String,
  doctorPassword: String,
  nationalID: String,
  Gender: { type: String, enum: ["Male", "Female"] },
  field: {
    type: String,
    enum: [
      "Cardiology", // طب القلب
      "Dermatology", // طب الجلد
      "Endocrinology", // طب الغدد الصماء
      "Gastroenterology", // طب الجهاز الهضمي
      "Hematology", // طب الدم
      "Immunology", // علم المناعة
      "Neurology", // طب الأعصاب
      "Oncology", // علم الأورام
      "Orthopedics", // طب العظام
      "Pediatrics", // طب الأطفال
      "Pulmonology", // طب الرئة
      "Radiology", // علم الأشعة
      "Rheumatology", // طب الروماتيزم
      "Urology", // طب المسالك البولية
      "Anesthesiology", // طب التخدير
      "Emergency Medicine", // طب الطوارئ
      "Family Medicine", // طب الأسرة
      "General Surgery", // الجراحة العامة
      "Infectious Disease", // الأمراض المعدية
      "Nephrology", // طب الكلى
      "Obstetrics and Gynecology", // طب النساء والتوليد
      "Ophthalmology", // طب العيون
      "Otolaryngology", // طب الأذن والأنف والحنجرة
      "Pathology", // علم الأمراض
      "Physical Medicine and Rehabilitation", // الطب الطبيعي وإعادة التأهيل
      "Plastic Surgery", // جراحة التجميل
      "Psychiatry", // الطب النفسي
      "Public Health", // الصحة العامة
      "Sports Medicine", // طب الرياضة
      "Thoracic Surgery", // جراحة الصدر
      "Vascular Surgery", // جراحة الأوعية الدموية
      "Geriatrics", // طب الشيخوخة
      "Palliative Care", // الرعاية التلطيفية
      "Medical Genetics", // علم الوراثة الطبية
      "Neonatology", // طب حديثي الولادة
      "Nuclear Medicine", // الطب النووي
      "Pain Management", // إدارة الألم
      "Dentistry", // طب الأسنان
      "Orthodontics", // تقويم الأسنان
      "Prosthodontics", // تعويضات الأسنان
      "Endodontics", // علاج جذور الأسنان
      "Periodontics", // طب اللثة
      "Oral and Maxillofacial Surgery", // جراحة الفم والوجه والفكين
    ],
    yearsOfExprience: String,
    syndicateCard: String, //كارنيه النقابة
    certificates: String,
  },
  clinc: [
    {
      clincCity: String,
      clincArea: String,
      clincAddress: String,
      clincPhone: [String],
      clincEmail: String,
      clincWebsite: String,
      clincOpeningHours: [String],
      clincWorkDays: [String],
      clincLocationLinks: String,
    },
  ],
});

const doctor = mongoose.model('doctor', DoctorSchema);

module.exports = doctor;