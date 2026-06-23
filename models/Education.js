const mongoose =
require("mongoose");

const educationSchema =
new mongoose.Schema({

 instituteName:{
  type:String,
  required:true
 },

 degree:{
  type:String,
  required:true
 },

 fieldOfStudy:{
  type:String
 },

 startYear:{
  type:String
 },

 endYear:{
  type:String
 },

 percentage:{
  type:String
 }

},{
 timestamps:true
});

module.exports =
mongoose.model(
 "Education",
 educationSchema
);