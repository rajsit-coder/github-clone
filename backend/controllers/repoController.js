const mongoose=require("mongoose")
const Repository=require("../models/repoModel")
const Issue=require("../models/issueModel")
const User=require("../models/userModel")

const createRepository =async (req,res)=>{
    const {owner,name,issues,content,description,visibility}=req.body

    try {
        if(!name){
            return res.status(400).json({error:"Repository name is required!"})
        }

        if(!mongoose.Types.ObjectId.isValid(owner)){
            return res.status(400).json({error:"Invalid User ID!"})
        }

        const newRepository=new Repository({
            name,
            description,
            visibility,
            owner,
            content,
            issues
        })

        const result=await newRepository.save();

        res.status(201).json({
            message:"Repository created!",
            repositoryID:result._id
        })
    } catch (err) {
        console.error("Error during repository creation : ",err)
        res.status(500).send("Server error!")
    }
}

const getAllRepositories=async (req,res)=>{
    try {
        const repositories = await Repository.find({}).populate("owner").populate("issues")

        res.json(repositories)
    } catch (err) {
        console.error("Error during fetching repository",err)
        res.status(500).send("Server error!")
    }
}

const fetchRepositoryById=async (req,res)=>{
    const {id}=req.params
    try{
    const repository=await Repository.find({_id:id}).populate("owner").populate("issues")

    res.json(repository)
    }catch(err){
        console.error("Error during fetching fetching repository : ",err)
        res.status(500).send("Server error!")
    }
}

const fetchRepositoryByName=async (req,res)=>{
    const {name}=req.params
    try {
        const repository=await Repository.find({name}).populate("owner").populate("issues")
    } catch (err) {
        console.error("Error during fetching repository : ",err)
        res.status(500).send("Server error!")
    }
}

const fetchRepositoryForCurrentUser=async (req,res)=>{
    const userId=req.User

    try {
        const repositories=await Repository.find({owner:userId})

        if(!repositories || repositories.length == 0){
            return res.status(404).json({error:"User repositories not found!"})
        }

        res.json({message:"Repositories found!",repositories})
    } catch (err) {
        console.error("Error during fetching repositories : ",err)
        res.status(500).send("Server error!")
    }
}

const updateRepositoryById=async (req,res)=>{
    const {id}=req.params
    const {content,description}=req.body

    try {
        const repository=await Repository.findById(id)
        if(!repository){
            return res.status(404).json({error:"User repositories not found!"})
        }
        repository.content.push(content)
        repository.description=description

        const updatedRepository=await repository.save()

        res.json({
            message:"Repository updated successfully!",
            repository:updatedRepository 
        })
    } catch (err) {
        console.error("Error during fetching repository : ",err)
        res.status(500).send("Server error!")
    }
}

const toggleVisibilityById=async (req,res)=>{
    const {id}=req.params

    try{
        const repository=await Repository.findById(id)
        if(!repository){
            res.status(404).json({error:"Repository not found!"})
        }

        repository.visibility=!repository.visibility

        const updatedRepository=await repository.save()

        res.json({
            message:"Repository updated successfully!",
            repository:updatedRepository
        })
    }catch(err){
        console.error("Error during toggling repository : ",err)
        res.status(500).send("Server error!")
    }
}

const deleteRepositoryById=async (req,res)=>{
    const {id}=req.params

    try{
        const repository=await Repository.findByIdAndDelete(id)

        if(!repository){
            res.status(404).json({error:"Repository not found!"})
        }

        res.json({message:"Repository deleted successfully"})
    }catch(err){
        console.error("Error during deleting Repository : ",err)
        res.status(500).send("Server error")
    }
}

module.exports={
    createRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoryForCurrentUser,
    updateRepositoryById,
    toggleVisibilityById,
    deleteRepositoryById
}