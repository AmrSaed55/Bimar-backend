import { body } from "express-validator";
import Doctor from "./../models/doctorModel.js";

const phoneValidator = (value) => {
  const regex = /^01[0-2,5]\d{1,8}$/;
  return regex.test(value);
};

const doctorValidation = () => {
  return [
    body("doctorName").notEmpty().withMessage("Doctor name is required"),
    body("doctorDateOfBirth")
      .notEmpty()
      .withMessage("Doctor date of birth is required"),
    body("doctorPhone")
      .notEmpty()
      .withMessage("Doctor phone is required")
      .custom(phoneValidator)
      .withMessage("Invalid phone number format"),
    body("doctorEmail")
      .notEmpty()
      .withMessage("Doctor email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .custom(async (email) => {
        const existingDoctor = await Doctor.findOne({ doctorEmail: email });
        if (existingDoctor) {
          throw new Error("Email is already in use by another doctor");
        }
      }),
    body("doctorPassword")
      .notEmpty()
      .withMessage("Doctor password is required")
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
      .notEmpty()
      .withMessage("National ID is required")
      .isLength({ min: 14, max: 14 })
      .withMessage("National ID must be exactly 14 digits")
      .custom(async (id) => {
        const existingDoctor = await Doctor.findOne({ nationalID: id });
        if (existingDoctor) {
          throw new Error("National ID is already in use by another doctor");
        }
      }),
    body("Gender")
      .notEmpty()
      .withMessage("Gender is required")
      .isIn(["Male", "Female"])
      .withMessage("Gender must be Male or Female"),
    body("field")
      .notEmpty()
      .withMessage("Specialty field is required")
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
    body("syndicateCard").notEmpty().withMessage("Syndicate card is required"),

    body("clinic")
      .isArray()
      .withMessage("Clinic information must be an array")
      .custom((value) => {
        if (value.length === 0) {
          throw new Error("At least one clinic must be provided");
        }
        return true;
      }),
    body("clinic.*.clincCity")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Clinic city is required"),
    body("clinic.*.clincArea")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Clinic area is required"),
    body("clinic.*.clincAddress")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Clinic address is required"),
    body("clinic.*.clincPhone")
      .isArray()
      .withMessage("Clinic phone numbers must be an array")
      .custom(phoneValidator),
    body("clinic.*.clincEmail")
      .isEmail()
      .withMessage("Please enter a valid email address"),
    body("clinic.*.clincWebsite")
      .isURL()
      .withMessage("Please enter a valid website URL"),
    body("clinic.*.clincOpeningHours")
      .isArray()
      .withMessage("Clinic opening hours must be an array")
      .custom((hours) => {
        if (hours.length === 0) {
          throw new Error("At least one opening hour must be provided");
        }
        return true;
      }),
    body("clinic.*.clincWorkDays")
      .isArray()
      .withMessage("Clinic work days must be an array")
      .custom((days) => {
        if (days.length === 0) {
          throw new Error("At least one work day must be provided");
        }
        return true;
      }),
    body("clinic.*.clincLocationLinks")
      .isURL()
      .withMessage("Please enter a valid location link URL"),
  ];
};

export default doctorValidation;