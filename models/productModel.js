const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  stars: Number,  
  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', productSchema);
