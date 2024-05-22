const db = require("../models");
const Project = db.project;

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
        if (!req.body.name) {
            return res.status(400).send({ message: "Please enter the name field" });
        }
        
        const project = new Project({
            name: req.body.name,
            description: req.body.description,
        });

        const savedProject = await project.save();
        res.send(savedProject);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the project"
        });
    }
};
