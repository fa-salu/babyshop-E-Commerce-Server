const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  Products: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' } }], 
  purchaseDate: { type: Date, default: Date.now }, 
  totalPrice: Number, 
  totalItems: Number 
});

module.exports = mongoose.model('Order', orderSchema);
