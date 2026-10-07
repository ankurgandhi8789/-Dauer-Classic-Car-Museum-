const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    ticketTypeId: { type: String, required: true },
    ticketName: { type: String, required: true },
    tourType: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    requiresId: { type: Boolean, default: false },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: { type: String, required: true, unique: true },
    qrToken: { type: String, required: true, unique: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },

    visitDate: { type: String, required: true, index: true }, // "YYYY-MM-DD"
    visitTime: { type: String, required: true },              // "HH:MM"

    items: { type: [itemSchema], default: [] },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, default: "USD" },

    // paymentStatus: pending | paid | failed        (payment is not connected yet, so stays "pending")
    // bookingStatus: pending | confirmed | used | no_show | cancelled
    paymentStatus: { type: String, default: "pending" },
    bookingStatus: { type: String, default: "confirmed" },

    isDemo: { type: Boolean, default: false }, // set by the seed script only
  },
  { timestamps: true }
);

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
