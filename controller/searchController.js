const Restaurant = require('../model/restaurantModel');

exports.searchMenuItem = async (req, res) => {
    const { q, type } = req.query; // 'q' is the search query, 'type' determines if searching for 'menu' or 'restaurant'

    try {
        if (type === 'restaurant') {
            // Search for restaurants by name
            const restaurants = await Restaurant.find({
                name: { $regex: q, $options: 'i' }, // Case insensitive search
                status: 'approved' // Only include approved restaurants
            });
            res.json(restaurants);
        } else if (type === 'menu') {
            // Search for menu items
            const restaurants = await Restaurant.aggregate([
                { $match: { status: 'approved' } },
                { $unwind: "$categories" },
                { $unwind: "$categories.menuItems" },
                { $match: { "categories.menuItems.name": { $regex: q, $options: 'i' } } },
                { $project: { name: 1, "menuItem": "$categories.menuItems" } } // Adjust the projection as needed
            ]);
            res.json(restaurants);
        } else {
            res.status(400).json({ message: "Invalid search type" });
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: "Error processing your search", error: error.message });
    }
};