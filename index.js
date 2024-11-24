const express = require('express');
require('dotenv').config();
const routes= require('./backend/routes/auth');
const session = require('express-session');
const path = require('path');

const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.static(path.join(__dirname,  'public')));
    app.use('/auth', routes);
    app.use(express.urlencoded({ extended: true }));
    app.use(session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === 'production' }
    }));

    
  // Set view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));


    app.get('/', (req, res) => {
        try {
        res.status(200).sendFile(path.join(__dirname, 'front_end', 'landingPage.html'));
    } catch (error) {
        console.error('Error serving landing page:', error);
        res.status(500).send({
            success: false,
            message: 'Error loading landing page'
        });
    }
    });

    app.get('/doctor/signup', (req, res) => {
        try {
        res.status(200).sendFile(path.join(__dirname, 'front_end', 'doctorSignup.html'));
    } catch (error) {
        console.error('Error serving sign up page for doctors:', error);
        res.status(500).send({
            success: false,
            message: 'Error loading sign up page for doctors'
        });
    }
    });

    app.get('/register', (req, res) => {
        try {
        res.status(200).sendFile(path.join(__dirname, 'front_end', 'signUp.html'));
    } catch (error) {
        console.error('Error serving registration page:', error);
        res.status(500).send({
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
            res.status(500).send({
                success: false,
                message: 'Error loading login page'
            });
        }
    });



    const PORT = process.env.PORT|| 4500;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });