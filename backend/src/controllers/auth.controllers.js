import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  const {name, email, password, role} = req.body;

  try {
    const user = await User.findOne({email});
    if(user) {
      return res.status(httpStatus.FOUND).json({message: "User Already Exist"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name, email, password: hashedPassword, role
    });

    await newUser.save();
    res.status(httpStatus.CREATED).json({message: "User Registered Successfully"})
  } catch (err) {
    res.json({message: `Something went wrong ${err}`});
  }
}

const login = async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password){
    return res.status(400).json({message: "Please Provide"});
  }

  try {
    const user = await User.findOne({email});
    if(!user){
      return res.status(httpStatus.NOT_FOUND).json({message: "User not found."})
    }

    let isPasswordCorrect = await bcrypt.compare(password, user.password)

    if(!isPasswordCorrect){
      return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid credentials"})
    }

    const token = jwt.sign(
      {
        id:user._id,
        role:user.role
      },
      process.env.JWT_SECRET,
      {expiresIn:"7d"}
    );

    return res.status(httpStatus.OK).json({token, user});
  } catch (err) {
    res.status(500).json({message: `Something went wrong ${err}`});
  }
}

export { register, login };