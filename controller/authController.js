const User = require('../model/userModel');
const authService = require('../services/authService');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Assuming you've configured environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'amritaeats@gmail.com',
        pass: 'siidmxqmumqilifr',
    },
});

let tempUsers = {}; // Temporary storage for user details during OTP verification

exports.register = async (req, res) => {
    const { username, password, email, phoneNo, name } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { phoneNo }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Generate OTP for phone verification
        const phoneOtp = await authService.sendOTP(phoneNo);

        // Generate a 6-digit OTP for email verification and its expiry
        const emailVerificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const emailOtpExpires = new Date(new Date().getTime() + 10*60000); // 10 minutes from now

        // Create the user with the OTP and its expiry time
        const newUser = await User.create({
            username, 
            password, 
            email, 
            phoneNo,
            name, 
            emailVerified: false,
            emailVerificationOtp,
            emailOtpExpires
        });

        // Prepare and send the verification email with OTP
        let mailOptions = {
            from: 'amritaeats@gmail.com',
            to: newUser.email,
            subject: 'Verify Your Email',
            html: `<p>Your OTP for email verification is: <b>${emailVerificationOtp}</b></p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Failed to send verification email.', error: error.message });
            }
            console.log('Verification email sent: ' + info.response);
        });

        // Store user details temporarily for phone verification
        tempUsers[phoneNo] = { username, name: username, email, phoneNo, otpSent: true };

        res.status(200).json({ message: 'OTP sent for phone and email verification.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user.', error: error.message });
    }
};


exports.login = async (req, res) => {
  try {
    const { phoneNo } = req.body;

    // Check if the user exists
    let user = await User.findOne({ phoneNo });
    if (!user) {
      return res.status(404).json({ message: 'User not found, please sign up.' });
    }

    // User found, send OTP
    const otp = await authService.sendOTP(phoneNo);

    // Indicate that the OTP was sent
    tempUsers[phoneNo] = { ...tempUsers[phoneNo], otpSent: true };

    res.json({ message: 'OTP sent. Verify OTP to log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in.', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await User.findByIdAndUpdate(decoded.userId, { emailVerified: true });
      res.send("Email verified successfully. You can now login.");
    } catch (error) {
      res.status(400).send("Invalid or expired verification link.");
    }
  };

  exports.verifyEmailOtp = async (req, res) => {
    const { email, emailVerificationOtp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.emailVerificationOtp !== emailVerificationOtp || user.emailOtpExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        user.emailVerified = true;
        user.emailVerificationOtp = undefined;
        user.emailOtpExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying email.', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNo, otp } = req.body;

    // Verify OTP
    const isValidOTP = await authService.verifyUserOTP(phoneNo, otp);
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid OTP provided.' });
    }

    // Check if the user details are stored temporarily
    if (tempUsers[phoneNo] && tempUsers[phoneNo].otpSent) {
      let user = await User.findOne({ phoneNo });

      if (!user) {
        // New user, create in the database
        const { username, name, email } = tempUsers[phoneNo];
        user = new User({ username, name, email, phoneNo, verified: true });
        await user.save();
      } else {
        // Existing user, update verified status
        user.verified = true;
        await user.save();
      }

      // Remove user details from temporary storage
      delete tempUsers[phoneNo];

      // Proceed with creating a session or token for the user
      const token = authService.createUserSession(user);

      res.json({ message: 'OTP verified. User logged in.', token });
    } else {
      res.status(400).json({ message: 'No OTP request found. Please initiate login/signup process again.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying OTP.', error: error.message });
  }
};
