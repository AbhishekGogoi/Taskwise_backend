const db=require("../models");
const Projects=db.projects;


exports.create= async(req,res)=>{
    try{
        //validation
        if(!req.body.name){
            return res.status(400).send({ message: "Please enter the name field" });
        }
        //create project instance
        const project=new Projects({
            name:req.body.name,
            description:req.body.description,
        })
        const savedProject=await project.save();
        res.send(savedProject)
    }catch(err){
        res.status(500).send({
            message: err.message || "Some error occurred while creating the project"
        })
    }
}