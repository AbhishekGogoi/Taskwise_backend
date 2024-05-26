module.exports = (app) => {
  const auth = require("../controllers/auth.controller");
  const { verifySignUp } = require("../middleware");

  var router = require("express").Router();

  // Sign up a new user with validation checks
  router.post(
    "/auth/signup",
    [
      verifySignUp.checkRequiredFields,
      verifySignUp.checkDuplicateUsernameOrEmail,
    ],
    auth.signup
  );

  // Sign in an existing user
  router.post("/auth/signin", auth.signin);

  // Sign out the user
  router.post("/auth/signout", auth.signout);

  app.use("/api", router);
};
