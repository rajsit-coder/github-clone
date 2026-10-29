const path = require("path");
const fs = require("fs").promises;

async function addRepo(filePath) {
    
    const repoPath=path.resolve(process.cwd(),".apnaGit")
    const stagingPath = path.join(repoPath,"staging")
    try {
        await fs.mkdir(stagingPath,{recursive:true})
        const fileName = path.basename(filePath)
        await fs.copyFile(filePath,path.join(stagingPath,fileName))
        console.log(`File ${fileName} added to the staging area!`)
    } catch (err) {
        console.error("Error in add repo")
    }
}
module.exports= { addRepo }