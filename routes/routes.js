const express = require('express');
const router = express.Router();
const controllers = require('../controllers/controllers');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', controllers.register);
router.post('/login', controllers.login);
router.get('/products/:category', controllers.getProductsByCategory);
router.get('/product/:productId', controllers.getProductById);
router.post('/cart', authMiddleware, controllers.addToCart);
router.get('/cart/:userId', authMiddleware, controllers.getCartItems);
router.delete('/cart/:userId/:productId', authMiddleware, controllers.deleteCartItem);
router.delete('/cart/:userId', authMiddleware, controllers.clearCart);
router.post('/wishlist', authMiddleware, controllers.addToWishlist);
router.get('/wishlist/:userId', authMiddleware, controllers.getWishlistItems);
router.post('/order', authMiddleware, controllers.createOrder);
router.get('/order/:orderId', authMiddleware, controllers.getOrderDetails);

module.exports = router;
