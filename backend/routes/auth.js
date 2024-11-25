const express = require('express');
const { registerUser, loginUser, isAuthenticated, patientDashboard } = require('../controllers/patientController');
const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/dashboard', isAuthenticated, patientDashboard);


module.exports = router;