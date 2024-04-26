const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures username is unique across all documents
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email is unique across all documents
  },
  phoneNo: {
    type: String,
    required: true,
    unique: true, // Ensures phone number is unique across all documents
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationOtp: {
    type: String,
    default: '',
  },
  emailOtpExpires: {
    type: Date,
  },
  
  verified: {
    type: Boolean,
    default: false,
  },

  role: {
  type: String,
  enum: ['user', 'owner', 'admin'],
  default: 'user',
  }

});

module.exports = mongoose.model('User', userSchema);
