const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if initial admin exists, if not, create one
    const existingAdmin = await User.findOne({ email: 'fasalu@gmail.com', isAdmin: true });
    if (!existingAdmin) {
      const newAdmin = new User({
        username: 'fasalu',
        email: 'fasalu@gmail.com',
        password: 'fasalu@gmail.com',
        isAdmin: true 
      });
      await newAdmin.save();
      console.log('Initial admin created');
    }

    // Now, attempt to login
    const admin = await User.findOne({ email, isAdmin: true });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: admin._id, isAdmin: true }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
