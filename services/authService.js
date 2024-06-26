const User = require('../model/userModel');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
// Ensure to replace hardcoded credentials with environment variables in production
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Manually setting the Verify Service SID for debugging purposes
// Replace 'VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' with your actual TWILIO_VERIFY_SID
const verifySid = process.env.TWILIO_VERIFY_SID;

// Send OTP to the provided phone number using Twilio Verify
exports.sendOTP = async (phoneNo) => {
  try {
    const verification = await client.verify.services(verifySid)
      .verifications.create({ to: phoneNo, channel: 'sms' });
    console.log(`OTP sent: ${verification.status}`);
    return verification.status;
  } catch (error) {
    console.error(`Failed to send OTP: ${error}`);
    throw error;
  }
};

// Verify the user's OTP with Twilio Verify
exports.verifyUserOTP = async (phoneNo, otp) => {
  try {
    const verificationCheck = await client.verify.services(verifySid)
      .verificationChecks.create({ to: phoneNo, code: otp });
    console.log(`OTP verification result: ${verificationCheck.status}`);
    return verificationCheck.status === 'approved';
  } catch (error) {
    console.error(`Failed to verify OTP: ${error}`);
    throw error;
  }
};

// Create JWT for user session
exports.createUserSession = (user) => {
    // Create a JWT token that is valid for 7 days
    return jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '7d' });
  };
