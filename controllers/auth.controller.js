const db = require("../models");
const UserModel = db.user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Function to generate a random 4-digit code for forgot passowrd
function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Configure nodemailer transporter for sending emails for forgot password
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization endpoints
 */

module.exports = {
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               imgKey:
   *                 type: string
   *               imgUrl:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     _id:
   *                       type: string
   *                     username:
   *                       type: string
   *                     email:
   *                       type: string
   *
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 err:
   *                   type: object
   */

  registerUser: async (req, res) => {
    // Validate request body
    const { username, email, password, imgKey, imgUrl } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User is already registered" });
    }

    //2.create userModel
    const userModel = new UserModel({ username, email, password, imgKey, imgUrl });
    //3.do password encryption
    userModel.password = await bcrypt.hash(password, 10);
    //4.save data to mongodb
    try {
      const response = await userModel.save();
      response.password = undefined;
      return res.status(201).json({ message: "sucessfull", data: response });
    } catch (err) {
      return res.status(500).json({ message: "error", err: err });
    }
  },

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login a user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 jwtToken:
   *                   type: string
   *       401:
   *         description: Invalid email or password
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 error:
   *                   type: object
   */

  loginUser: async (req, res) => {
    //1.check user using email
    //2.compare password
    //3.create jwt token
    //4.send response to client
    const { email, password } = req.body;

    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isPassEqual = await bcrypt.compare(password, user.password);
      if (!isPassEqual) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const tokenObject = {
        _id: user._id,
        username: user.username,
        email: user.email,
      };
      const jwtToken = jwt.sign(tokenObject, process.env.JWT_SECRET, {
        expiresIn: "1h",
      }); //1 hour

      //set the cookie
      res.cookie("access_token", jwtToken, {
        httpOnly: true, // Make the cookie HTTP only, so it's not accessible via JavaScript
        maxAge: 3600000, // 1 hour
      });

      return res.status(200).json({ jwtToken: jwtToken, user: tokenObject });
    } catch (err) {
      return res.status(500).json({ message: "error", error: err });
    }
  },

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout a user
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: User signed out successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */

  signOutUser: (req, res) => {
    try {
      req.logout((err) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .send({ message: "An error occurred during signout." });
        }

        req.session.destroy((err) => {
          if (err) {
            console.error(err);
            return res.status(500).send({
              message: "An error occurred while destroying the session.",
            });
          }

          res.clearCookie("connect.sid"); // Clear the session cookie (typically 'connect.sid')
          res.clearCookie("access_token"); // Clear the JWT token cookie
          return res.status(200).send({ message: "You've been signed out!" });
        });
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send({ message: "An error occurred during signout." });
    }
  },

  googleOAuthSignup: async (req, res, next) => {
    try {
      const profile = req.profile;
      const email = profile.emails[0].value;
      const name = profile.displayName;

      let user = await UserModel.findOne({ email: email });

      if (user) {
        // User already exists, generate JWT token and send response
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const { password, ...userData } = user.toObject();
        const expiryDate = new Date(Date.now() + 3600000); // 1 hour
        if (res && res.cookie) {
          res.cookie("access_token", token, {
            httpOnly: true,
            expires: expiryDate,
          });
        }
        if (res) res.status(200).json(userData);
        else next(null, { ...userData, _id: user._id });
      } else {
        // User doesn't exist, generate random password, create user, generate JWT token, and send response
        let username = name
          ? name.split(" ").join("").toLowerCase() +
            Math.random().toString(36).slice(-8)
          : "defaultUsername" + Math.random().toString(36).slice(-8);
        console.log(username, "username");
        const generatedPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);
        const hashedPassword = bcrypt.hashSync(generatedPassword, 10);
        const newUser = new UserModel({
          username: username,
          email: email,
          password: hashedPassword,
        });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
        const { password, ...userData } = newUser.toObject();
        const expiryDate = new Date(Date.now() + 3600000); // 1 hour
        if (res && res.cookie) {
          res.cookie("access_token", token, {
            httpOnly: true,
            expires: expiryDate,
          });
        }
        if (res) res.status(200).json(userData);
        else next(null, { ...userData, _id: newUser._id });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /api/auth/forgotpassword:
   *   post:
   *     summary: Request a password reset code
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: Reset code sent to email
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 email:
   *                   type: string
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 error:
   *                   type: string
   */

  forgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate a 4-digit code
      const code = generateCode();
      user.resetCode = code;
      user.resetCodeExpiry = Date.now() + 600000; // Code valid for 10 minutes
      await user.save();

      // Send the code to the user's email
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Password Reset Code",
        text: `Your password reset code is: ${code}`,
      };

      await transporter.sendMail(mailOptions);

      res
        .status(200)
        .json({ message: "Reset code sent to email", email: email });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error sending reset code", error: err.message });
    }
  },

  /**
   * @swagger
   * /api/auth/verification:
   *   post:
   *     summary: Verify a password reset code
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - code
   *             properties:
   *               email:
   *                 type: string
   *               code:
   *                 type: string
   *     responses:
   *       200:
   *         description: Reset code verified
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       400:
   *         description: Invalid or expired reset code
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 error:
   *                   type: string
   */

  verifyResetCode: async (req, res) => {
    const { email, code } = req.body;
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate the code
      if (user.resetCode !== code || Date.now() > user.resetCodeExpiry) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset code" });
      }

      res.status(200).json({ message: "Reset code verified" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error verifying reset code", error: err.message });
    }
  },

  /**
   * @swagger
   * /api/auth/resendotp:
   *   post:
   *     summary: Resend the password reset code
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: Reset code resent to email
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 email:
   *                   type: string
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 error:
   *                   type: string
   */

  resendOTP: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate a new 4-digit code
      const code = generateCode();
      user.resetCode = code;
      user.resetCodeExpiry = Date.now() + 600000; // Code valid for 10 minutes
      await user.save();

      // Send the code to the user's email
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Password Reset Code",
        text: `Your new password reset code is: ${code}`,
      };

      await transporter.sendMail(mailOptions);

      res
        .status(200)
        .json({ message: "Reset code resent to email", email: email });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error resending reset code", error: err.message });
    }
  },

  /**
   * @swagger
   * /api/auth/resetpassword:
   *   post:
   *     summary: Reset the user's password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - code
   *               - newPassword
   *             properties:
   *               email:
   *                 type: string
   *               code:
   *                 type: string
   *               newPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password reset successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       400:
   *         description: Invalid or expired reset code
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 error:
   *                   type: string
   */

  resetPassword: async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate the code
      if (user.resetCode !== code || Date.now() > user.resetCodeExpiry) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset code" });
      }

      // Update the password
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetCode = undefined; // Clear the reset code and expiry
      user.resetCodeExpiry = undefined;
      await user.save();

      res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error resetting password", error: err.message });
    }
  },
};
