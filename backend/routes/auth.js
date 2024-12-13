const express = require('express');
const { registerUser, loginUser, isAuthenticated, patientDashboard,logout, bookAppointment } = require('../controllers/patientController');
const {registerProvider, loginProvider,doctorDashboard, Authenticated, updateStatus, cancelAppointment} = require('../controllers/doctorController'); 
const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/dashboard', isAuthenticated, patientDashboard);

router.post('/provider-signUp', registerProvider);

router.post('/appointments', isAuthenticated, bookAppointment);

router.post('/status', Authenticated, updateStatus);

router.post('/cancel', Authenticated, cancelAppointment);

router.post('/provider-login', loginProvider);

router.get('/provider-dashboard', doctorDashboard, Authenticated);

router.get('/logout', logout);


module.exports = router;