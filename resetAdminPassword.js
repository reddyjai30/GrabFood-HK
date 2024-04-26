// Reset the admin password script (This is a one-time script, not part of your application code)
const bcrypt = require('bcryptjs');
const Admin = require('./model/Admin'); // Adjust the path as needed
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// New plain text password
const newPlainTextPassword = 'newStrongPassword';

bcrypt.hash(newPlainTextPassword, 12, async (err, hashedPassword) => {
  if (err) {
    console.error(err);
    return;
  }

  // Assuming you have only one admin and you know their email
  const email = 'admin@admin.com';
  await Admin.findOneAndUpdate({ email }, { password: hashedPassword });
  
  console.log(`Password for ${email} was reset successfully.`);
  process.exit(); // Exit the script
});
