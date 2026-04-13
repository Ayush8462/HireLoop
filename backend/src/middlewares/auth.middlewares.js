import jwt from "jsonwebtoken";
import httpStatus from "http-status";

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if(!token){
    return res.status(httpStatus.UNAUTHORIZED).json({message: "Access denied"});
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (err) {
    return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid token"});
  }
}

export default verifyToken;
