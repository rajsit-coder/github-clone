const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
        },
        repositories: [
            {
                type: Schema.Types.ObjectId,
                ref: "Repository",
            },
        ],
        followedUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        starRepos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Repository",
            },
        ],
    },
    { timestamps: true }
);

// Never return the password hash in any JSON response
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
