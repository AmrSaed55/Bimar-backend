const {body} = require('express-validator')
const User = require('./../models/PatientAuth_Model')


const userValidation = ()=>{
    return[
        body('userName').notEmpty().withMessage('Name cant be Empty'),
        body('userPassword').notEmpty().withMessage('Password cant be Empty'),
        body('userEmail').notEmpty().withMessage('Email cant be Empty')
        .isEmail().withMessage('Email Formate is invalide')
        .custom(async(data)=>{
            let checkUser = await User.findOne({userEmail : data})
            if(checkUser){
                throw('User Already Exists')
            }
        }),

        body('userPhone').notEmpty().withMessage('Phone cant be Empty')
        .isMobilePhone().withMessage('Phone Formate invalid')
        .custom(async(data)=>{
            let checkUser = await User.findOne({userPhone : data})
            if(checkUser){
                throw('Phone Already Exists')
            }
        }),
        body('City').notEmpty().withMessage('City cant be Empty'),
        body('Gender').notEmpty().withMessage('Gender cant be Empty'),
        body('Area').notEmpty().withMessage('Area cant be Empty'),
        body('userWeight').notEmpty().withMessage('Weight cant be Empty'),
        body('userHeight').notEmpty().withMessage('Height cant be Empty'),
        body('DateofBirth').notEmpty().withMessage('DateofBirth cant be Empty'),
        body('BooldType').notEmpty().withMessage('BooldType cant be Empty')
    ]
};
const medicalRecordValidation = () => {
    return [
        body('allgeric').isArray().withMessage('Allergic field must be an array'),
        body('chronicMedications').isArray().withMessage('Chronic Medications field must be an array'),
        body('surgeries').isArray().withMessage('Surgeries field must be an array'),
        body('chronicDiseases').isArray().withMessage('Chronic Diseases field must be an array'),
        body('immunizations').isArray().withMessage('Immunizations field must be an array'),
        body('vaccinations').isArray().withMessage('Vaccinations field must be an array'),
        body('bloodType')
            .notEmpty().withMessage('Blood Type cannot be empty')
            .isIn(["AB+", "A+", "B+", "O+", "AB-", "A-", "B-", "O-"])
            .withMessage('Invalid blood type'),
        body('familyHistory.genatics').isArray().withMessage('Family history genetics must be an array'),
        body('familyHistory.genaticsDiseases').isArray().withMessage('Family history genetic diseases must be an array'),
        body('doctorName').notEmpty().withMessage('Doctor Name Can\'t Be Empty'),
        body('doctorPhone').notEmpty().withMessage('Doctor Phone Can\'t Be Empty').isMobilePhone().withMessage('Mobile Formate Wrong'),
        body('diagnosis').notEmpty().withMessage('Diagnosis Can\'t Be Empty'),
        body('treatmentPlan').notEmpty().withMessage('TreatmentPlan Can\'t Be Empty'),
        body('prescriptionInstruction.medication').notEmpty().withMessage('Medication Can\'t Be Empty'),
        body('prescriptionInstruction.dosage').notEmpty().withMessage('Dosage Can\'t Be Empty'),
        body('prescriptionInstruction.frequency').notEmpty().withMessage('Frequency Can\'t Be Empty'),
        body('prescriptionInstruction.duration').notEmpty().withMessage('Duration Can\'t Be Empty'),
        body('consultations.consultationDate').notEmpty().withMessage('Consultation Date Can\'t Be Empty'),
        
    ];
};

const DiagnosisValidation = () => {
    return [
        body('doctorName').notEmpty().withMessage('Doctor Name Can\'t Be Empty'),
        body('doctorPhone').notEmpty().withMessage('Doctor Phone Can\'t Be Empty').isMobilePhone().withMessage('Mobile Formate Wrong'),
        body('diagnosis').notEmpty().withMessage('Diagnosis Can\'t Be Empty'),
        body('treatmentPlan').notEmpty().withMessage('TreatmentPlan Can\'t Be Empty'),
        body('prescriptionInstruction.medication').notEmpty().withMessage('Medication Can\'t Be Empty'),
        body('prescriptionInstruction.dosage').notEmpty().withMessage('Dosage Can\'t Be Empty'),
        body('prescriptionInstruction.frequency').notEmpty().withMessage('Frequency Can\'t Be Empty'),
        body('prescriptionInstruction.duration').notEmpty().withMessage('Duration Can\'t Be Empty'),
        body('consultations.consultationDate').notEmpty().withMessage('Consultation Date Can\'t Be Empty'),
        
    ];
};

module.exports = {userValidation,medicalRecordValidation};
