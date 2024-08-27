const express = require('express')
const router = express.Router()
const adminControllers = require('../controllers/adminController')
const authMiddleware = require('../middleware/authMiddleware')

// router.post('/login', adminControllers.adminLogin)
router.get('/users', authMiddleware, adminControllers.getAllUsers)
router.get('/user/:userId', authMiddleware, adminControllers.getUserById)
router.get('/products', authMiddleware, adminControllers.getAllProduct)
router.post('/product', authMiddleware, adminControllers.createProduct)
router.delete('/product/:productId', authMiddleware, adminControllers.deleteProduct)
router.put('/product/:productId', authMiddleware, adminControllers.updateProduct)
router.get('/purchase', authMiddleware, adminControllers.getTotalProductsPurchased)
router.get('/revenue', authMiddleware, adminControllers.getTotalRevenue)
router.get('/order',authMiddleware, adminControllers.getOrderDetails)
router.get('/order/:userId', authMiddleware, adminControllers.getOrderDetailsByUser)


module.exports = router