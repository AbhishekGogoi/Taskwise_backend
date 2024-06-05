const db = require("../models");
const Project = db.project;
const Workspace = db.workspace;
const Column=db.Column;
const mongoose=require("mongoose")

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   post:
 *     summary: Add a new task to a project
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskName:
 *                 type: string
 *               content:
 *                 type: string
 *               columnId:
 *                 type: string
 *               assigneeUserID:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *               status:
 *                 type: string
 *                 enum: [To Do, In Progress, Done]
 *             example:
 *               taskName: "New Task"
 *               content: "Task content here"
 *               columnId: "columnId1"
 *               assigneeUserID: "userId123"
 *               dueDate: "2023-12-31"
 *               priority: "High"
 *               status: "To Do"
 *     responses:
 *       201:
 *         description: Task added successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Project or column not found
 *       500:
 *         description: Internal server error
 */
exports.addTaskToProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const { taskName, content, columnId, assigneeUserID, dueDate, priority,comments,createdBy,attachments } = req.body;

        // Validate priority and status
        const validPriorities = ['Low', 'Medium', 'High'];
        const validStatuses = ['To Do', 'In Progress', 'Done'];

        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({ message: `Invalid priority value. Allowed values are: ${validPriorities.join(', ')}` });
        }

        // if (status && !validStatuses.includes(status)) {
        //     return res.status(400).json({ message: `Invalid status value. Allowed values are: ${validStatuses.join(', ')}` });
        // }

        // Find the project by ID
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Find the workspace containing the project
        const workspace = await Workspace.findOne({ projects: projectId });
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found for the project" });
        }

        // If an assignee is provided, check if they are a member of the workspace
        if (assigneeUserID) {
            const isMember = workspace.members.some(member => 
                member.user.equals(new mongoose.Types.ObjectId(assigneeUserID)) && member.isActive
            );
            if (!isMember) {
                return res.status(400).json({ message: "Assignee must be a member of the workspace" });
            }
        }
        // if (createdBy) {
        //     const isMember = workspace.members.some(member => 
        //         member.user.equals(new mongoose.Types.ObjectId(createdBy)) && member.isActive
        //     );
        //     if (!isMember) {
        //         return res.status(400).json({ message: "Assignee must be a member of the workspace" });
        //     }
        // }

        // Find the column by ID within the project
        const column = project.columns.id(columnId);
        if (!column) {
            return res.status(404).json({ message: "Column not found in the project" });
        }

        // Create a new task with all the details
        const newTask = {
            taskName,
            content,
            assigneeUserID: assigneeUserID ? assigneeUserID : null,
            dueDate,
            priority,
            comments,
            createdBy,
            attachments
            //status: columnId, // To Do, In Progress, Done, etc.

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

        res.status(201).json({ taskId: newTaskId, project: savedProject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}:
 *   put:
 *     summary: Update a task in a project
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskName:
 *                 type: string
 *               content:
 *                 type: string
 *             example:
 *               taskName: "Updated Task Name"
 *               content: "Updated content here"
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Project or task not found
 *       500:
 *         description: Internal server error
 */
exports.updateTaskInProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const taskId = req.params.taskId;
        const { taskName, content,assignees,priority,dueDate,comments } = req.body;

        // Find the project by ID
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        

        // Find the task within the project's tasks array
        const task = project.tasks.id(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found in the project" });
        }

        // Update the task with the new data
        if (taskName) task.taskName = taskName;
        if (content) task.content = content;
        if (assignees) task.assigneeUserID=assignees;
        if(priority) task.priority=priority;
        if(dueDate) task.dueDate=dueDate;
        if(comments) task.comments=comments;
        // Save the project with the updated task
        await project.save();

        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/deactivate:
 *   patch:
 *     summary: Deactivate a task from a project
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deactivated successfully
 *       404:
 *         description: Project or task not found
 *       500:
 *         description: Internal server error
 */
exports.deactivateTaskInProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const taskId = req.params.taskId;

        // Find the project by ID
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Find the task within the project's tasks array
        const task = project.tasks.id(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found in the project" });
        }

        // Deactivate the task by setting isActive to false
        task.isActive = false;
        task.deactivatedAt= new Date()        

        // Find and deactivate the task in all columns
        project.columns.forEach(column => {
            const taskIndex = column.taskIds.indexOf(taskId);
            if (taskIndex !== -1) {
                column.taskIds.splice(taskIndex, 1);
            }
        });

        // Save the project with the updated task
        await project.save();

        res.status(200).json({ message: "Task deactivated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
