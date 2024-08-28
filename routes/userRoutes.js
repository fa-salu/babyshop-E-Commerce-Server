const express = require('express');
const router = express.Router();
const userController
 = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/products', userController.getAllProducts);
router.get('/products/:category', userController.getProductsByCategory);
router.get('/product/:productId', userController.getProductById);
router.post('/cart', authMiddleware, userController.addToCart);
// router.put('/cart/:userId/:productId', authMiddleware, userController.updateCartItemQuantity);
router.get('/cart/:userId', authMiddleware, userController.getCartItems);
router.delete('/cart/remove/:userId/:productId', authMiddleware, userController.removeCartItem);
router.delete('/cart/delete/:userId/:productId', authMiddleware, userController.deleteCartItem)
router.delete('/cart/:userId', authMiddleware, userController.clearCart);
router.post('/wishlist', authMiddleware, userController.addToWishlist);
router.get('/wishlist/:userId', authMiddleware, userController.getWishlistItems);
router.post('/order', authMiddleware, userController.createOrder);
router.post('/order/verify', authMiddleware, userController.verifyPayment)
router.get('/order/:orderId', authMiddleware, userController.getOrderDetails);
// router.post('/order/:orderId', authMiddleware, userController.cancelPayment)

module.exports = router;
