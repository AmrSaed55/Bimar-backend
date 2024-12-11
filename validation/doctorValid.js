const {body} = require('express-validator')
const Doctor = require('./../models/doctorModel');

const phoneValidator = (value) => {
  const regex = /^01[0-2,5]\d{1,8}$/;
  return regex.test(value);
};

const doctorValidation = () => {
  return [
    body('doctorName')
      .notEmpty()
      .withMessage('Doctor name is required'),

    body('doctorDateOfBirth')
      .notEmpty()
      .withMessage('Doctor date of birth is required'),

    body('doctorPhone')
      .notEmpty()
      .withMessage('Doctor phone is required')
      .custom(phoneValidator)
      .withMessage('Invalid phone number format'),

    body('doctorEmail')
      .notEmpty()
      .withMessage('Doctor email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .custom(async (email) => {
        const existingDoctor = await Doctor.findOne({ doctorEmail: email });
        if (existingDoctor) {
          throw new Error('Email is already in use by another doctor');
        }
      }),

    body('doctorPassword')
      .notEmpty()
      .withMessage('Doctor password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),

    body('nationalID')
      .notEmpty()
      .withMessage('National ID is required')
      .isLength({ min: 14, max: 14 })
      .withMessage('National ID must be exactly 14 digits')
      .custom(async (id) => {
        const existingDoctor = await Doctor.findOne({ nationalID: id });
        if (existingDoctor) {
          throw new Error('National ID is already in use by another doctor');
        }
      }),

    body('Gender')
      .notEmpty()
      .withMessage('Gender is required')
      .isIn(['Male', 'Female'])
      .withMessage('Gender must be Male or Female'),

    body('field')
      .notEmpty()
      .withMessage('Specialty field is required')
      .isIn([
        'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'Hematology',
        'Immunology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Pulmonology',
        'Radiology', 'Rheumatology', 'Urology', 'Anesthesiology', 'Emergency Medicine', 'Family Medicine',
        'General Surgery', 'Infectious Disease', 'Nephrology', 'Obstetrics and Gynecology', 'Ophthalmology',
        'Otolaryngology', 'Pathology', 'Physical Medicine and Rehabilitation', 'Plastic Surgery', 'Psychiatry',
        'Public Health', 'Sports Medicine', 'Thoracic Surgery', 'Vascular Surgery', 'Geriatrics', 'Palliative Care',
        'Medical Genetics', 'Neonatology', 'Nuclear Medicine', 'Pain Management', 'Dentistry', 'Orthodontics',
        'Prosthodontics', 'Endodontics', 'Periodontics', 'Oral and Maxillofacial Surgery',
      ])
      .withMessage('Invalid specialty field'),

    body('syndicateCard')
      .notEmpty()
      .withMessage('Syndicate card is required'),

    body('certificates')
      .notEmpty()
      .withMessage('Certificates are required'),

    body('clinc')
      .isArray()
      .withMessage('Clinic information must be an array')
      .custom((value) => {
        // You can also add validation for the clinc array fields here
        if (value.length === 0) {
          throw new Error('At least one clinic must be provided');
        }
        return true;
      }),
  ];
};

module.exports = doctorValidation;