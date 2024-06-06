require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("./utils/passport");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const uploadController = require("./controllers/upload.controller");
const db = require("./models");

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// use of cookieParser
app.use(cookieParser());

// use of express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }, // Set secure to true in production when using HTTPS
  })
);

// use of Passport middleware
app.use(passport.initialize());
app.use(passport.session());

if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.S3_BUCKET ||
  !process.env.MONGODB_URL
) {
  console.error("Environment variables not set properly.");
  process.exit(1);
}

db.mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use("/api/upload", uploadController);
// Import routes
require("./routes/project.routes")(app);
require("./routes/workspace.routes")(app);
require("./routes/auth.routes")(app);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "TaskWise API",
      version: "1.0.0",
      description:
        "TaskWise is a task management API that allows users to manage workspaces, projects, tasks efficiently.",
    },
    servers: [{ url: "http://localhost:8080" }],
  },
  apis: ["./controllers/*.js", "./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`TaskWise Server is running on port ${PORT}`);
});
