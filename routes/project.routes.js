module.exports = (app) => {
    const project = require("../controllers/project.controller.js");

    var router = require("express").Router();

    // Create a new Project
    router.post("/projects", project.create);

    //Get a project by id
    router.get("/projects/:id", project.getProjectById);

    // Update a project by ID
    router.put('/projects/:id', project.updateProjectById);

    // Delete a project by ID
    router.delete('/projects/:id', project.deleteProjectById);

   // Route to add a new column to a project
    router.put('/projects/:projectId/columns', project.addColumnToProject);

    // Route to update a column in a project
    router.put('/projects/:projectId/columns/:columnId', project.updateColumn);

    // Route to delete a column from a project
    router.delete('/projects/:projectId/columns/:columnId', project.deleteColumn);

    //Route to change column order
    router.put('/projects/:projectId/order',project.updateColumnOrder)

    app.use("/api", router);
};
