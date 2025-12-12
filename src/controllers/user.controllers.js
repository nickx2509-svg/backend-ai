import { asynceHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import  User  from "../models/user.models.js"
import { uploadOnCloundinary } from "../utils/cloundinary.js"
import { ApiResponce } from "../utils/apiResponce.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const AccessToken = await user.generateAccessToken()
    const refreshToken =  await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {refreshToken , AccessToken}

  } catch (error) {
    throw new ApiError(500,"Something went wrong while saving refresh and access tokens")
  }
}
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
  const loginUser = asynceHandler(async(req,res) => {
    // req.body -- data
    //validate it 
    //check it with old email and password
    //give to them refresh token
    // access token adn refresh token serve to user
    // send it into secure cookies
    // return responce successfully login

    const{ email,password,username} = req.body;
   if ((!email && !username) || !password) {
  throw new ApiError(400, "Email/Username and Password are required");
}


    const user = await User.findOne({
      $or:[{ email },{ username }]
    }).select("+password")

    if (!user) {
      throw new ApiError(400,"User is not defined do sign up")
    }
    

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
      throw new ApiError(401,"Password is incorrect")
    }


    const {refreshToken,AccessToken} =  await generateAccessAndRefreshTokens(user._id)

    const loggesUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )

    const options = ({
      httpOnly:true,
      secure:true,
    })
    return res
    .status(200)
    .cookie("accessToken",AccessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponce(200,
        {
          user:loggesUser,AccessToken,refreshToken
        },
        "User Logged in successfully"
      )
    )

     })
    const logoutUser = asynceHandler(async(req,res) => {
      // clear the cookie of the user when login out 
      //  and clear the refresh token
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $set:{
            refreshToken:undefined
          }
        },
        {
          new:true
        },
      )
      const options = {
          httpOnly:true,
          secure:true,
        }
        return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
          new ApiResponce(200,{},"User logout successfully")
        )
    })
    

    const refreshAccessToken = asynceHandler(async(req,res) => {
      // Acess through cookie of resfreh token
      const incomingRefreshtoken = req.cookies.refreshToken || req.body.refreshToken

      if (!incomingRefreshtoken) {
        throw new ApiError(401,"UnAuthorised request")
      }
      const decodedToken = jwt.verify(
        incomingRefreshtoken,
        process.env.REFRESH_TOKEN_SECRET
      )
      const user = await User.findById(decodedToken?._id)

      if (!user) {
        throw new ApiError(401,"Invaliad refresh token")
      }

      if(incomingRefreshtoken !== user?.refreshToken) {
        throw new ApiError(401,"Request Token is expired")
      }
      
      const option ={
        httpOnly:true,
        secure:true,
      }
      const {AccessToken,RefreshToken} = await generateAccessAndRefreshTokens(user._id)

      return res.status(200)
      .cookie("accessToken",AccessToken,option)
      .cookie("refreshToken",RefreshToken,option)
      .json(
        new ApiResponce(
          200,
          {AccessToken,RefreshToken},
          "AccessToken Refreshed Successfully"
        )
      )

    })


    const changeCurrectPassword = asynceHandler(async(req,res) => {
      const {oldPassword,newPassword} = req.body

      const user = await User.findById(req.user?._id)

      const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

      if (!isPasswordCorrect) {
        throw new ApiError(400,"Password is incorrect")
      }

      user.password = newPassword
      await user.save({validateBeforeSave:false})

      return res.status(200).json(
        new ApiResponce(200, {},"Password Change SuccessFully")
      )

    })

    const getCurrentUser = asynceHandler(async(req,res) => {
      return res.status(200).json(
        200,
        req.user,
        "Current user Fetch successfully",
      )
    })
 

    const updateUserDetail = asynceHandler(async(req,res) => {
      const {fullName,email,password,username} = req.body

      if (!fullName||!email||!password||!username) {
        throw new ApiError(400,"All filed Are required")
      }

     const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          fullName:fullName,
          email:email,
          password,
          username,
        }
      },
      {new:true}
    
    ).select("-password")

    return res.status(200)
    .json(
      new ApiResponce(
        200,
        user,
        "Account Detail Updated SuccessFully"
      )
    )

    })

    const updateUserAvatar = asynceHandler(async(req,res) => {

      const avatarLocalPath = req.file?.path


      if(!avatarLocalPath){
        throw new ApiError(401,"Avatar file is missing.")
      }
     const avatar = await uploadOnCloundinary(avatarLocalPath)

     if(!avatar.url){
      throw new ApiError(401,"Error While uploading on cloundianry")
     }

     const UpdateAvatar = await User.findByIdAndUpdate(
      req.user?._id,
     { 
      $set:{
        avatar:avatar.url
      }},
      {
        new:true
      }.select("-password")
     )

     return res.status(200)
      .json(
       new ApiResponce(
         200,
        UpdateAvatar,
        "File updated SuccessFullt"
       )
      )
    })

    const updateUserCoverImage = asynceHandler(async(req,res) => {
      const coverImageLocalpath = await req.file?.path

      if(!coverImageLocalpath){
        throw new ApiError(401,"CoverImage not found")
      }

      const coverImage = await uploadOnCloundinary(coverImageLocalpath)

      if(!coverImage.url){
        throw new ApiError("Something went wrong while uploading on cloundinary")
      }
      const update = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set:{
            coverImage:coverImage.url
          },
        },
        {new:true}
      ).select("-password")

      return res.status(200)
      .json(
       new ApiResponce( 200,
        update,
        "CoverImage change successfullt")
      )
    })

    const getUserChannelProfie = asynceHandler(async(req,res) => {
      const {username} =  req.params
      if(!username){
        throw new ApiError(401,"Username is missing")
      }

      const channel = await User.aggregate([



        {
          $match:{
            username: username?.toLowerCase()
          }
        },


        {
          $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"Subscribers"
          }
        },

        {
          $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscripber",
            as:"SubscribersTo"
          }
        },

        {
          $addFields:{
             subscriberCount: {
              $size:"$Subscribers"
             },
             subcribeToCount:{
              $size:"$SubscribersTo"
             },
             isSubcribed:{
              $cond:{
                if:{$in:[request.user?._id,"Subscribers.subscripber"]},
                then: true,
                else: false,
              }
             }
          }
        },


        {
          $project:{
            fullName:1,
            username:1,
            subscriberCount:1,
            subcribeToCount:1,
            isSubcribed:1,
            avatar:1,
            coverImage:1,
            email:1,


          }
        }
      ])

       if (!channel?.length){
          throw new ApiError(401,"channel doesn't exist")
        }
        return res.status(200).json(
          new ApiResponce(
            200,
            channel[0],
            "User channel fetched successfully"
          )
        )
    })

    const getWatchHistory = asynceHandler(async(req,res) => {
      const user = await aggregate([
        {
          $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
          }
        },
        {
          $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as: "watchHistory",
            pipeline:[
              {
                $lookup:{
                  from:"users",
                  localField:"videoOwner",
                  foreignField:"_id",
                  as: "owner",
                  pipeline:[
                    {
                      $project:{
                        fullName:1,
                        username:1,
                        avatar:1,
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          $addFields:{
            owner:{
              $first: "$owner"
            }
          }
        }
      ])

      return res.status(200)
      .json(
        new ApiResponce(
          200,
          user[0].watchHistory,
          "Watch History Fetched Successfully"
        )
      )
    })




export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrectPassword,getCurrentUser,updateUserDetail,updateUserAvatar,updateUserCoverImage ,getUserChannelProfie,getWatchHistory}

 