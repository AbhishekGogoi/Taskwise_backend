const dbConfig=require("../config/db.config");
const mongoose=require("mongoose");

const db={};
db.mongoose=mongoose;
db.url=dbConfig.url;
db.projects=require("./projects.model")(mongoose);

module.exports=db;