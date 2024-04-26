const jwt = require('jsonwebtoken');

exports.createToken = (userId) => {
    // Ensure the payload is consistent throughout the application
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: '7d', // Token expires in 7 days
    });
  };
  
  exports.verifyToken = (token, jwtSecret) => {
    try {
      // Use the provided secret to verify the token
      return jwt.verify(token, jwtSecret);
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  };
  

exports.refreshToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1]; // Extract the token from cookies or authorization header
  if (!token) return next(); // If no token, continue without modifying it

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newToken = this.createToken(decoded.id); // Create a new token
    // Send the new token back in a cookie
    res.cookie('token', newToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
    req.user = decoded; // Optionally set the user info in request if needed
    next();
  } catch (error) {
    // If there's an error verifying the token, clear the cookie and ask the user to re-login
    res.clearCookie('token');
    return res.status(401).json({ message: 'Please log in again.' });
  }
};
