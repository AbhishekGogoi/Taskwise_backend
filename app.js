const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const passportSetup = require("./utils/passport");
require("dotenv").config();

const app = express();
const db = require("./models");

var corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(express.json());

// use of cookieParser
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true in production when using HTTPS
  })
);

app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
db.mongoose
  .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.log(err);
    process.exit();
  });

// Import routes
require("./routes/project.routes")(app);
require("./routes/workspace.routes")(app);
require("./routes/auth.routes")(app);

const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "TaskWise API",
      version: "1.0.0",
      description:
        "TaskWise is a task management API that allows users to manage workspaces, projects, tasks efficiently.",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
  },
  apis: ["./controllers/*.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Define port and start server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`TaskWise Server is running on port ${PORT}`);
});
