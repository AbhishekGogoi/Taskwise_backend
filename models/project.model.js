const { default: mongoose } = require("mongoose");

module.exports = mongoose => {
    var schema = new mongoose.Schema({
        name: { type: String, required: true },
        description: String,
        // workSpaceId:{
        //                 type: mongoose.Schema.Types.ObjectId,
        //                 ref: 'Workspace',
        //                 required: true
        //             },
        // tasks:[{
        //             type: mongoose.Schema.Types.ObjectId,
        //             ref: 'Task',
        //             required: true
        //        }],
        // createdBy:{
        //             type: mongoose.Schema.Types.ObjectId,
        //             ref: 'User',
        //             required: true
        //         }
    },
        { timestamps: true }
    );
    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });


    const Project = module.exports = mongoose.model('Project', schema);
    return Project;
}

