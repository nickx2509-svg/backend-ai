import { asynceHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js"
import { uploadOnCloundinary } from "../utils/cloundinary.js"
import { ApiResponce } from "../utils/apiResponce.js";

const registerUser = asynceHandler(async(req,res) => {  
  // get user detail from frontent
  // validation - not empty 
  // check if user already exist: username , email
  // check if avatar images exist , and images
  // upload them to cloundinary , check avatar is uploaded
  // create user object  - create entry in db
  // remove password and refresh token field from responce
  // check for user creating 
  // return response

  const {fullName,email,username,password} = req.body

  console.log("name is :",username)

  if(
    [fullName,username,password,email].some((field) => field?.trim() == "")
  ){
    throw new ApiError(400,"All Fields are Required")
  }

  const existedUser = User.findOne({
    $or:[{ username }, { email }]
  })
  if (existedUser) {
    throw new ApiError(409,"username with email or email with username already exist")
  }

  const avatarLocalpath = req.files?.avatar[0]?.path;
  const coverImageLocalpath = req.files?.coverImage[0]?.path

  if (!avatarLocalpath) {
    throw new ApiError(400 ,"Avatar is Required")
  }

  const avatar = await uploadOnCloundinary(avatarLocalpath)
  const coverImage = await uploadOnCloundinary(coverImageLocalpath)

  if (!avatar) {
    throw new ApiError(400 ,"Avatar is Required")
  }

  const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username,
    password
  })
  const userCreated = await User.findById(user._id).select(
    "password -refreshToken"
  )
  if (!userCreated) {
    throw new ApiError(500,"Something went wrong while registering...")
  }

  return res.status(201).json(
    new ApiResponce(200,userCreated,"User register successfully")
  )
   
})

export {registerUser}