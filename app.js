require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const restaurantOwnerRoutes = require('./routes/restaurantOwnerRoutes');
const orderRoutes = require('./routes/orderRoutes'); // Ensure this path is correct
const locationRoutes = require('./routes/locationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const chargeRoutes = require('./routes/chargeRoutes');
const searchRoutes = require('./routes/searchRoutes');
const cors = require('cors');




// Initialize express app
const app = express();


app.use(cors());

// Middlewares
app.use(express.json()); // For parsing application/json
app.use(cookieParser()); // For parsing cookies


// Connect to MongoDB
//'mongodb+srv://reddyjaiaws30:O8LrcULswGaslfSy@cluster0.bxv3zjk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect('mongodb://localhost:27017/grabFoodDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

// Define routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/profile', profileRoutes); // Profile management routes
app.use('/api/cart', cartRoutes); // Cart functionality routes
app.use('/admin', adminRoutes); // Admin-specific routes
app.use('/api/owners', restaurantOwnerRoutes); // Routes for restaurant owners
app.use('/api/orders', orderRoutes); // Order management routes
// Inside the setup of your express app:
app.use('/api/location', locationRoutes);

// Use the routes in your Express application
app.use('/api/charges', chargeRoutes);

app.use(express.json());
app.use('/api', uploadRoutes);


//search
app.use('/api/search', searchRoutes);

// Listen on the defined PORT or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

