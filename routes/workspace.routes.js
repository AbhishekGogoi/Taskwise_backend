module.exports = (app) => {
    const workspace = require("../controllers/workspace.controller.js");

    var router = require("express").Router();

    // Create a new Workspace
    router.post("/workspaces", workspace.create);

    // Get all Workspaces
    router.get("/workspaces", workspace.getAllWorkspaces);

    app.use("/api", router);
};
