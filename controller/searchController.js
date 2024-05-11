const Restaurant = require('../model/restaurantModel');
const mongoose = require('mongoose');

exports.searchMenuItem = async (req, res) => {
    const { q, type } = req.query; // 'q' is the search query, 'type' determines what to search for

    try {
        switch (type) {
            case 'restaurant':
                // Search for restaurants by name
                const restaurantsByName = await Restaurant.find({
                    name: { $regex: q, $options: 'i' }, // Case insensitive search
                    status: 'approved' // Only include approved restaurants
                });
                res.json(restaurantsByName);
                break;

            case 'menu':
                // Search for menu items
                const restaurantsByMenu = await Restaurant.aggregate([
                    { $match: { status: 'approved' } },
                    { $unwind: "$categories" },
                    { $unwind: "$categories.menuItems" },
                    { $match: { "categories.menuItems.name": { $regex: q, $options: 'i' } } },
                    { $project: { name: 1, "menuItem": "$categories.menuItems" } }
                ]);
                res.json(restaurantsByMenu);
                break;

            case 'categoryName':
                // Search for categories by name within restaurants
                const restaurantsByCategoryName = await Restaurant.aggregate([
                    { $match: { status: 'approved' } },
                    { $unwind: "$categories" },
                    { $match: { "categories.categoryName": { $regex: q, $options: 'i' } } },
                    { $project: { name: 1, category: "$categories" } } // Adjust the projection as needed
                ]);
                res.json(restaurantsByCategoryName);
                break;

            default:
                res.status(400).json({ message: "Invalid search type" });
                break;
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: "Error processing your search", error: error.message });
    }
};


exports.searchMenuItemsInRestaurant = async (req, res) => {
    const { restaurantId, q } = req.query; // Extracting from query parameters

    if (!restaurantId || !q) {
        return res.status(400).json({ message: "Restaurant ID and search query are required." });
    }

    try {
        // Using aggregation to filter and project menu items only if the restaurant is approved
        const results = await Restaurant.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(restaurantId), status: 'approved' } },
            { $unwind: "$categories" },
            { $unwind: "$categories.menuItems" },
            { $match: { "categories.menuItems.name": { $regex: q, $options: 'i' } } },
            { $project: { name: 1, menuItem: "$categories.menuItems" } }
        ]);

        if (results.length === 0) {
            return res.status(404).json({ message: "Restaurant not found, not approved, or no menu items match your query." });
        }

        res.json(results);
    } catch (error) {
        console.error('Error searching menu items:', error);
        res.status(500).json({ message: "Error retrieving menu items", error: error.message });
    }
};