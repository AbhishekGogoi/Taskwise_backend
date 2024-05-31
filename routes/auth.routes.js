module.exports = (app) => {
  const passport = require("passport");

  const {
    registerUser,
    loginUser,
    signOutUser,
    forgotPassword,
    verifyResetCode,
    resetPassword,
  } = require("../controllers/auth.controller.js");

  const router = require("express").Router();

  // Register a new user
  router.post("/auth/register", registerUser);

  // Login a user
  router.post("/auth/login", loginUser);

  // Logout a user
  router.post("/auth/logout", signOutUser);

  //Google OAuth routes
  router.post(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.post(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      // Successful authentication, redirect to client
      res.redirect("http://localhost:3000/projects"); // Adjust the URL as needed
    }
  );

  // Route to handle forgot password (send reset code)
  router.post("/auth/forgotpassword", forgotPassword);

  // Route to handle verification of the reset code
  router.post("/auth/forgotpassword/verification", verifyResetCode);

  // Route to handle resetting the password
  router.post("/auth/forgotpassword/resetpassword", resetPassword);

  app.use("/api", router);
};
