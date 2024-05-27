const { default: mongoose } = require("mongoose");

// Define Task schema
const taskSchema = new mongoose.Schema({
    taskName: { type: String },
    content: { type: String}
});

// Define Column schema
const columnSchema = new mongoose.Schema({
    title: { type: String, required: true },
    taskIds: [{ type: String}]
});

module.exports = mongoose => {
    // Define Project schema
    const projectSchema = new mongoose.Schema({
        name: { type: String, required: true },
        description: String,
        workSpaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true
        },
        order: [{ type: String }],
        columns: [{ type: columnSchema}],
        tasks: [{ type: taskSchema }],
        // createdBy: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',
        //     required: true
        // }
    }, { timestamps: true });

    projectSchema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Project = mongoose.model('Project', projectSchema);
    return Project;
}
