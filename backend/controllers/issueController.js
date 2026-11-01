const mongoose=require("mongoose")
const Repository=require("../models/repoModel")
const Issue=require("../models/issueModel")
const User=require("../models/userModel")

const createIssue=async (req,res)=>{
    const {id}=req.params
    const {title,description}=req.body

    try {
        const issue=new Issue({
            title,
            description,
            repository:id
        })

        await issue.save()

        res.status(201).json(issue)
    } catch (err) {
        console.error("Error in creating issue : ",err)
        res.status(500).send("Server error")
    }
}

const updateIssueById=async (req,res)=>{
    const {id}=req.params
    const {title,description,status}=req.body

    try {
        const issue=await Issue.findById(id)

        if(!issue){
            return res.status(404).json({error:"Issue not found!"})
        }

        issue.title=title
        issue.description=description
        issue.status=status

        await issue.save()

        res.json(issue)
    } catch (err) {
        console.error("Error in updating issue : ",err)
        res.status(500).send("Server error")
    }
}

const deleteIssueById=async (req,res)=>{
    const {id} =req.params

    try{
        const issue=await Issue.findOneAndDelete(id)

        if(!issue){
            return res.status(404).json({error:"Issue not found!"})
        }

        res.json({message:"Issue deleted successfully"})
    } catch (err) {
        console.error("Error in deleting issue : ",err)
        res.status(500).send("Server error")
    }
}

const getAllIssues=async (req,res)=>{
    const {id}=req.params
    try {
        const issue=await Issue.find({repository:id})

        if(!issue){
            return res.status(404).json({error:"Issue not found!"})
        }

        res.json(issue)
    } catch (err) {
        console.error("Error in fetching issue : ",err)
        res.status(500).send("Server error")
    }

}

const getIssueById=async (req,res)=>{
        const {id}=req.params
    try {
        const issue=await Issue.findById(id)

        if(!issue){
            return res.status(404).json({error:"Issue not found!"})
        }

        res.json(issue)
    } catch (err) {
        console.error("Error in fetching issue : ",err)
        res.status(500).send("Server error")
    }
}


module.exports={
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById
}