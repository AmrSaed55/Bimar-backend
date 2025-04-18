# Bimar Medical System - Backend API

## Overview

This is the backend API for the Bimar Medical System, a comprehensive healthcare platform connecting doctors with patients. The backend serves both a web portal for doctors and a mobile application for patients, handling all data processing, authentication, business logic, and communication between systems.

## Features

- **Appointment Management**: Create, update, cancel appointments with booking number system
- **Booking System**: Sequential booking numbers per clinic per day with automatic adjustment
- **Doctor Management**: Multiple clinic support with configurable working hours and specialties
- **Patient Records**: Medical history and appointment tracking across providers
- **Follow-up System**: Doctors can schedule follow-ups for existing patients
- **Email Notifications**: Automated emails for appointment confirmations, updates, and cancellations
- **Authentication**: Secure JWT-based authentication for patients and doctors
- **Payment Tracking**: Track payment status for appointments

## Tech Stack

- **Framework**: Node.js & Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer with Gmail
- **Error Handling**: Custom error handler middleware
- **API Response Formatting**: Standardized response formats

## API Endpoints

### Authentication
- `POST /auth/login` - Login for both doctors and patients
- `POST /auth/register` - Register new users
- `GET /auth/verify` - Verify token

### Appointments
- `POST /bookings` - Create new appointment (patient)
- `POST /bookings/follow-up` - Schedule follow-up (doctor only)
- `GET /bookings` - View appointments (filtered based on user type)
- `PATCH /bookings` - Update appointment details
- `PATCH /bookings/cancel/:id` - Cancel appointment (changes status)
- `DELETE /bookings/delete/:id` - Delete appointment (doctor only)

### Doctors
- `GET /doctor/:id` - Get doctor profile
- `PATCH /doctor/:id` - Update doctor profile
- `GET /doctor/clinics` - Get doctor's clinics
- `POST /doctor/clinics` - Add new clinic
- `PATCH /doctor/clinics/:id` - Update clinic information

### Patients
- `GET /patient/:id` - Get patient profile
- `PATCH /patient/:id` - Update patient profile
- `GET /patient/history` - Get patient medical history

## Data Models

### Appointments Model
```javascript
{
  patientId: ObjectId (ref: "PatientData"),
  doctorId: ObjectId (ref: "Doctor"),
  clinicId: ObjectId (ref: "Doctor"),
  appointmentDate: Date,
  bookingNumber: Number,
  status: String (Pending, Completed, cancelled),
  bookingType: String (first-Visit, follow-up),
  paymentStatus: String (Pending, Paid),
  Price: Number
}
```

### Doctor Model
```javascript
{
  doctorName: String,
  doctorEmail: String,
  doctorPassword: String,
  doctorPhone: String,
  doctorLicense: String,
  field: String,
  doctorImage: String,
  clinic: [
    {
      clinicLicense: String,
      clinicCity: String,
      clinicArea: String,
      clinicAddress: String,
      clinicPhone: [String],
      clinicEmail: String,
      clinicWebsite: String,
      clinicWorkDays: [
        {
          day: String,
          workingHours: [String],
          NoBookings: Number
        }
      ],
      clinicLocationLinks: String,
      Price: Number
    }
  ],
  ratings: {
    averageRating: Number,
    totalRatings: Number
  }
}
```

### Patient Model
```javascript
{
  userName: String,
  userEmail: String,
  userPassword: String,
  userPhone: String,
  userGender: String,
  profileImage: String,
  userDOB: Date,
  medicalHistory: [
    {
      condition: String,
      since: Date,
      medications: [String]
    }
  ]
}
```

## Key Business Rules

1. Patients can only have one appointment per day
2. Doctors can only create follow-ups for patients they've seen before
3. Each clinic has a maximum number of bookings per day defined in clinicWorkDays
4. Booking numbers are sequential per clinic per day and adjust automatically on cancellation
5. Cancelled appointments change status rather than being deleted from the database
6. Only doctors can permanently delete appointments
7. Email notifications are sent for all appointment actions
8. Working hours are stored per day for each clinic

## Implementation Details

### Appointment Booking Process
1. Validate available slots based on clinic's daily limit (NoBookings)
2. Check patient doesn't have existing appointment that day
3. Assign next available booking number
4. Create appointment record
5. Send confirmation emails to both patient and doctor

### Appointment Cancellation Process
1. Update appointment status to "cancelled"
2. Decrease booking numbers for all appointments after the cancelled one
3. Send cancellation notification emails

### Appointment Update Process
1. If date changes, handle booking number updates for both old and new date
2. Ensure new date has available slots
3. Update appointment details
4. Send update notification emails

### Follow-up Appointment Validation
1. Verify requesting user is a doctor
2. Verify patient has previous completed appointment with doctor
3. Check for availability and conflicts
4. Create follow-up appointment with type "follow-up"

## Setup

1. Clone repository
   ```
   git clone https://github.com/your-org/bimar-backend.git
   cd bimar-backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set environment variables in `.env`:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_KEY=your_jwt_secret
   USER=your_email_for_notifications
   PASS=your_email_password
   EMAIL_PORT=587
   ```

4. Start server
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

## Project Structure

```
├── controllers/            # Request handlers
│   ├── authController.js   # Authentication logic
│   ├── bookingController.js # Appointment management
│   ├── doctorController.js # Doctor profile management
│   └── patientController.js # Patient profile management
│
├── models/                 # Database schemas
│   ├── AppointmentsModel.js # Appointment schema
│   ├── doctorModel.js      # Doctor schema
│   └── PatientAuth_Model.js # Patient schema
│
├── Routes/                 # API endpoints
│   ├── authRoutes.js       # Authentication routes
│   ├── bookingRoutes.js    # Appointment routes
│   ├── doctorRoutes.js     # Doctor routes
│   └── patientRoutes.js    # Patient routes
│
├── utilities/              # Helper functions
│   ├── errorHandler.js     # Error response utility
│   └── responseMsgs.js     # Standard response messages
│
├── app.js                  # Application entry point
├── .env                    # Environment variables (create this)
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Error Handling

The application uses a standardized error handling system:

```javascript
// Example from errorHandler.js
export default (res, error) => {
  res.status(400).json({
    status: "fail",
    message: error.toString(),
  });
};
```

## Authentication Flow

1. User registers or logs in
2. Server validates credentials
3. JWT token generated and set as cookie
4. Token verified on subsequent protected requests
5. Different routes accessible based on user type (doctor/patient)

## Security Notice

This repository does not include any real credentials or production secrets. All sensitive data such as JWT keys, database URIs, and email credentials should be stored securely in environment variables and never committed to the codebase.

If you discover any security vulnerabilities, please contact us privately at bimar.med24@gmail.com.

## Team 

Meet the talented developers behind WagBat:

### Abdulrhman Ahmed

- GitHub: [3bdalrahman](https://github.com/3bdalrahman)
- LinkedIn: [Abdulrhman Ahmed](https://www.linkedin.com/in/abdulrhman-ahmed03/)

### Sara Magdy

- GitHub: [](https://github.com/)
- LinkedIn: [](https://www.linkedin.com/in//)

### Amr Matarek

- GitHub: [Amr11matarek](https://github.com/Amr11matarek)
- LinkedIn: [Amr Matarek](https://www.linkedin.com/in/amr-matarek-72839b244)


## Development

### Adding New Features
1. Create/update schema in models/
2. Implement controller logic in controllers/
3. Create route endpoints in Routes/
4. Test API endpoints

### Testing
Manual testing using Postman or similar tools. Documented test cases available in the team's shared drive.

## Related Projects

- Bimar Web Portal (doctor interface)
- Bimar Mobile App (patient interface)

## Contact

Email: bimar.med24@gmail.com 
