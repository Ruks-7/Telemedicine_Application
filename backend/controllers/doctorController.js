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
        const providerQuery = 'SELECT * FROM providers WHERE email_address = ?';
        const [providerCheck] = await db.query(providerQuery, [email]);
        if (providerCheck.length > 0) {
            return res.status(400).json({ message: 'Doctor already exists!' });
        }

        //Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create provider record
        const createProviderQuery = `INSERT INTO users (email_address, password_encrypted) VALUES (?, ?)`;
        const providerResults = await db.query(createProviderQuery, [email, hashedPassword]);

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
        const doctorValues = [fname, lname, email, date, hashedPassword, license, speciality, providerResults.insertId];

        // Execute the query
        await db.query(createDoctorQuery, doctorValues, (error, doctorResults) => {
            if (error) {
                console.error('Error creating doctor:', error);
                return res.status(500).send({
                    success: false,
                    message: 'Registration failed!'
                });
            }

            // Create session
            req.session.userId = providerResults.insertId;
            req.session.doctorId = doctorResults.insertId;
            req.session.role = 'doctor';

            return res.status(201).json({
                message: 'Doctor registered successfully!',
                redirect: '/auth/dashboard'
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

module.exports = {
    registerProvider
};