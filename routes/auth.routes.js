module.exports = (app) => {
  const passport = require("passport");

  const {
    registerUser,
    loginUser,
    signOutUser,
  } = require("../controllers/auth.controller.js");

  const router = require("express").Router();

  // Register a new user
  router.post("/auth/register", registerUser);

  // Login a user
  router.post("/auth/login", loginUser);

  // Logout a user
  router.post("/auth/logout", signOutUser);

  //Google OAuth routes
  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      // Successful authentication, redirect to client
      res.redirect("http://localhost:3000/projects"); // Adjust the URL as needed
    }
  );

  app.use("/api", router);
};
