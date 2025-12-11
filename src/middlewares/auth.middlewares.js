import User from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asynceHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asynceHandler(async(req,_,next) => {
  try {
    const token = req.cookies?.AccessToken || req.header("Authoriatzation")?.replace("Bearer ","")
  
    if (!token) {
      throw new ApiError(401,"unAuthorised request")
    }
    const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  
    const user = await User.findByIn(decodeToken?._id).select("-password -refreshToken")
  
    if(!user){
      // TODO: discuss about frontent
      throw new ApiError(401,"Invalid Access Token")
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid Access Token")
  }
})