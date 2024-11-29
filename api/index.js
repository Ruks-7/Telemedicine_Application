const express = require('express');
require('dotenv').config();
const ejs = require('ejs');
const db = require('../backend/config/db');
const routes= require('../backend/routes/auth');
const session = require('express-session');
const mysqlSession = require('express-mysql-session')(session);
const crypto = require('crypto'); // For generating secret key
const path = require('path');

const app = express();

// Generate secret key
const secretKey = crypto.randomBytes(32).toString('hex');

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname,  '../public')));

    // Session configuration
    const mysqlSessionStore = new mysqlSession({}, db);
    app.use(session({
        connectionLimit: 10,
        secret: secretKey,
        store: mysqlSessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: { 
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: false
        }
    }));

    app.use('/auth', routes);
    
  // Set view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    app.get('/', (req, res) => {
        try {
        res.status(200).sendFile(path.join(__dirname, "../", "front_end", 'index.html'));
    } catch (error) {
        console.error('Error serving landing page:', error);
        res.status(500).send({
            success: false,
            message: 'Error loading landing page'
        });
    }
    });

    app.get('/provider-signUp', (req, res) => {
        try {
        res.status(200).sendFile(path.join(__dirname, "../", 'front_end', 'doctorSignup.html'));
    } catch (error) {
        console.error('Error serving sign up page for doctors:', error);
        res.status(500).send({
            success: false,
            message: 'Error loading sign up page for doctors'
        });
    }
    });

    app.get('/provider-login', (req, res) => {
        try {
        res.status(200).sendFile(path.join(__dirname, "../", 'front_end', 'doctorLogin.html'));
        }
        catch (error) {
        console.error('Error serving login page for doctors:', error);
        res.status(500).send({
            success: false,
            message: 'Error loading login page for doctors'
        }); 
        }
    });

    app.get('/register', (req, res) => {
        try {
        res.status(200).sendFile(path.join(__dirname, "../", 'front_end', 'signUp.html'));
    } catch (error) {
        console.error('Error serving registration page:', error);
        res.status(500).send({
            success: false,
            message: 'Error loading registration page'
        });
    }
    });

    app.get('/login', (req, res) => {
        try {
            res.status(200).sendFile(path.join(__dirname, "../", 'front_end', 'login.html'));
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