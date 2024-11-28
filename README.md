# MyHealthCare - Telemedicine Platform

## Overview
MyHealthCare is a comprehensive telemedicine platform enabling virtual healthcare consultations, appointment scheduling, and medical record management. The platform connects patients with healthcare providers through a secure web interface.

## Features
- User Authentication (Patients & Doctors)
- Appointment Scheduling System
- Virtual Consultations
- Medical Records Management
- Responsive Dashboard Interfaces
- Session Management
- Role-based Access Control

## Tech Stack
- **Frontend**: HTML5, CSS3, Bootstrap 5
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Template Engine**: EJS
- **Authentication**: JWT, bcrypt
- **Session Management**: express-session, express-mysql-session
- **Other Tools**: Font Awesome, Visual Studio Code

## Prerequisites
- Node.js (v14+)
- MySQL (v8+)
- npm/yarn package manager

## Installation

1. Clone the repository
```bash
git clone https://github.com/Ruks-7/Telemedicine_Application.git

2.Install dependencies
```bash
npm install
```
3. Create a `.env` file in the root directory and add the following environment-specific variables
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=myhealthcare
SESSION_SECRET=secret

## Project Structure
telemedicine-application/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── patientController.js
│   │   └── doctorController.js
│   ├── routes/
│   │   └── auth.js
|   └──databaseSchema
├── front_end/
│   ├── css/
│   └──js/ 
├── public/
├── views/
├── index.js
└── package.json

## Features

# Patient Features
- User Authentication
- Appointment Scheduling System
- Medical history access
- Profile management
- Consultation scheduling


# Doctor Features
- User Authentication
- Appointment Scheduling System
- Patient records access
- Medical Records Management
- Consultation scheduling





