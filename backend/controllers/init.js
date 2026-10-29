const path=require("path");
const fs=require("fs").promises;

async function initRepo(){
    const repoPath=path.resolve(process.cwd(),".apnaGit");
    const comitsPath =path.join(repoPath,"commits")

    try {
        await fs.mkdir(repoPath,{recursive:true})
        await fs.mkdir(comitsPath,{recursive:true})
        await fs.writeFile(
            path.join(repoPath,"config.json"),
            JSON.stringify({bucket:"bucket"})
        )
console.log("Repo init")
    } catch (err) {
        console.error("Error init repo")
    }
}

module.exports={initRepo}