const dbConfig=require("../config/db.config");
const mongoose=require("mongoose");

const db={};
db.mongoose=mongoose;
db.url=dbConfig.url;

db.project=require("./project.model")(mongoose);
db.workspace=require("./workspace.model")(mongoose);

module.exports=db;