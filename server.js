const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/routes");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/users", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
