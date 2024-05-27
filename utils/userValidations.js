const Joi = require("joi");
const db = require("../models");
const UserModel = db.user;

const userRegisterValidate = async (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).alphanum().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }

  try {
    // Check for duplicate username
    const existingUserByUsername = await UserModel.findOne({
      username: value.username,
    });
    if (existingUserByUsername) {
      return res
        .status(400)
        .json({ message: "Failed! Username is already in use!" });
    }

    // Check for duplicate email
    const existingUserByEmail = await UserModel.findOne({ email: value.email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ message: "Failed! Email is already in use!" });
    }

    // No duplicates found, proceed to the next middleware
    next();
  } catch (err) {
    console.error("Error checking for duplicates:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const userLoginValidate = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).alphanum().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};
module.exports = { userRegisterValidate, userLoginValidate };
