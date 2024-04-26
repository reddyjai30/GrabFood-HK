const Restaurant = require('../model/restaurantModel');

exports.searchMenuItem = async (req, res) => {
    try {
        const searchText = req.query.text;  // Retrieve the search text from query parameter
        if (!searchText) {
            return res.status(400).json({ message: 'Search text is required' });
        }

        // Search only within 'approved' restaurants
        const results = await Restaurant.aggregate([
            { $match: { status: 'approved' } },  // Filter to include only approved restaurants
            { $unwind: '$categories' },          // Unwind the categories array
            { $unwind: '$categories.menuItems' }, // Further unwind the menuItems array inside categories
            {
                $match: {
                    'categories.menuItems.name': {
                        $regex: searchText,    // Use regex to match the searchText with the menu item name
                        $options: 'i'         // Case insensitive search
                    }
                }
            },
            {
                $project: {  // Specify the fields to include in the result
                    restaurantName: '$name',
                    location: '$location',
                    menuItem: '$categories.menuItems'
                }
            }
        ]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No menu items found.' });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Failed to search menu items', error: error.message });
    }
};