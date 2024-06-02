const { string } = require("joi");
const { default: mongoose } = require("mongoose");

// Define Task schema
const taskSchema = new mongoose.Schema({
    taskName: { type: String },
    isActive: { type: Boolean, default: true },
    deactivatedAt: { type: Date },
    content: { type: String },
    assigneeUserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to user
    dueDate: { type: Date },
    priority: { type: String },
    attachments:[{ type: String}],
}, { timestamps: true });

// Define Column schema
const columnSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    deactivatedAt: { type: Date },
    taskIds: [{ type: String}]
}, { timestamps: true });

module.exports = mongoose => {
    // Define Project schema
    const projectSchema = new mongoose.Schema({
        name: { type: String, required: true },
        description: String,
        imgUrl: { type: String, required: true, default: 'https://img.freepik.com/free-vector/hand-drawn-minimal-background_23-2149001650.jpg'},
        workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
        order: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Column' }],
        columns: [{ type: columnSchema}],
        tasks: [{ type: taskSchema }],
        isActive: { type: Boolean, default: true },
        deactivatedAt: { type: Date },
        creatorUserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    }, { timestamps: true });

    projectSchema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Project = mongoose.model('Project', projectSchema);
    return Project;
}
