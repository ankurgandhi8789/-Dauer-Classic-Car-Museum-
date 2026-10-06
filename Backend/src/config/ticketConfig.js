/**
 * TICKET CONFIGURATION — Single source of truth.
 * Frontend fetches this from GET /api/tickets/types.
 * Backend uses this for ALL price calculations.
 * Prices from the frontend are NEVER trusted.
 */

const TICKET_TYPES = [
  {
    id: "self_adult",
    tourType: "self_guided",
    name: "Adult",
    description: "Self-guided tour. Full access to all exhibits and displays.",
    price: 20,
    category: "admission",
    ageLabel: "Ages 15+",
    minimumQuantity: 0,
    maximumQuantity: 50,
    isFree: false,
    requiresId: false,
    isActive: true,
  },
  {
    id: "self_child",
    tourType: "self_guided",
    name: "Child",
    description: "Self-guided tour. Children ages 4–14. Children under 4 are free.",
    price: 10,
    category: "admission",
    ageLabel: "Ages 4–14",
    minimumQuantity: 0,
    maximumQuantity: 50,
    isFree: false,
    requiresId: false,
    isActive: true,
  },
  {
    id: "self_military",
    tourType: "self_guided",
    name: "Active Duty Military",
    description: "Free admission for active duty military. Valid military ID required at entry.",
    price: 0,
    category: "admission",
    ageLabel: "Valid ID required",
    minimumQuantity: 0,
    maximumQuantity: 20,
    isFree: true,
    requiresId: true,
    isActive: true,
  },
  {
    id: "self_responder",
    tourType: "self_guided",
    name: "First Responder",
    description: "Free admission for first responders. Valid ID required at entry.",
    price: 0,
    category: "admission",
    ageLabel: "Valid ID required",
    minimumQuantity: 0,
    maximumQuantity: 20,
    isFree: true,
    requiresId: true,
    isActive: true,
  },
  {
    id: "vip",
    tourType: "vip",
    name: "VIP Tour",
    description: "Detailed guided tour of the full collection with exclusive access. Minimum 2 tickets.",
    price: 35,
    category: "vip",
    ageLabel: "All ages",
    minimumQuantity: 2,
    maximumQuantity: 20,
    isFree: false,
    requiresId: false,
    isActive: true,
  },
  {
    id: "gift",
    tourType: "gift",
    name: "Gift Tickets (Book of 10)",
    description: "Book of 10 gift tickets — a $200 value. Perfect for gifting museum access.",
    price: 180,
    category: "gift",
    ageLabel: "$200 value",
    minimumQuantity: 1,
    maximumQuantity: 10,
    isFree: false,
    requiresId: false,
    isActive: true,
  },
];

/**
 * Museum operating configuration.
 * 0 = Sunday, 1 = Monday … 6 = Saturday
 */
const MUSEUM_CONFIG = {
  openDays: [1, 2, 3, 4, 5, 6],
  openTime: "09:00",
  closeTime: "15:00",
  timeSlots: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"],
  address: "10801 NW 50th St, Sunrise, FL 33351",
  phone: "(954) 748-6271",
  defaultCapacityPerSlot: 30,
};

module.exports = { TICKET_TYPES, MUSEUM_CONFIG };
