const jwt = require('jsonwebtoken');
const ChargeRecord = require('../model/ChargeRecord');
const AdminSettings = require('../model/AdminSettings');

exports.calculateCharges = async (req, res) => {
    const { distance } = req.body;
    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const settings = await AdminSettings.findOne();
        if (!settings) {
            return res.status(404).json({ message: "Admin settings not found." });
        }

        let limitStatus = 'Within Limit';
        let extraCharge = 0;

        if (distance > settings.distanceLimitKm) {
            limitStatus = 'Off Limit';
            const extraKm = distance - settings.distanceLimitKm;
            extraCharge = extraKm * settings.extraChargePerKm;
        }

        const newRecord = new ChargeRecord({
            userId,
            distance,
            limitStatus,
            extraCharge
        });

        await newRecord.save();

        res.status(201).json({
            message: "Charge calculation completed",
            data: {
                distance,
                limitStatus,
                extraCharge
            }
        });

    } catch (error) {
        console.error('Error calculating charges:', error);
        res.status(500).json({ message: "Error calculating charges", error: error.message });
    }
};
