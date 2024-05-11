const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  distanceLimitKm: { type: Number, required: true },
  extraChargePerKm: { type: Number, required: true },
  restaurantRadius: { type: Number, required: true }  // New field for restaurant radius
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
