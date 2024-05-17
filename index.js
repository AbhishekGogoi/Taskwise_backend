const express = require("express");
const connectDB = require("./config/db.config");

const app = express();
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const PORT = 8080;

// Start the server
app.listen(PORT, () => {
  console.log("Server is running on port 8080");
});

// Connect to MongoDB
connectDB();

// Define routes
app.get("/", (req, res) => {
  return res.status(204).send("Welcome to TaskWise");
});

// Route to print "Welcome to TaskWise" message on API call
app.get("/welcome", (req, res) => {
  return res.send("Welcome to TaskWise!");
});
