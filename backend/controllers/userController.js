const jwt=require("jsonwebtoken")
const bcrypt=require("bcryptjs")
const {MongoClient, ReturnDocument}=require("mongodb")
const dotenv=require("dotenv")
var ObjectId=require("mongodb").ObjectId

dotenv.config()

const uri=process.env.MONGODB_URI

let client;

async function connectClient() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
        console.log("MongoDB Connected Successfully");
    }
}

async function signup(req,res){
    const {username,password,email}=req.body

    try{
        await connectClient();
        const db=client.db("githubclone")
        const usersCollection = db.collection("users")

        const user=await usersCollection.findOne({username})
        if(user){
            return res.status(400).json({message:"User already exists!"})
        }

        const salt=await bcrypt.genSalt(10)
        const hashPassword=await bcrypt.hash(password,salt)

        const newUser={
            username,
            password:hashPassword,
            email,
            repositories:[],
            followedUsers:[],
            starRepos:[]
        }

        const result = await usersCollection.insertOne(newUser)

        const token=jwt.sign({id:result.insertedId},process.env.JWT_SECRET_KEY,{expiresIn:"1h"})
        res.json({token})   
    }catch(err){
        console.error("Error during signup : ", err.message)
        res.status(500).send("Server error")
    }
}

async function login(req,res){
    const {email,password}=req.body

    try{
        await connectClient()
        const db=client.db("githubclone")
        const usersCollection=db.collection("users")

        const user = await usersCollection.findOne({email})
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        const isMatch=await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"1h"})
        res.json({token,userId:user._id})
    }catch(err){
console.error("Error during login :" , err)
res.status(500).send("Server error")
    }
}

async function getAllUsers(req,res){
    try {
        await connectClient();
        const db=client.db("githubclone")
        const usersCollection=db.collection("users")

        const users=await usersCollection.find({}).toArray()
        res.json(users)
    } catch (err) {
        console.error("Error during fetching : " ,err)
        res.status(500).send("Server error")
    }
}

async function getUserProfile(req,res){
    const currentID=req.params.id

    try {
        await connectClient()
        const db=client.db("githubclone")
        const usersCollection=db.collection("users")

        const user=await usersCollection.findOne({
            _id:new ObjectId(currentID)
        })

        if(!user){
            res.status(400).json({message:"User not found!"})
        }
        res.send(user)
    } catch (err) {
        console.error("Error during fetching : ",err )
        res.status(500).send("Server error")
    }


}
async function updateUserProfile(req, res) {
    const currentID = req.params.id;
    const { email, password } = req.body;

    try {
        await connectClient();

        const db = client.db("githubclone");
        const usersCollection = db.collection("users");

        let updateFields = {};

        if (email) {
            updateFields.email = email;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashPassword;
        }

        const result = await usersCollection.findOneAndUpdate(
            { _id: new ObjectId(currentID) },
            { $set: updateFields },
            { returnDocument: "after" }
        );

        if (!result) {
            return res.status(404).json({
                message: "User not found!"
            });
        }

        res.status(200).json(result);

    } catch (err) {
        console.error("Error during Updating:", err);
        res.status(500).send("Server error");
    }
}

async function deleteUserProfile(req,res){
    const currentID=req.params.id

    try {
    await connectClient()
    const db=client.db("githubclone")
    const usersCollection=db.collection("users")

    const result=await usersCollection.deleteOne({
        _id:new ObjectId(currentID)
    })

    if(result.deleteCount==0){
        return res.status(500).json({message:"User not found!"})
    }
    res.json()
    } catch (err) {
        console.error("Error during delete : ",err.message)
        res.status(500).send("Server error!")
    }
}


module.exports={
    getAllUsers,
    signup,
    login,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
}