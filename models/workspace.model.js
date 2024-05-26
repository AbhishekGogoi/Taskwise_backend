const mongoose = require("mongoose");

module.exports = mongoose => {
    const workspaceSchema = new mongoose.Schema({
        name: { type: String, required: true, unique: true },
        description: { type: String },
        imgUrl: { type: String, required: true },
        projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
        // creatorUserID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        isActive: { type: Boolean, default: true },
        members: [{
            // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            role: { type: String, enum: ['Admin', 'Member'], required: true },
            joinedAt: { type: Date, default: Date.now }
        }]
    }, { timestamps: true });

    workspaceSchema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const Workspace = mongoose.model('Workspace', workspaceSchema);
    return Workspace;
}
