const express = require("express");
const connectDB = require('./config/db')
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes")
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
connectDB()

app.use(express.json());
app.use(errorHandler);


app.use("/users", userRoutes);
app.use("/admin", adminRoutes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
