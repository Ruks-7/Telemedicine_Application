// server.js
const express = require('express');
const db = require('./database');
const session = require('express-session');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));


// Routes
app.use(express.static(path.join(__dirname,  'public')));

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

app.get('/patient', (req, res) => {
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


const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});