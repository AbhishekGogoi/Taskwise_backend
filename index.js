const express = require("express");
const connectDB = require("./config/db.config");

const app = express();
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const PORT = 8080;
app.listen(PORT, () => {
  console.log("Server is running on port 8080");
});
app.get("/", (req, res) => {
  return res.status(204).send("Welcome to BookStore Application");
});

//  Connect to MongoDB
connectDB();
