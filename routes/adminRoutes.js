const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin login routes
router.get('/login', adminController.getAdminLogin);
router.post('/login', adminController.postAdminLogin);

// Dashboard (user list)
router.get('/dashboard', adminController.getDashboard);
router.get('/dashboard/search', adminController.searchUsers);

router.get('/delete/:id', adminController.deleteUser);

router.get('/edit/:id', adminController.getEditUser);
router.post('/edit/:id', adminController.postEditUser);





// Logout
router.get('/logout', adminController.logout);

router.get('/add', adminController.getAddUser);
router.post('/add', adminController.postAddUser);


module.exports = router;
