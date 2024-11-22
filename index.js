const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const session = require('express-session');
const path = require('path');

const app = express();

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((error) => {
    if (error) {
        console.error('Error connecting to the database: ', error);
        return;
    }
    console.log('Connected to the database');
});

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));


// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//Public folder
app.use(express.static(path.join(__dirname,  'public')));


// Routes
app.get('/', (req, res) => {
  try {
    res.status(200).sendFile(path.join(__dirname, 'front_end', 'landing_page.html'));
} catch (error) {
    console.error('Error serving landing page:', error);
    res.status(500).json({
        success: false,
        message: 'Error loading landing page'
    });
}
});

app.get('/doctor/signup', (req, res) => {
  try {
    res.status(200).sendFile(path.join(__dirname, 'front_end', 'doctor_signUp.html'));
} catch (error) {
    console.error('Error serving sign up page for doctors:', error);
    res.status(500).json({
        success: false,
        message: 'Error loading sign up page for doctors'
    });
}
});

app.get('/patient/register', (req, res) => {
  try {
    res.status(200).sendFile(path.join(__dirname, 'front_end', 'sign_up.html'));
} catch (error) {
    console.error('Error serving registration page:', error);
    res.status(500).json({
        success: false,
        message: 'Error loading registration page'
    });
}
});

app.get('/patient/login', (req, res) => {
    try {
        res.status(200).sendFile(path.join(__dirname, 'front_end', 'login.html'));
    } catch (error) {
        console.error('Error serving login page:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading login page'
        });
    }
});


//Receive data from the form
app.post('/register', async (req, res) => {
  const { fname, lname, email, gender, date, password } = req.body;

// Validate form data
if (!fname || !lname || !date || !email || !password || !gender) {
      return res.status(400).json({
          success: false,
          message: 'All fields are required'
      });
  }

  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // First create user record
      const createUserQuery = `INSERT INTO users (email_address, password_encrypted) VALUES (?, ?)`;
      db.query(createUserQuery, [email, hashedPassword], (error, userResults) => {
          if (error) {
              console.error('Error creating user:', error);
              return res.status(500).json({
                  success: false,
                  message: 'Registration failed'
              });
          }

          // Then create patient record with user_id
          const createPatientQuery = `
              INSERT INTO patients (
                  first_name, 
                  last_name, 
                  date_of_birth, 
                  email_address,
                  password_encrypted,
                  gender,
                  user_id
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          const patientValues = [fname, lname, date, email, hashedPassword, gender, userResults.insertId];
          
          db.query(createPatientQuery, patientValues, (error, patientResults) => {
              if (error) {
                  console.error('Error creating patient:', error);
                  return res.status(500).json({
                      success: false,
                      message: 'Registration failed'
                  });
              }

              // Create session
              req.session.userId = userResults.insertId;
              req.session.patientId = patientResults.insertId;
              req.session.role = 'patient';

              // Send success response
              res.status(201).json({
                  success: true,
                  message: 'Registration successful',
                  redirect: '/patient/dashboard',
                  data: {
                      patientId: patientResults.insertId,
                      name: `${fname} ${lname}`
                  }
              });
          });
      });
  } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
          success: false,
          message: 'Registration failed'
      });
  }
});

const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});