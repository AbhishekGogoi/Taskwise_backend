const db = require("../models");
const Workspace = db.workspace;
const User = db.user;

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members:
 *   post:
 *     tags:
 *       - Member
 *     summary: Add a member to a workspace
 *     description: Add a member to a workspace.
 *     parameters:
 *       - name: workspaceId
 *         in: path
 *         description: ID of the workspace to add a member to
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberEmail:
 *                 type: string
 *                 description: Email of the member to add to the workspace
 *               role:
 *                 type: string
 *                 description: Role of the member (optional)
 *             example:
 *               memberEmail: "abc@email.com"
 *               role: "Admin or Member"
 *     responses:
 *       200:
 *         description: Successfully added member to the workspace
 *         schema:
 *           $ref: "#/definitions/Workspace"
 *       400:
 *         description: Invalid workspace ID or member Email
 *       404:
 *         description: Workspace not found or User not found
 *       500:
 *         description: Error adding member to workspace
 */
exports.addMemberToWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { memberEmail, role } = req.body;

        // Check if workspaceId is a valid ObjectId
        if (!isValidObjectId(workspaceId)) {
            return res.status(400).send({ message: "Invalid workspace ID" });
        }

        // Find the workspace by its ID
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).send({ message: "Workspace not found" });
        }

        // Find the user by Email
        const user = await User.findOne({ email: memberEmail });
        if (!user) {
            return res.status(404).send({ message: `User with Email ${memberEmail} not found` });
        }

        // Check if the member is already in the workspace
        const existingMember = workspace.members.find(member => member.user.toString() === user._id.toString());
        if (existingMember) {
            return res.status(400).send({ message: `Member with Email ${memberEmail} already in workspace` });
        }

        // Add the member to the workspace
        workspace.members.push({
            user: user._id,
            role: role || 'Member', // Default to 'Member' if role is not provided
            isActive: true,
            joinedAt: new Date()
        });

        // Update the workspace and send the updated workspace object in the response
        workspace.updatedAt = new Date();
        const updatedWorkspace = await workspace.save();
        res.status(200).send(updatedWorkspace);
    } catch (err) {
        // Log the error
        console.error("Error adding member to workspace:", err);
        // Send a generic error message to the client
        res.status(500).send({ message: "Error adding member to workspace" });
    }
};

/**
 * @swagger
 * /api/workspaces/{workspaceId}/members:
 *   get:
 *     summary: Retrieve all members of a workspace
 *     tags:
 *       - Member
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userID:
 *                     type: string
 *                   role:
 *                     type: string
 *                   joinedAt:
 *                     type: string
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal server error
 */
exports.getWorkspaceMembers = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        if (!isValidObjectId(workspaceId)) {
            return res.status(400).send({ message: "Invalid workspace ID" });
        }
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).send({ message: "Workspace not found" });
        }
        res.status(200).send(workspace.members);
    } catch (err) {
        console.error("Error retrieving workspace members:", err);
        res.status(500).send({ message: "Error retrieving workspace members" });
    }
};

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects:
 *   get:
 *     summary: Retrieve all projects of a workspace
 *     tags:
 *       - Member
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal server error
 */
exports.getWorkspaceProjects = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        if (!isValidObjectId(workspaceId)) {
            return res.status(400).send({ message: "Invalid workspace ID" });
        }
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).send({ message: "Workspace not found" });
        }
        res.status(200).send(workspace.projects);
    } catch (err) {
        console.error("Error retrieving workspace projects:", err);
        res.status(500).send({ message: "Error retrieving workspace projects" });
    }
};

/**
 * @swagger
 * /api/workspaces/{workspaceId}/tasks:
 *   get:
 *     summary: Retrieve all tasks of a workspace
 *     tags:
 *       - Member
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal server error
 */
