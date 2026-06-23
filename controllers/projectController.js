const Project =
require("../models/Project");

exports.getProjects =
async(req,res)=>{

 try{

  const projects =
   await Project.find();

  res.json(projects);

 }catch(error){

  res.status(500).json({
   message:error.message
  });

 }

};

exports.createProject =
async(req,res)=>{

 try{

  const project =
   await Project.create(
    req.body
   );

  res.status(201).json(
   project
  );

 }catch(error){

  res.status(500).json({
   message:error.message
  });

 }

};

exports.updateProject =
async(req,res)=>{

 try{

  const project =
   await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new:true}
   );

  res.json(project);

 }catch(error){

  res.status(500).json({
   message:error.message
  });

 }

};

exports.deleteProject =
async(req,res)=>{

 try{

  await Project.findByIdAndDelete(
   req.params.id
  );

  res.json({
   message:"Deleted"
  });

 }catch(error){

  res.status(500).json({
   message:error.message
  });

 }

};