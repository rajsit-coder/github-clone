const yargs = require("yargs");
const {hideBin} =require("yargs/helpers")

const {initRepo}=require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

yargs(hideBin(process.argv))
.command("start","Starts a new server",{},startServer)
.command('init',"Init repo",{},initRepo)
.command("add <file>",'Add a file to repo',(yargs)=>{
    yargs.positional("file",{ 
        describe:"File to add to the staging area",
        type:"String",
    })
},
(argv)=>{
    addRepo(argv.file)
}
)
.command("commit <message>","commit the stagged file",(yargs)=>{
    yargs.positional("message",{
describe:"Commit message",
type:"String",
    })
},
(argv)=>{
    commitRepo(argv.message)
}
)
.command("push","push commits",{},pushRepo)
.command("pull","pull commits",{},pullRepo)
.command("revert <commitID>","Revert to a specific commit",(yargs)=>{
    yargs.positional("commitID",{
        describe:"Comit ID to revert to",
        type:"String",
    })
},
(argv)=>{
    revertRepo(argv.commitID)
}
)
.demandCommand(1,"You need atleast one command")
.help().argv;

function startServer(){
    console.log("Server logic Called")
}