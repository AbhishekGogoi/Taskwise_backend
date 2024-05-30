module.exports = (app) => {
  const {
    registerUser,
    loginUser,
    signOutUser,
  } = require("../controllers/auth.controller.js");

  // const {
  //   userRegisterValidate,
  //   userLoginValidate,
  // } = require("../utils/userValidations.js");

  //   const { ensureAuthenticated } = require("../utils/auth.js");

  const router = require("express").Router();

  // Register a new user
  router.post("/auth/register", registerUser);

  // Login a user
  router.post("/auth/login", loginUser);

  // Logout a user
  router.post("/auth/logout", signOutUser);

  app.use("/api", router);
};
