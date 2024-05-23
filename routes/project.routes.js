module.exports = (app) => {
    const project = require("../controllers/project.controller.js");

    var router = require("express").Router();

    // Create a new Project
    router.post("/projects", project.create);

    app.use("/api", router);
};