exports.getWorkspaceTasks = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        if (!isValidObjectId(workspaceId)) {
            return res.status(400).send({ message: "Invalid workspace ID" });
        }
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).send({ message: "Workspace not found" });
        }
        res.status(200).send(workspace.tasks);
    } catch (err) {
        console.error("Error retrieving workspace tasks:", err);
        res.status(500).send({ message: "Error retrieving workspace tasks" });
    }
};

/**
 * @swagger
 * /api/workspaces/user/{userId}/workspaces:
 *   get:
 *     summary: Retrieve all workspaces where the user is a member
 *     tags:
 *       - Member
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of workspaces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   imgUrl:
 *                     type: string
 *       404:
 *         description: No workspaces found for this user
 *       500:
 *         description: Internal server error
 */
exports.getAllWorkspacesByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate userId
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find all workspaces where the user is a member
        const workspaces = await Workspace.find({
            "members.user": userId,
            "members.isActive": true
        });

        if (workspaces.length === 0) {
            return res.status(404).json({ message: "No workspaces found for this user" });
        }

        // Map workspaces to the response format
        const response = workspaces.map(workspace => ({
            id: workspace._id,
            name: workspace.name,
            imgUrl: workspace.imgUrl
        }));

        // Respond with the list of workspaces
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

/**
 * @swagger
 * /api/workspaces/user/{userId}/projects:
 *   get:
 *     summary: Retrieve all projects of all workspaces where the user is a member
 *     tags:
 *       - Member
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   workspaceName:
 *                     type: string
 *                   imgUrl:
 *                     type: string
 *       404:
 *         description: No workspaces or projects found for this user
 *       500:
 *         description: Internal server error
 */
exports.getAllProjectsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate userId
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find all workspaces where the user is a member
        const workspaces = await Workspace.find({
            "members.user": userId,
            "members.isActive": true
        }).populate('projects');

        if (workspaces.length === 0) {
            return res.status(404).json({ message: "No workspaces or projects found for this user" });
        }

        // Collect and map all projects from the found workspaces
        const projects = workspaces.flatMap(workspace => {
            return workspace.projects.map(project => ({
                id: project._id,
                name: project.name,
                imgUrl: project.imgUrl,
                workspaceName: workspace.name,
                workspaceId: workspace._id
            }));
        });

        // Respond with the list of projects
        res.status(200).json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

/**
 * @swagger
 * /api/workspaces/user/{userId}/tasks:
 *   get:
 *     summary: Retrieve all tasks of all workspaces where the user is a member
 *     tags:
 *       - Member
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   taskName:
 *                     type: string
 *                   dueDate:
 *                     type: string
 *                     format: date-time
 *                   priority:
 *                     type: string
 *                   status:
 *                     type: string
 *                   workspaceName:
 *                     type: string
 *                   projectName:
 *                     type: string
 *       404:
 *         description: No workspaces or projects found for this user
 *       500:
 *         description: Internal server error
 */
exports.getAllTasksByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate userId
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find all workspaces where the user is a member
        const workspaces = await Workspace.find({
            "members.user": userId,
            "members.isActive": true
        }).populate({
            path: 'projects',
            populate: {
                path: 'tasks',
                match: { assigneeUserID: userId }
            }
        });

        if (workspaces.length === 0) {
            return res.status(404).json({ message: "No workspaces or projects found for this user" });
        }

        // Collect and map all tasks from the found workspaces and projects
        const tasks = workspaces.flatMap(workspace => {
            return workspace.projects.flatMap(project => {
                return project.tasks.map(task => ({
                    id: task._id,
                    taskName: task.taskName,
                    dueDate: task.dueDate,
                    priority: task.priority,
                    status: task.status,
                    workspaceName: workspace.name,
                    projectName: project.name
                }));
            });
        });

        // Respond with the list of tasks
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

function isValidObjectId(id) {
    // Check if id is a valid MongoDB ObjectId
    const { ObjectId } = require('mongoose').Types;
    return ObjectId.isValid(id);
}
