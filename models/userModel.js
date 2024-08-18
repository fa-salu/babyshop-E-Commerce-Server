const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  profileImg: String,
  isAdmin: { type: Boolean, default: false } 
});

module.exports = mongoose.model('User', userSchema);
