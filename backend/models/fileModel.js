const mongoose = require("mongoose");
const { Schema } = mongoose;

const FileSchema = new Schema(
    {
        filename: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            default: "",
        },
        repository: {
            type: Schema.Types.ObjectId,
            ref: "Repository",
            required: true,
        },
    },
    { timestamps: true }
);

const File = mongoose.model("File", FileSchema);
module.exports = File;
