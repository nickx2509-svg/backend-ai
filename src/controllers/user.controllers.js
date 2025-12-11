import { asynceHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import  User  from "../models/user.models.js"
import { uploadOnCloundinary } from "../utils/cloundinary.js"
import { ApiResponce } from "../utils/apiResponce.js"
const registerUser = asynceHandler(async(req,res) => {

   // get user detail from frontent
  // validation - not empty 
  // check if user already exist: username , email
  // check if avatar images exist , and images
  // upload them to cloundinary , check avatar is uploaded
  // create user object  - create entry in db
  // remove password and refresh token field from responce
  // check for user creating response 
  // return response

  const {username,email,fullName,password} = req.body

  if([fullName,username,email,password].some(field => !field?.trim())){
    throw new ApiError(401,"All fileds are required")
  }
  // if (username === ""){
  //   throw new ApiError("All fileds are required")
  // }
  // else if (email === ""){
  //   throw new ApiError("All fileds are required")
  // }
  // else if(fullName === ""){
  //   throw new ApiError("All fileds are required")
  // }
  // else if(password === ""){
  //   throw new ApiError("All fileds are required")
  // }

  const existedUser = await User.findOne({
    $or:[{ username },{ email }]
  })

  if(existedUser){
    throw new ApiError ("with this username or email already exists")
  }

  const avatatLocalpath = req.files?.avatar?.[0]?.path
  const coverImagelocalpath = req.files?.coverImage?.[0]?.path

  if (!avatatLocalpath) {
    throw new ApiError("Avatar is required")
  }
  const avatar = await uploadOnCloundinary(avatatLocalpath)
  const coverImage = coverImagelocalpath? await uploadOnCloundinary(coverImagelocalpath): null;

  if (!avatar) {
    throw new ApiError("Avatar is required")
  }

  const user = await User.create({
    fullName,
    email,
    password,
    username,
    coverImage: coverImage?.url || "",
    avatar:avatar.url,
  })


    

  const userCreated = await User.findById(user._id).select("-password -refreshToken") 
  console.log("BODY",req.body)
  console.log("FILES",req.files)
  return res.status(201).json(
    new ApiResponce(201 ,"User Created Successfully",userCreated)

  
  )
  
  
})


export {registerUser}

 