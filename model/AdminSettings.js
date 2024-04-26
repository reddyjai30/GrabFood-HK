const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  distanceLimitKm: { type: Number, required: true },
  extraChargePerKm: { type: Number, required: true }
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
