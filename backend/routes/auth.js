const express = require('express');
const { registerUser, loginUser, isAuthenticated, patientDashboard } = require('../controllers/patientController');
const {registerProvider} = require('../controllers/doctorController'); 
const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/dashboard', isAuthenticated, patientDashboard);

router.post('/provider-signUp', registerProvider);


module.exports = router;