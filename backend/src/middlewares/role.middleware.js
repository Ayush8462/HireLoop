import httpStatus from "http-status";

const rolestatus = (...roles)=>{
  return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
      return res.status(httpStatus.UNAUTHORIZED).json({msg:"Access denied"});
    }
    next();
  };
};
export default rolestatus;