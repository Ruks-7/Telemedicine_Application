//Patient registration and login controller
const bcrypt = require('bcrypt');
const db = require('../config/db');
const ejs = require('ejs');


//Register a new user
const registerUser = async (req, res) => {
    //fetch data
    const { fname, lname, email, gender, date, password } = req.body;
    try{
        //check if user exists
        const userQuery = 'SELECT * FROM users WHERE email_address = ?';
        const [userCheck] = await db.query(userQuery, [email] );

        if(userCheck.length > 0){
            return res.status(400).json({ message: 'User already exists!'});
        }

        //Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user record
        const createUserQuery = `INSERT INTO users (email_address, password_encrypted) VALUES (?, ?)`;
        const  [userResults] = await db.query(createUserQuery, [email, hashedPassword]);

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
            redirect: '/auth/dashboard'
            });
        });
    }
    catch(error) {
        return res.status(500).json({ message: 'An error occured!', error });
    }
};

//Login a user
const loginUser = async (req, res) => {
    //fetch data
    const { email, password } = req.body;

    try{
        //check if user exists
        const userQuery = 'SELECT * FROM users WHERE email_address = ?';
        const [userCheck] = await db.query(userQuery, [email] );
        if(userCheck.length > 0){
            
        //check if password is correct
        const user = userCheck[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_encrypted);
        if(!isPasswordValid){
            return res.status(400).json({ message: 'Invalid password!'});
        }

        // Create session
        req.session.userId = user.user_id;
        req.session.role = 'patient';


        // Fetch patient ID based on user ID
        const patientQuery = 'SELECT * FROM patients WHERE user_id = ?';
        const [patientCheck] = await db.query(patientQuery, [user.user_id]);
        if (patientCheck.length > 0) {
            req.session.patientId = patientCheck[0].patient_id; // Set patient ID
        }

        return res.status(200).json({
            message: 'User logged in successfully!',
            redirect: '/auth/dashboard'
        });
        
    }
    else{
        return res.status(400).json({message: 'User does not exist!'});
    }
    }
    catch(error) {
        return res.status(500).json({ message: 'An error occured!'});
    }
};

//Dashboard
const patientDashboard = async (req, res) => {
    
    console.log(req.session);
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
                d.first_name as provider_first_name,
                d.last_name as provider_last_name,
                d.provider_specialty,
                m.diagnosis,
                m.prescription,
                m.notes
            FROM patients p
            LEFT JOIN appointments a ON p.patient_id = a.patient_id
            LEFT JOIN providers d ON a.provider_id = d.provider_id
            LEFT JOIN medical_records m ON p.patient_id = m.patient_id
            WHERE p.patient_id = ?
            ORDER BY a.appointment_date DESC`;

        const [patientData] = await db.query(query, [req.session.patientId]);

        //Get doctors
        const doctorQuery = 'SELECT * FROM providers';
        const [doctors] = await db.query(doctorQuery);

        // Group medical records(Includes defined diagnosis)
        const medicalRecords = patientData.filter(record => record.diagnosis);
        
        // Group appointments & it is greater than current date
        const appointments = patientData.filter(appointment => appointment.appointment_date && new Date(appointment.appointment_date) >= new Date());

        res.render('patientsDashboard.ejs', {
            patientData, medicalRecords, appointments, doctors,
            isLoggedIn: true
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).render('error', {
            message: 'Error loading dashboard'
        });
    }
};

//Logout
const logout = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Error destroying session:', error);
            return res.status(500).send({
                success: false,
                message: 'Logout failed!'
            });
        }

        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};

//Book an appointment
const bookAppointment = async (req, res) => {
    // Check if user is logged in
    if (!req.session.userId || !req.session.patientId) {
        return res.redirect('/login');
    }

    console.log(req.body);

    console.log(req.session.patientId, req.session.userId);
    // Fetch form data
    const { provider, date, time, consultation_type, symptoms } = req.body;
    
    try {
        // Create appointment
        const createAppointmentQuery = `
            INSERT INTO appointments (
                patient_id,
                provider_id,
                appointment_date,
                appointment_time,
                consultation_type,
                symptoms
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        await db.query(createAppointmentQuery, [req.session.patientId, provider, date, time, consultation_type, symptoms]); //Provider is the provider_id

        res.status(201).send({
            success: true,
            message: 'Appointment booked successfully!',
        });

    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).send({
            success: false,
            message: 'Appointment booking failed!'
        });
    }
};

// Add authentication middleware
function isAuthenticated(req, res, next) {

    if (req.session.userId && req.session.patientId) {
        return next();
    }
    res.redirect('/auth/login');
}





module.exports = { registerUser, loginUser, patientDashboard, isAuthenticated, logout, bookAppointment };