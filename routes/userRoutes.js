const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
router.get('/signup', userController.getSignup);     // Show signup form
router.post('/signup', userController.postSignup);   // Handle form submit

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

router.get('/home', userController.getHome);
router.get('/logout', userController.logout);

router.get('/profile', userController.getProfile);
router.post('/profile', userController.postProfile);


module.exports = router;
