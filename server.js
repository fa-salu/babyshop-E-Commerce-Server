const express = require("express");
const connectDB = require('./config/db')
const cors = require('cors')
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes")
const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/healthRoutes");
require("dotenv").config();

const app = express();
connectDB()

app.use(express.json());

app.use(cors(
    {
        origin: "process.env.CLIENT_URL",
        credentials : true
    }
));
app.use(errorHandler);


app.use("/users", userRoutes);
app.use("/admin", adminRoutes)
app.use("/api", healthRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
