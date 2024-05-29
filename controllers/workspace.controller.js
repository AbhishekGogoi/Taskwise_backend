const db = require("../models");
const Workspace = db.workspace;
const User = db.user;

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags:                          
 *       - Workspace   
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
 *               imgUrl:
 *                 type: string
 *               creatorUserId:
 *                 type: string
 *             example:
 *               name: "Unique Workspace Name"
 *               description: "Workspace Description"
 *               imgUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
 *               creatorUserID: "UserId"
 *     responses:
 *       200:
 *         description: Workspace created successfully
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
 *                 imgUrl:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * 
 *   get:
 *     summary: Get all workspaces
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter workspaces by activity status. If not provided, active workspaces will be returned by default.
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
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   imgUrl:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
exports.create = async (req, res) => {
    try {
        const { name, description, imgUrl, creatorUserID } = req.body;
        
        if (!name) {
            return res.status(400).send({ message: "Name field is required" });
        }

        if (!creatorUserID) {
            return res.status(400).send({ message: "Please enter the creator User ID" });
        }

        const user = await User.findById(creatorUserID );

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const workspace = new Workspace({
            name,
            description,
            imgUrl,
            creatorUserID: user._id,
            isActive: true,
            members: [{ 
                user: user._id, 
                role: 'Admin' }] // Adding creator as an admin
        });

        const savedWorkspace = await workspace.save();
        res.status(200).send(savedWorkspace);
    } catch (err) {
        console.error("Error creating workspace:", err);
        res.status(500).send({ message: "Error creating workspace" + err });
    }
};

exports.getAllWorkspaces = async (req, res) => {
    try {
        const { isActive } = req.query;
        let query = {};
        
        // Check if isActive parameter is provided
        if (isActive !== undefined) {
            query.isActive = isActive.toLowerCase() === 'true';
        } else {
            query.isActive = true; // Default to true if isActive parameter is not provided
        }

        const workspaces = await Workspace.find(query);
        res.status(200).send(workspaces);
    } catch (err) {
        console.error("Error retrieving workspaces:", err);
        res.status(500).send({ message: "Error retrieving workspaces" });
    }
};

/**
 * @swagger
 * /api/workspaces/{workspaceId}:
 *   get:
 *     summary: Get workspace details
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace details
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
 *                 imgUrl:
 *                   type: string
 *                 creatorUserID:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update workspace details
 *     tags:
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: workspaceId
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               imgUrl:
 *                 type: string
 *             example:
 *               name: "Updated Workspace Name"
 *               description: "Updated Workspace Description"
 *               imgUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
 *     responses:
 *       200:
 *         description: Workspace updated successfully
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
 *                 imgUrl:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Internal server error
 */
exports.getWorkspaceById = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        if (!isValidObjectId(workspaceId)) {
            return res.status(400).send({ message: "Invalid workspace ID" });
        }
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).send({ message: "Workspace not found" });
        }
        res.status(200).send(workspace);
    } catch (err) {
        console.error("Error retrieving workspace:", err);
        res.status(500).send({ message: "Error retrieving workspace" });
    }
};

exports.updateWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { name, description, imgUrl } = req.body;
        if (!isValidObjectId(workspaceId)) {
            return res.status(400).send({ message: "Invalid workspace ID" });
        }
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).send({ message: "Workspace not found" });
        }

        if (name) workspace.name = name;
        if (description) workspace.description = description;
        if (imgUrl) workspace.imgUrl = imgUrl;
        workspace.updatedAt = new Date();

        const updatedWorkspace = await workspace.save();
        res.status(200).send(updatedWorkspace);
    } catch (err) {
        console.error("Error updating workspace:", err);
        res.status(500).send({ message: "Error updating workspace" });
    }
};

/**
 * @swagger
 * /api/workspaces/{workspaceId}/deactivate:
 *   patch:
 *     summary: Deactivate a workspace
 *     tags: 
 *       - Workspace
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Workspace deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Workspace deactivated successfully
 *       '403':
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: You are not allowed to deactivate this workspace"
 *       '404':
 *         description: Workspace not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Workspace not found
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some error occurred while deactivating the workspace
 */
exports.deactivateWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        if (!isValidObjectId(workspaceId)) {
            return res.status(400).send({ message: "Invalid workspace ID" });
        }
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).send({ message: "Workspace not found" });
        }

        // // Check if the user is admin
        // const userIsAdmin = workspace.members.some(
        //     member => member.userID.toString() === req.userId && member.role === 'Admin'
        // );
        // if (!userIsAdmin) {
        //     return res.status(403).send({ message: "Forbidden: You are not allowed to deactivate this workspace" });
        // }

        workspace.isActive = false;
        workspace.deactivatedAt = new Date();
        await workspace.save();

        res.status(200).send({ message: "Workspace deactivated successfully" });
    } catch (err) {
        console.error("Error deactivating workspace:", err);
        res.status(500).send({ message: "Error deactivating workspace" });
    }
};

function isValidObjectId(id) {
    // Check if id is a valid MongoDB ObjectId
    const { ObjectId } = require('mongoose').Types;
    return ObjectId.isValid(id);
}
