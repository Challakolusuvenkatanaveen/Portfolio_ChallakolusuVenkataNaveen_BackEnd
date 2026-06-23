const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
{
  skillName:{
    type:String,
    required:true
  },

  percentage:{
    type:Number,
    default:80
  },

  category:{
    type:String,
    default:"Frontend"
  }
},
{
  timestamps:true
}
);

module.exports =
mongoose.model(
 "Skill",
 skillSchema
);