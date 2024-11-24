const bcrypt = require('bcrypt');
const db = require('../config/db');
const { use } = require('./auth');


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

                const [patientResults] = await db.query(createPatientQuery, patientValues);
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

        res.status(201).json({ message: 'User registered successfully!'});
    }
    catch(error) {
        console.log(error);
        res.status(500).json({ message: 'An error occured!', error });
    }
};

const loginUser = async (req, res) => {
    //fetch data
    const { email, password } = req.body;
    console.log(req.body);

    try{
        //check if user exists
        const [rows] = await db.execute('SELECT * FROM users WHERE email_address = ?', [email]);
        if(rows.length === 0){
            return response.status(400).json({ message: 'User does not exist!'});
        }
        //check if password is correct
        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_encrypted);
        if(!isPasswordValid){
            return response.status(400).json({ message: 'Invalid password!'});
        }

        // Create session
        req.session.userId = user.id;
        req.session.role = user.role;

        res.status(200).json({ message: 'User logged in successfully!'});
        res.redirect('/dashboard');
    }
    catch(error) {
        res.status(500).json({ message: 'An error occured!', error });
    }
};

module.exports = { registerUser, loginUser };