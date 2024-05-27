const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose => {
    var schema = new mongoose.Schema({
      username: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
    },
        { timestamps: true }
    );
    schema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });


    const User = module.exports = mongoose.model('User', schema);
    return User;
}

