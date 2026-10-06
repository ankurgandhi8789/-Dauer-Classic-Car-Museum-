require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Dauer Classic Cars API running on http://localhost:${PORT}`);
  console.log(`Payment provider: ${process.env.PAYMENT_PROVIDER || "mock"}`);
  console.log(`Email provider:   ${process.env.EMAIL_PROVIDER || "none"}`);
});
