const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    houseNumber: String,  // Optional house number
    apartmentName: String,  // Optional apartment name
    directions: String,  // Optional directions to reach the location
    category: {
        type: String,
        enum: ['Home', 'Work', 'Other'],  // Categorization of the address
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
