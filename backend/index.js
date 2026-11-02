const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

dotenv.config();

yargs(hideBin(process.argv))
    .command("start", "Starts the API server", {}, startServer)
    .command("init", "Initialize a new apnaGit repository", {}, initRepo)
    .command(
        "add <file>",
        "Add a file to the staging area",
        (yargs) => {
            yargs.positional("file", {
                describe: "File to add to the staging area",
                type: "string",
            });
        },
        (argv) => {
            addRepo(argv.file);
        }
    )
    .command(
        "commit <message>",
        "Commit the staged files",
        (yargs) => {
            yargs.positional("message", {
                describe: "Commit message",
                type: "string",
            });
        },
        (argv) => {
            commitRepo(argv.message);
        }
    )
    .command("push", "Push commits to remote (S3)", {}, pushRepo)
    .command("pull", "Pull commits from remote (S3)", {}, pullRepo)
    .command(
        "revert <commitID>",
        "Revert to a specific commit",
        (yargs) => {
            yargs.positional("commitID", {
                describe: "Commit ID to revert to",
                type: "string",
            });
        },
        (argv) => {
            revertRepo(argv.commitID);
        }
    )
    .demandCommand(1, "You need at least one command")
    .help()
    .argv;

function startServer() {
    const app = express();
    const port = process.env.PORT || 3000;

    // ── Middleware ──────────────────────────────
    app.use(
        cors({
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
        })
    );

    app.use(express.json());

    // ── Routes ─────────────────────────────────
    app.use("/", mainRouter);

    // ── Database ───────────────────────────────
    const mongoURI = process.env.MONGODB_URI;

    mongoose
        .connect(mongoURI)
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.error("Unable to connect to MongoDB:", err));

    // ── HTTP + Socket.IO Server ────────────────
    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        socket.on("joinRoom", (userID) => {
            socket.join(userID);
        });
    });

    httpServer.listen(port, () => {
        console.log(`Server is running on PORT ${port}`);
    });
}
