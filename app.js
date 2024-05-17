// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const path = require('path');
// const mongoose = require('mongoose');
// const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// // Import routes and controllers
// const authRoutes = require('./routes/authRoutes');
// const profileRoutes = require('./routes/profileRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const cartRoutes = require('./routes/cartRoutes');
// const restaurantOwnerRoutes = require('./routes/restaurantOwnerRoutes');
// const locationRoutes = require('./routes/locationRoutes');
// const uploadRoutes = require('./routes/uploadRoutes');
// const chargeRoutes = require('./routes/chargeRoutes');
// const searchRoutes = require('./routes/searchRoutes');
// const orderRoutes = require('./routes/orderRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
// const { stripe, calculateTotalAndInitiatePayment, checkPaymentStatusPeriodically } = require('./controller/orderController');

// // Initialize express app
// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// app.use(cookieParser());

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/grabFoodDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.error(err));

// // Define routes
// app.use('/api/auth', authRoutes);
// app.use('/api/profile', profileRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/admin', adminRoutes);
// app.use('/api/owners', restaurantOwnerRoutes);
// app.use('/api/location', locationRoutes);
// app.use('/api/charges', chargeRoutes);
// app.use('/api', uploadRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/search', searchRoutes);
// app.use('/api/restaurants', restaurantOwnerRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/orders', orderRoutes); // Order management routes

// // Make the io instance available in other modules
// app.set('socketio', io);

// io.on('connection', (socket) => {
//   console.log('A user connected');
//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

// // Listen on the defined PORT or default to 3000
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const restaurantOwnerRoutes = require('./routes/restaurantOwnerRoutes');
const locationRoutes = require('./routes/locationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const chargeRoutes = require('./routes/chargeRoutes');
const searchRoutes = require('./routes/searchRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/paymentRoutes');
const orderController = require('./controller/orderController');
const cors = require('cors');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

app.use('/api/orders', orderRoutes); // Order management routes

// Make the io instance available in other modules
app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User with ID ${userId} connected to room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use(cors());
// Middlewares
app.use(cookieParser()); // For parsing cookies

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/grabFoodDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

app.use(express.json());
// Define routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/profile', profileRoutes); // Profile management routes
app.use('/api/cart', cartRoutes); // Cart functionality routes
app.use('/admin', adminRoutes); // Admin-specific routes
app.use('/api/owners', restaurantOwnerRoutes); // Routes for restaurant owners

app.use('/api/location', locationRoutes);
app.use('/api/charges', chargeRoutes);
app.use('/api', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/restaurants', restaurantOwnerRoutes);
app.use('/api/payments', paymentRoutes);

// Listen on the defined PORT or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
