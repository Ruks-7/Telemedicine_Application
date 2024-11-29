//The tables were created at the beginning of the project.
//If you experience "callback function errors", use try-catch blocks to handle the errors.
const express = require('express');
const db = require('./config/db');
const app = express();



//Create users table
app.get('/users', (req,res) => {
const users = 
    `CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email_address VARCHAR(100) UNIQUE NOT NULL,
        password_encrypted VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

        db.query(users, (error) => {
          if(error){
            console.log(`Error creating users table`, error);
          }
        
          res.status(201).send(`Users table created successfully!`);
      })
      
});

//Create patients table
app.get('/patients', (req,res) => {
const patients = 
    `CREATE TABLE IF NOT EXISTS patients (
        patient_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(10) NOT NULL,
        language VARCHAR(50),
        email_address VARCHAR(100) UNIQUE NOT NULL,
        phone_number VARCHAR(15) UNIQUE,
        password_encrypted VARCHAR(100) NOT NULL,
        blood_type VARCHAR(5),
        allergies TEXT,
        user_id INT,
        date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        )`;

        db.query(patients, (error) => {
          if(error){
            console.log(`Error creating patients table`, error);
          }
        
          res.status(201).send(`Patients table created successfully!`);
      })
      
});

//Create providers table
app.get('/providers', (req,res) => {
const providers = 
    `CREATE TABLE IF NOT EXISTS providers (
        provider_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        date_of_birth DATE NOT NULL,
        provider_specialty VARCHAR(50) NOT NULL,
        license_number VARCHAR(50) UNIQUE NOT NULL,
        available_days VARCHAR(100),
        phone_number VARCHAR(15) UNIQUE,
        email_address VARCHAR(100) UNIQUE NOT NULL,
        password_encrypted VARCHAR(100) NOT NULL,
        user_id INT,
        date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
)`;

  db.query(providers, (error) => {
    if(error){
      console.log(`Error creating providers table`, error);
    }

    res.status(201).send(`Providers table created successfully!`);
  })

});



//Create appointments table
app.get('/appointments', (req,res) => {
const appointments = 
    `CREATE TABLE IF NOT EXISTS appointments (
        appointment_id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        provider_id INT,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(50) NOT NULL,
        consultation_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
        FOREIGN KEY (provider_id) REFERENCES providers(provider_id)
)`;

  db.query(appointments, (error) => {
    if(error){
      console.log(`Error creating appointments table`, error);
    }

    res.status(201).send(`Appointments table created successfully!`);
  })

});


//Create medical_records table
app.get('/medical_records', (req,res) => {
const medical_records = 
    `CREATE TABLE IF NOT EXISTS medical_records (
        record_id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        provider_id INT,
        appointment_id INT,
        diagnosis TEXT,
        prescription TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
        FOREIGN KEY (provider_id) REFERENCES providers(provider_id),
        FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
)`;

  db.query(medical_records, (error) => {
    if(error){
      console.log(`Error creating medical_records table`, error);
    }

    res.status(201).send(`Medical Records table created successfully!`);
  })

}); 

//Add a new column (symptoms) to the  appointments table 
//Run this only once
app.get('/add-column', async (req, res) => {
  const addColumn = `ALTER TABLE appointments ADD COLUMN symptoms TEXT`;

  try {
      await db.query(addColumn);
      res.status(201).send('Column added successfully!');
  } catch (error) {
      console.error('Error adding column to appointments table:', error);
      res.status(500).send('Error adding column');
  }
});

//change the status column in the appointments table to default 'pending'
//Run this only once
app.get('/change-status', async (req, res) => {
  const changeStatus = `ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'pending'`;

  try {
      await db.query(changeStatus);
      res.status(201).send('Status column changed successfully!');
  } catch (error) {
      console.error('Error changing status column in appointments table:', error);
      res.status(500).send('Error changing status column');
  }
});

const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
