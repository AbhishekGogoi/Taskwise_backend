const db = require("../models");
const Workspace = db.workspace;

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
 *             example:
 *               name: "Workspace Name"
 *               description: "Workspace Description"
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
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * 
 *   get:
 *     summary: Get all workspaces
 *     tags:
 *       - Workspace
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
 *       500:
 *         description: Internal server error
 */
exports.create = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).send({ message: "Please enter the name field" });
        }
        
        const workspace = new Workspace({
            name: req.body.name,
            description: req.body.description,
        });

        const savedWorkspace = await workspace.save();
        res.send(savedWorkspace);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the workspace"
        });
    }
};

exports.getAllWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find();
        res.status(200).send(workspaces);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving workspaces"
        });
    }
};
