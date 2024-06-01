const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = (mongoose) => {
  var schema = new mongoose.Schema(
    {
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
      imgUrl: {  // Add imgUrl field with default value
        type: String,
        default: function() {
          // Construct the default imgUrl using the username
          return `https://ui-avatars.com/api/?name=${this.username}&background=random`;
        }
      },
    },
    { timestamps: true }
  );
  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const User = mongoose.model("User", schema); // Simplify the export
  return User;
};
