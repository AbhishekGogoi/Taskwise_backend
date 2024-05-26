module.exports = (app) => {
    const workspaceController = require("../controllers/workspace.controller.js");

    var router = require("express").Router();

    // Create a new Workspace
    router.post("/", workspaceController.create);

    // Get all Workspaces
    router.get("/", workspaceController.getAllWorkspaces);

    // Get Workspace by ID
    router.get("/:workspaceId", workspaceController.getWorkspaceById);

    // Update Workspace by ID
    router.put("/:workspaceId", workspaceController.updateWorkspace);

    // Deactivate (soft delete) Workspace by ID
    router.put("/:workspaceId/deactivate", workspaceController.deactivateWorkspace);

    // Get all members of a Workspace
    router.get("/:workspaceId/members", workspaceController.getWorkspaceMembers);

    // Get all projects of a Workspace
    router.get("/:workspaceId/projects", workspaceController.getWorkspaceProjects);

    // Get all tasks of a Workspace
    router.get("/:workspaceId/tasks", workspaceController.getWorkspaceTasks);

    app.use("/api/workspaces", router);
};
