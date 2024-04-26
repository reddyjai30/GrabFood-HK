const mongoose = require('mongoose');

const chargeRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    distance: { type: Number, required: true },
    limitStatus: { type: String, enum: ['Within Limit', 'Off Limit'], required: true },
    extraCharge: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ChargeRecord', chargeRecordSchema);
