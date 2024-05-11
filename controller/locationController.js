const { Client } = require('@googlemaps/google-maps-services-js');
const jwt = require('jsonwebtoken');
const Location = require('../model/Location'); // Adjusted to the likely correct path
const AdminSettings = require('../model/AdminSettings');
const ChargeRecord = require('../model/ChargeRecord'); // Make sure this model is set up correctly


exports.saveLocation = async (req, res) => {
    // Attempt to get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Get the token part after "Bearer"
    //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MjExOWUwMWM4NWJhYmNmOWY0ZTExMCIsImlhdCI6MTcxMzUxODM5NCwiZXhwIjoxNzE0MTIzMTk0fQ.foNXhESzIVLtLDGsss48fd-6DhULRohdI1n99cmT-tI" ; //localStorage.getItem('token'); // Retrieve token from localStorage


    const { latitude, longitude } = req.body;

    try {
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required." });
        }

        // Verify and decode the JWT token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use an environment variable for the JWT secret
        const userId = decoded.id; // Extract user ID from token

        // Create and save the location
        const location = new Location({
            userId: userId, // Store the user ID from the token
            latitude: latitude,
            longitude: longitude
        });

        await location.save();
        res.status(201).json({ message: "Location saved successfully", location });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            // Handle JSON Web Token errors
            return res.status(403).json({ message: "Invalid token." });
        }
        // Generic error handling
        console.error("Error saving location:", error);
        res.status(500).json({ error: error.message });
    }
};



// New function to calculate distance
exports.calculateDistance = async (req, res) => {
    // Attempt to get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Get the token part after "Bearer"

    const { originLatitude, originLongitude, destinationLatitude, destinationLongitude } = req.body;
    const client = new Client({});

    try {
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required." });
        }

        jwt.verify(token, process.env.JWT_SECRET); // This just verifies the token but does not use the decoded data

        const params = {
            origins: [{ latitude: originLatitude, longitude: originLongitude }],
            destinations: [{ latitude: destinationLatitude, longitude: destinationLongitude }],
            key: process.env.GOOGLE_MAPS_API_KEY, // Ensure your API key is stored in environment variables
            mode: "driving"
        };

        const response = await client.distancematrix({
            params: params
        });

        const distance = response.data.rows[0].elements[0].distance.text;
        const duration = response.data.rows[0].elements[0].duration.text;

        res.json({ distance, duration });
    } catch (error) {
        console.error("Error calculating distance:", error);
        res.status(500).json({ error: error.message });
    }
};




exports.calculateDistanceAndCharges = async (req, res) => {
    const { originLatitude, originLongitude, destinationLatitude, destinationLongitude } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const client = new Client({});

    try {
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const params = {
            origins: [{ latitude: originLatitude, longitude: originLongitude }],
            destinations: [{ latitude: destinationLatitude, longitude: destinationLongitude }],
            key: process.env.GOOGLE_MAPS_API_KEY,
            mode: "driving"
        };

        const distanceResponse = await client.distancematrix({ params });
        const distance = parseFloat(distanceResponse.data.rows[0].elements[0].distance.text.replace(' km', ''));

        const settings = await AdminSettings.findOne();
        if (!settings) {
            return res.status(404).json({ message: "Admin settings not found." });
        }

        let limitStatus = 'Within Limit';
        let extraCharge = 0;

        if (distance > settings.distanceLimitKm) {
            limitStatus = 'Off Limit';
            extraCharge = (distance - settings.distanceLimitKm) * settings.extraChargePerKm;
        }

        const newRecord = new ChargeRecord({
            
            userId,
            distance,
            limitStatus,
            extraCharge
        });

        await newRecord.save();

        res.json({
            message: "Distance and charges calculated successfully",
            data: {
                distance: `${distance} km`,
                limitStatus,
                extraCharge
            }
        });
    } catch (error) {
        console.error("Error calculating distance and charges:", error);
        res.status(500).json({ error: error.message });
    }
};