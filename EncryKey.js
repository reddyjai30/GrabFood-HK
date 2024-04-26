const crypto = require('crypto');

// Generate a 256-bit (32-byte) secure random key
const ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

console.log(ENCRYPTION_KEY);
