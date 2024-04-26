const Admin = require('../model/Admin'); // Adjust the path as needed
const Owner = require('../model/restaurantOwnerModel'); // Adjust path as needed
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// // Hash a password using Node's crypto module
// function hashPassword(password, salt) {
//   const hashedPassword = crypto.createHmac('sha256', salt).update(password).digest('hex');
//   console.log("Hashed password on registration:", hashedPassword);
//   return hashedPassword;
// }



// // Verify a password against an existing hash
// const verifyPassword = (password, originalHash, salt) => {
//   const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
//   return originalHash === hash;
// };

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}



const verifyPassword = (inputPassword, savedHash, savedSalt) => {
  const inputHash = crypto.pbkdf2Sync(inputPassword, savedSalt, 1000, 64, 'sha512').toString('hex');
  return savedHash === inputHash;
};

// Generate a JWT token for an admin user
const generateToken = (admin) => {
  return jwt.sign({ id: admin._id, role: 'admin' },  process.env.JWT_SECRET, {
    expiresIn: '7d' // Token validity of 7 days 
  });
};

// Registration function for an admin
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists.' });
    }

    // Generate a salt and hash the password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    // Create and save the new admin record
    admin = new Admin({ email, password: hash, salt }); // Make sure password is a string
    await admin.save();

    // Respond with the created admin details (excluding the password and salt)
    res.status(201).json({
      id: admin._id,
      email: admin.email,
      role: 'admin'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering admin', error: error.message });
  }
};


// Login function for an admin
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Verify the provided password against the stored hash and salt
    if (verifyPassword(password, admin.password, admin.salt)) {
      const token = generateToken(admin);
      res.json({
        message: 'Logged in successfully',
        token,
        adminId: admin._id,
        role: admin.role
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login function for a restaurant owner
exports.ownerLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const owner = await Owner.findOne({ email }).select('+salt +password'); // Ensure salt is selected if it's not by default

    if (!owner) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (verifyPassword(password, owner.password, owner.salt)) {
      const token = generateToken(owner);
      res.json({
        message: 'Logged in successfully',
        token,
        ownerId: owner._id,
        role: owner.role
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
