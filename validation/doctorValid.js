import { body } from "express-validator";
import Doctor from "./../models/doctorModel.js";

const phoneValidator = (value) => {
  const regex = /^01[0-2,5]\d{8}$/;
  return regex.test(value);
};

const doctorValidation = () => {
  return [
    body("doctorName").isString().withMessage("Doctor name must be a string"),
    body("doctorDateOfBirth").isString().withMessage("Doctor date of birth must be a string"),
    body("doctorPhone")
      .isString()
      .withMessage("Doctor phone must be a string")
      .custom(phoneValidator)
      .withMessage("Invalid phone number format"),
    body("doctorEmail")
      .isEmail()
      .withMessage("Invalid email format")
      .custom(async (email) => {
        const existingDoctor = await Doctor.findOne({ doctorEmail: email });
        if (existingDoctor) {
          throw new Error("Email is already in use by another doctor");
        }
      }),
    body("doctorPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain at least one special character"),
    body("nationalID")
      .isLength({ min: 14, max: 14 })
      .withMessage("National ID must be exactly 14 digits")
      .custom(async (id) => {
        const existingDoctor = await Doctor.findOne({ nationalID: id });
        if (existingDoctor) {
          throw new Error("National ID is already in use by another doctor");
        }
      }),
    body("Gender")
      .isIn(["Male", "Female"])
      .withMessage("Gender must be Male or Female"),
    body("field")
      .isIn([
        "Cardiology",
        "Dermatology",
        "Endocrinology",
        "Gastroenterology",
        "Hematology",
        "Immunology",
        "Neurology",
        "Oncology",
        "Orthopedics",
        "Pediatrics",
        "Pulmonology",
        "Radiology",
        "Rheumatology",
        "Urology",
        "Anesthesiology",
        "Emergency Medicine",
        "Family Medicine",
        "General Surgery",
        "Infectious Disease",
        "Nephrology",
        "Obstetrics and Gynecology",
        "Ophthalmology",
        "Otolaryngology",
        "Pathology",
        "Physical Medicine and Rehabilitation",
        "Plastic Surgery",
        "Psychiatry",
        "Public Health",
        "Sports Medicine",
        "Thoracic Surgery",
        "Vascular Surgery",
        "Geriatrics",
        "Palliative Care",
        "Medical Genetics",
        "Neonatology",
        "Nuclear Medicine",
        "Pain Management",
        "Dentistry",
        "Orthodontics",
        "Prosthodontics",
        "Endodontics",
        "Periodontics",
        "Oral and Maxillofacial Surgery",
      ])
      .withMessage("Invalid specialty field"),

    body("clinic")
      .isArray()
      .withMessage("Clinic information must be an array")
      .custom((value) => {
        if (value.length === 0) {
          throw new Error("At least one clinic must be provided");
        }
        return true;
      }),
    body("clinic.*.clinicCity")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Clinic city is required"),
    body("clinic.*.clinicArea")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Clinic area is required"),
    body("clinic.*.clinicAddress")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Clinic address is required"),
    body("clinic.*.clinicPhone")
      .isArray()
      .withMessage("Clinic phone numbers must be an array")
      .custom((phones) => {
        phones.forEach(phoneValidator);
        return true;
      })
      .withMessage("Invalid phone number format"),
    body("clinic.*.clinicEmail")
      .isEmail()
      .withMessage("Please enter a valid email address"),
    body("clinic.*.clinicWebsite")
      .isURL()
      .withMessage("Please enter a valid website URL"),
    body("clinic.*.clinicWorkDays")
      .isArray()
      .withMessage("Clinic work days must be an array")
      .custom((days) => {
        if (days.length === 0) {
          throw new Error("At least one work day must be provided");
        }
        return true;
      }),
    body("clinic.*.clinicWorkDays.*.day")
      .isString()
      .isIn([
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ])
      .withMessage("Invalid day of the week"),
    body("clinic.*.clinicWorkDays.*.workingHours")
      .isArray()
      .withMessage("Working hours must be an array"),
    body("clinic.*.clinicWorkDays.*.examinationDuration")
      .isInt({ min: 1 })
      .withMessage("Examination duration must be a positive integer"),
    body("clinic.*.clinicLocationLinks")
      .isURL()
      .withMessage("Please enter a valid location link URL"),
    body("clinic.*.Price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
  ];
};

export default doctorValidation;
