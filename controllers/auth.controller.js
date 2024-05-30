const db = require("../models");
const UserModel = db.user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
   *
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
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User is already registered" });
    }

    //2.create userModel
    const userModel = new UserModel({ username, email, password });
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
      const jwtToken = jwt.sign(tokenObject, process.env.SECRET, {
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
            return res
              .status(500)
              .send({
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
        const token = jwt.sign({ id: user._id }, process.env.SECRET);
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
        const token = jwt.sign({ id: newUser._id }, process.env.SECRET);
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
};
