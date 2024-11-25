//Patient registration and login controller
const bcrypt = require('bcrypt');
const db = require('../config/db');


//Register a new user
const registerUser = async (req, res) => {
    //fetch data
    const { fname, lname, email, gender, date, password } = req.body;
    console.log(req.body);
    try{
        //check if user exists
        const userQuery = 'SELECT * FROM users WHERE email_address = ?';
        const [userCheck] = await db.query(userQuery, [email] );
        console.log(userCheck);
        if(userCheck.length > 0){
            return res.status(400).json({ message: 'User already exists!'});
        }

        //Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user record
        const createUserQuery = `INSERT INTO users (email_address, password_encrypted) VALUES (?, ?)`;
        const  userResults = await db.query(createUserQuery, [email, hashedPassword]);

        // Create patient record with user_id
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

                await db.query(createPatientQuery, patientValues, (error, patientResults) => {
                if (error) {
                    console.error('Error creating patient:', error);
                    return res.status(500).send({
                        success: false,
                        message: 'Registration failed!'
                    });
                }
            

                // Create session
                req.session.userId = userResults.insertId;
                req.session.patientId = patientResults.insertId;
                req.session.role = 'patient';

        return res.status(201).json({ 
            message: 'User registered successfully!',
            redirect: '/dashboard'
            });
        });
    }
    catch(error) {
        console.log(error);
        return es.status(500).json({ message: 'An error occured!', error });
    }
};

//Login a user
const loginUser = async (req, res) => {
    //fetch data
    const { email, password } = req.body;
    console.log(req.body);

    try{
        //check if user exists
        const userQuery = 'SELECT * FROM users WHERE email_address = ?';
        const [userCheck] = await db.query(userQuery, [email] );
        console.log(userCheck);
        if(userCheck.length > 0){
            
        //check if password is correct
        const user = userCheck[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_encrypted);
        if(!isPasswordValid){
            return res.status(400).json({ message: 'Invalid password!'});
        }

        // Create session
        console.log(req.session);
        req.session.userId = user.id;
        req.session.role = 'patient';

        return res.status(200).json({
            message: 'User logged in successfully!',
            redirect: ('/dashboard')
        });
    }
    else{
        return res.status(400).json({message: 'User does not exist!'});
    }
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({ message: 'An error occured!'});
    }
};

//Dashboard
const patientDashboard = async (req, res) => {
    // Check if user is logged in
    if (!req.session.userId || !req.session.patientId) {
        return res.redirect('/login');
    }

    try {
        // Fetch patient data and appointments
        const query = `
            SELECT 
                p.*,
                a.appointment_date,
                a.appointment_time,
                d.first_name as doctor_first_name,
                d.last_name as doctor_last_name,
                d.provider_specialty,
                m.diagnosis,
                m.prescription,
                m.notes
            FROM patients p
            LEFT JOIN appointments a ON p.patient_id = a.patient_id
            LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
            LEFT JOIN medical_records m ON p.patient_id = m.patient_id
            WHERE p.patient_id = ?
            ORDER BY a.appointment_date DESC`;

        const [patientData] = await db.promise().query(query, [req.session.patientId]);

        // Group medical records
        const medicalRecords = patientData.filter(record => record.diagnosis);
        
        // Group appointments
        const appointments = patientData.filter(record => record.appointment_date);

        res.render('patients_dashboard', {
            user: {
                name: `${patientData[0].first_name} ${patientData[0].last_name}`,
                email: patientData[0].email_address
            },
            patientData: appointments,
            medicalRecords: medicalRecords,
            isLoggedIn: true
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            message: 'Error loading dashboard'
        });
    }
};

// Add authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.userId && req.session.patientId) {
        return next();
    }
    res.redirect('/login');
}





module.exports = { registerUser, loginUser, patientDashboard, isAuthenticated };