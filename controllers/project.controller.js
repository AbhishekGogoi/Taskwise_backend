const db = require("../models");
const Project = db.project;
const Workspace = db.workspace;
const Column=db.Column;
const mongoose=require("mongoose")
/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags:                          
 *       - Project   
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               name: "Project Name"
 *               description: "Project Description"
 *     responses:
 *       200:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
exports.create = async (req, res) => {
    try {
        const { name, description, workSpaceId, order, columns, tasks } = req.body;
        // const workspace = await Workspace.findById(workSpaceId);
        // if (!workspace) {
        //     return res.status(404).send({ message: "Workspace not found" });
        // }
        if (!name) {
            return res.status(400).send({ message: "Please enter the name field" });
        }
        let defaultColumns = [];
        if (!columns || columns.length === 0) {
            defaultColumns = [
                { title: "To Do", taskIds: [] },
                { title: "In Progress", taskIds: [] },
                { title: "Done", taskIds: [] }
            ];
        }

        const project = new Project({
            name, description, workSpaceId, order, columns:defaultColumns, tasks
        });
        await project.save();

        const columnIds = project.columns.map(column => column._id);

      
        project.order = columnIds;

      
        await project.save();

        const savedProject = await project.save();
        res.status(201).send(savedProject);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the project"
        });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).send({ message: "Project not found" });
        }
        res.status(200).send(project)
    } catch (error) {
        res.status(500).send(error);
    }
}
exports.updateProjectById = async (req, res) => {
    try {
        const { name, description, order, columns, tasks } = req.body;
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { name, description, order, columns, tasks },
        )
        if (!project) {
            return res.status(404).send({ message: "Project not found" });
        }
        res.send(project);
    } catch (error) {
        res.status(500).send(error)
    }
}
exports.deleteProjectById = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).send({ message: "Project not found" });
        }
        res.send({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).send(error);
    }
};

// Add a new column to a project
exports.addColumnToProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { title } = req.body;

        // Find the project by ID
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        // Create a new column
        const newColumn = {
            title: title,
            taskIds: [] // Assuming initially no taskIds
        };
         // Add the new column to the project's columns array
         project.columns.push(newColumn);

         // Save the project to update the database
         const savedProject = await project.save();
 
         // Get the _id of the newly created column
         const newColumnId = savedProject.columns[savedProject.columns.length - 1]._id;
 
         // Add the new column's ID to the order array
         savedProject.order.push(newColumnId);
 
         // Save the project again to update the order array
         const updatedProject = await savedProject.save();
 
         // Respond with the updated project
         res.status(201).json(updatedProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.updateColumn = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const columnId = req.params.columnId;
        const { title, taskIds } = req.body;

        // Find the project by ID
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Find the column within the project
        const column = project.columns.id(columnId);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }

        // Update the column properties
        if (title) column.title = title;
        if (taskIds) column.taskIds = taskIds;

        // Save the updated project
        const updatedProject = await project.save();

        res.status(200).json(updatedProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteColumn = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const columnId = req.params.columnId;
        // Find the project by ID
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Find the index of the column to be deleted
        const columnIndex = project.columns.findIndex(column => column._id.toString() === columnId);
        if (columnIndex === -1) {
            return res.status(404).json({ message: "Column not found" });
        }

        // Remove the column from the project
        project.columns.splice(columnIndex, 1);

        // Remove the column ID from the order array
        const orderIndex = project.order.indexOf(columnId);
        if (orderIndex !== -1) {
            project.order.splice(orderIndex, 1);
        }

        // Save the project
        await project.save();

        res.status(200).json({ message: "Column deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

//update column
exports.updateColumnOrder = async (req, res) => {
    console.log("entered")
    try {
        const projectId = req.params.projectId;
        const { order } = req.body;

        // Validate order array
        if (!Array.isArray(order) || order.some(id => !mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: "Order must be an array of valid column IDs" });
        }

        // Find the project by ID
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check if all provided column IDs exist in the project
        const allColumnsExist = order.every(id => 
            project.columns.some(column => column._id.equals(id))
        );
        if (!allColumnsExist) {
            return res.status(404).json({ message: "One or more columns not found" });
        }

        // Update the order of columns
        project.order = order;

        // Save the updated project
        const savedProject = await project.save();

        res.status(200).json({ message: "Column order updated successfully", project: savedProject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.addTaskToProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { taskName, content, columnId } = req.body;

        // Find the project by ID
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Find the column by ID within the project
        const column = project.columns.id(columnId);
        if (!column) {
            return res.status(404).json({ message: "Column not found in the project" });
        }

        // Create a new task
        const newTask = {
            taskName: taskName,
            content: content
        };

        // Add the new task to the project's tasks array
        project.tasks.push(newTask);

        // Save the project with the new task
        const savedProject = await project.save();
        
        // Retrieve the new task ID
        const newTaskId = savedProject.tasks[savedProject.tasks.length - 1]._id;

        // Add the new task ID to the corresponding column's taskIds array
        column.taskIds.push(newTaskId);

        // Save the project again with the updated column
        await savedProject.save();

        res.status(201).json(savedProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
