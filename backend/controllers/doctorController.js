//Doctor Controller(registration and login)
const bcrypt = require('bcrypt');
const db = require('../config/db');
const ejs = require('ejs');

//Register a new doctor
const registerProvider = async (req, res) => {

    //Fetch data
    const { fname, lname, email, date, password, license, speciality } = req.body;
    console.log(req.body);

    try {
        const userQuery = 'SELECT * FROM users WHERE email_address = ?';
        const [userCheck] = await db.query(userQuery, [email]);
        if (userCheck.length > 0) {
            return res.status(400).json({ message: 'Doctor already exists!' });
        }

        //Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create provider record
        const createUserQuery = `INSERT INTO users (email_address, password_encrypted) VALUES (?, ?)`;
        const [userResults] = await db.query(createUserQuery, [email, hashedPassword]);

        // Create doctor record with provider_id
        const createDoctorQuery = `
            INSERT INTO providers (
                first_name,
                last_name,
                email_address,
                date_of_birth,
                password_encrypted,
                license_number,
                provider_specialty,
                user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const doctorValues = [fname, lname, email, date, hashedPassword, license, speciality, userResults.insertId];

        // Execute the query
        await db.query(createDoctorQuery, doctorValues, (error, providerResults) => {
            if (error) {
                console.error('Error creating doctor:', error);
                return res.status(500).send({
                    success: false,
                    message: 'Registration failed!'
                });
            }
            console.log(providerResults);
            // Create session
            req.session.userId = userResults.insertId;
            req.session.providerId = providerResults.insertId;
            req.session.role = 'doctor';

            return res.status(201).json({
                message: 'Doctor registered successfully!',
                redirect: '/auth/provider-dashboard'
            });
        });
    } 
    catch (error) {
        console.error('Error creating doctor:', error);
        return res.status(500).send({
            success: false,
            message: 'Registration failed!'
        });
    }
};

//Login a doctor
const loginProvider = async (req, res) => {
    const { email, password } = req.body;

    try {
        const UserQuery = 'SELECT * FROM users WHERE email_address = ?';
        const [UserResults] = await db.query(UserQuery, [email]);

        if (UserResults.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = UserResults[0];
        const passwordMatch = await bcrypt.compare(password, user.password_encrypted);

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        req.session.userId = user.user_id;

        // Fetch provider ID based on user ID
        const providerQuery = 'SELECT * FROM providers WHERE user_id = ?';
        const [providerCheck] = await db.query(providerQuery, [user.user_id]);

        if (providerCheck.length > 0) {
            req.session.providerId = providerCheck[0].provider_id; 
        }

        // Create session
        req.session.role = 'doctor';

        return res.status(200).json({
            message: 'Login successful!',
            redirect: '/auth/provider-dashboard'
        });
    } 
    catch (error) {
        console.error('Error logging in doctor:', error);
        return res.status(500).send({
            success: false,
            message: 'Login failed!'
        });
    }
};

//Doctor Dashboard
const doctorDashboard = async (req, res) => {

    if (!req.session.userId || !req.session.providerId) {
        return res.status(401).send({
            success: false,
            message: 'Unauthorized'
        });
    }

    try {
        const doctorQuery = `
            SELECT * FROM providers
            WHERE provider_id = ? AND user_id = ?
        `;
        const [doctorResults] = await db.query(doctorQuery, [req.session.providerId, req.session.userId]);

        if (doctorResults.length === 0) {
            return res.status(401).send({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Get the doctor data
        const doctorData = doctorResults[0];

        //Patient query
        const patientQuery = `SELECT * FROM medical_records WHERE provider_id = ?`;
        const [patients] = await db.query(patientQuery, [req.session.providerId]);

        //Appointment query
        const appointmentQuery = `
            SELECT 
                a.*,
                p.first_name AS patient_first_name,
                p.last_name AS patient_last_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.patient_id
            WHERE a.provider_id = ? AND a.appointment_date >= CURDATE()
            ORDER BY a.appointment_date ASC`;

        const [appointments] = await db.query(appointmentQuery, [req.session.providerId]);

        //Today appointments
        const todaySchedule = `
            SELECT * FROM appointments
            WHERE provider_id = ? AND appointment_date = CURDATE()`;

        const [todayAppointments] = await db.query(todaySchedule, [req.session.providerId]);

        //Upcoming appointments
        const upcoming = `
            SELECT * FROM appointments
            WHERE provider_id = ? AND appointment_date > CURDATE()`;

        const [upcomingAppointments] = await db.query(upcoming, [req.session.providerId, ]);

         // Render the doctor dashboard
        res.render('doctorDashboard.ejs', {
            doctorData,
            patients,
            appointments,
            todayAppointments,
            upcomingAppointments
        });
    } 
    catch (error) {
        console.error('Error loading doctor dashboard:', error);
        return res.status(500).send({
            success: false,
            message: 'Error loading dashboard'
        });
    }
};

//Update appointment status
const updateStatus = async (req,res)=>{

    if (!req.session.userId || !req.session.providerId) {
        return res.status(401).send({
            success: false,
            message: 'Unauthorized',
            redirect: '/auth/provider-login'
        });
    }

    const {appointmentId, status} = req.body;

    try{
        const updateQuery =`
            UPDATE appointments 
            SET status = ?
            WHERE appointment_id = ?
        `;

        await db.query(updateQuery, [status, appointmentId]);

        return res.status(201).send({
            success: true,
            message: "Appointment confirmed successfully!"
        });
    }

    catch(error){
        return res.status(500).send({
            success: false,
            message: "Error updating appointment status!"
        });
    }
};

//Cancel appointment
const cancelAppointment = async (req, res) => {
    const { appointmentId, status } = req.body;

    try {
        const cancelQuery = `
            UPDATE appointments
            SET status = ?
            WHERE appointment_id = ?
        `;

        await db.query(cancelQuery, [status, appointmentId]);

        return res.status(201).send({
            success: true,
            message: 'Appointment cancelled successfully!'
        });
    } 
    catch (error) {
        console.error('Error cancelling appointment:', error);
        return res.status(500).send({
            success: false,
            message: 'Error cancelling appointment'
        });
    }
};

//Authentication
function Authenticated(req, res, next) {

    if (req.session.userId && req.session.providerId) {
        return next();
    }
    res.redirect('/auth/provider-login');
}


module.exports = {
    registerProvider,
    loginProvider,
    doctorDashboard,
    updateStatus,
    cancelAppointment,
    Authenticated
};