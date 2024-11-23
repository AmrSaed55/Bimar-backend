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
        .isMobilePhone().withMessage('Phone Formate invalide')
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
}

module.exports = userValidation