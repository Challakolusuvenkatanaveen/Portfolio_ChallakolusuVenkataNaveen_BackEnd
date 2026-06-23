exports.uploadProfile =
async(req,res)=>{

 try{

  res.status(200).json({

   success:true,

   imageUrl:
   `http://localhost:5000/uploads/profile/${req.file.filename}`

  });

 }catch(error){

  res.status(500).json({

   message:error.message

  });

 }

};