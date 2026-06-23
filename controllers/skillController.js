const Skill =
require("../models/Skills");

exports.getSkills =
async(req,res)=>{

 try{

  const skills =
   await Skill.find();

  res.json(skills);

 }catch(error){

  res.status(500).json({
   message:error.message
  });

 }

};

exports.createSkill =
async(req,res)=>{

 try{

  const skill =
   await Skill.create(
    req.body
   );

  res.status(201).json(
   skill
  );

 }catch(error){

  res.status(500).json({
   message:error.message
  });

 }

};

exports.updateSkill =
async(req,res)=>{

 try{

  const skill =
   await Skill.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new:true}
   );

  res.json(skill);

 }catch(error){

  res.status(500).json({
   message:error.message
  });

 }

};

exports.deleteSkill =
async(req,res)=>{

 try{

  await Skill.findByIdAndDelete(
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