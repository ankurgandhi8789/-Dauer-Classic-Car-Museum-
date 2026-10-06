const express = require("express");
const router = express.Router();
const { TICKET_TYPES, MUSEUM_CONFIG } = require("../config/ticketConfig");

// GET /api/tickets/types
router.get("/types", (req, res) => {
  res.json({
    ticketTypes: TICKET_TYPES.filter((t) => t.isActive),
    museumConfig: MUSEUM_CONFIG,
  });
});

module.exports = router;
