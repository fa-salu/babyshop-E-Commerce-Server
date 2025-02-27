import axios from "axios";

const keepAlive = async () => {
  try {
    await axios.get("https://babyshop-backend.onrender.com/api/health");
    console.log("Backend is awake");
  } catch (error) {
    console.error("Error pinging backend:", error.message);
  }
};

// Run the keep-alive function every 5 minutes
setInterval(keepAlive, 5 * 60 * 1000);

export default keepAlive;
