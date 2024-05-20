module.exports=app=>{
    const projects=require("../controllers/project.controller");
    const router=require("express").Router();

    //create a new project
    router.post("/",projects.create);



    app.use("/projects", router);
}