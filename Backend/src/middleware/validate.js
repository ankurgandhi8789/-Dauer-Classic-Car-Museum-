function validateBookingInput(req, res, next) {
  const { customer, visitDate, visitTime, items } = req.body;

  if (!customer || typeof customer !== "object") {
    return res.status(400).json({ error: "Customer information is required." });
  }

  const { firstName, lastName, email, phone } = customer;
  if (!firstName || !firstName.trim()) return res.status(400).json({ error: "First name is required." });
  if (!lastName || !lastName.trim()) return res.status(400).json({ error: "Last name is required." });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (!phone || !/^[\d\s\-\+\(\)]{7,20}$/.test(phone.trim())) {
    return res.status(400).json({ error: "A valid phone number is required." });
  }

  if (!visitDate || !/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
    return res.status(400).json({ error: "A valid visit date (YYYY-MM-DD) is required." });
  }

  if (!visitTime) return res.status(400).json({ error: "A visit time is required." });

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Ticket items are required." });
  }

  next();
}

function validatePaymentInput(req, res, next) {
  const { bookingReference, paymentDetails } = req.body;
  if (!bookingReference) return res.status(400).json({ error: "Booking reference is required." });
  if (!paymentDetails || typeof paymentDetails !== "object") {
    return res.status(400).json({ error: "Payment details are required." });
  }
  next();
}

module.exports = { validateBookingInput, validatePaymentInput };
