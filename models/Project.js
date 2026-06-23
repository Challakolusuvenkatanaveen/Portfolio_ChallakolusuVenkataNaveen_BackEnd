const mongoose = require("mongoose");

const projectSchema =
new mongoose.Schema(
{
  title:{
    type:String,
    required:true
  },

  description:{
    type:String
  },

  technologies:[
    String
  ],

  githubUrl:{
    type:String
  },

  liveUrl:{
    type:String
  },

  image:{
    type:String
  }
},
{
 timestamps:true
}
);

module.exports =
mongoose.model(
 "Project",
 projectSchema
);