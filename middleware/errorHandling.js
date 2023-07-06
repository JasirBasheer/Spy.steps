const notFound = (req,res,next)=>{
  const error = new Error('Not Found - ${req.orginalUrl}');
  res.render('404',{layout:false});
  //next(error);
}
const errorHandler = (err,req,res,next)=>{
  const statusCode = res.statusCode === 200 ? 500 :res.statusCode;
  res.render('error',{layout:false}); 
}

module.exports={
  notFound,
  errorHandler
}