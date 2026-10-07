require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Dauer Classic Cars API running on http://localhost:${PORT}`);
  console.log(`Payment provider: ${process.env.PAYMENT_PROVIDER || "mock"}`);
  console.log(`Email provider:   ${process.env.EMAIL_PROVIDER || "none"}`);

  // Connect to MongoDB at startup so you see the problem immediately in this terminal.
  try {
    await connectDB();
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection FAILED:", err.message);
  }
});