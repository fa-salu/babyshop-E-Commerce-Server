const express = require('express')
const router = express.Router()
const adminControllers = require('../controllers/adminController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/login', adminControllers.adminLogin)
router.get('/users', authMiddleware, adminControllers.getAllUsers)
router.get('/user/:userId', authMiddleware, adminControllers.getUserById)


module.exports = router