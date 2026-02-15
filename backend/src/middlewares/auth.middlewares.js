import jwt from "jsonwebtoken";
import httpStatus from "http-status";

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if(!token){
    return res.status(httpStatus.UNAUTHORIZED).json({message: "Access denied"});
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (err) {
    res.status(httpStatus.OK).json({msg: "Invalid token"})
  }
}

export default verifyToken;