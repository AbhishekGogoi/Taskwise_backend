module.exports = (app) => {
    const workspaceController = require("../controllers/workspace.controller.js");
    const memberController = require("../controllers/member.controller.js");

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
    router.patch("/:workspaceId/deactivate", workspaceController.deactivateWorkspace);

    // Get all members of a Workspace
    router.get("/:workspaceId/members", memberController.getWorkspaceMembers);

    // Add member of a Workspace
    router.post('/:workspaceId/members', memberController.addMemberToWorkspace);

    // Get all projects of a Workspace
    router.get("/:workspaceId/projects", memberController.getWorkspaceProjects);

    // Get all tasks of a Workspace
    router.get("/:workspaceId/tasks", memberController.getWorkspaceTasks);

    // Get all workspaces of a User
    router.get("/user/:userId/workspaces", memberController.getAllWorkspacesByUserId);

    // Get all projects of a User
    router.get("/user/:userId/projects", memberController.getAllProjectsByUserId);

    // Get all tasks of a User
    router.get("/user/:userId/tasks", memberController.getAllTasksByUserId);

    app.use("/api/workspaces", router);
};
