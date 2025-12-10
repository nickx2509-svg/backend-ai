import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SALT_ROUNDS = 10

const userSchema = new mongoose.Schema(
    {
  username:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true
   },
   email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true
   },
    fullName:{
    type:String,
    required:true,
    trim:true,
    index:true
   },
    avatar:{
    type:String,// cloundinary URL
    required:true,
   },
   coverImage:{
    type:String, // cloundinary URL
   },
   watchHistory:[
    {
      type:Schema.Types.ObjectId,
      ref:"Video"
    }
   ],
   password:{
    type:String,
    required:[true,'Password is required'],
    select:false
   },
   refreshToken:{
    type:String,
   },
},{timestamps:true})


/*  HASH PASSWORD */

userSchema.pre("save", async function (next){
  if (!this.isModified('password')) {
    return next()
  } else {
    this.password = await bcrypt.hash(this.password,SALT_ROUNDS);
    next();
  }
} )


/* CHECK PASSWORD */

userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password,this.password)
  
}


/*  ACCESS TOKEN */

userSchema.methods.generateAccessToken = async function(){
  jwt(
    {
    _id:this._id,
    username:this.username,
    email:this.email,
    fullName:this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    },
  )
},

/*  REFRESH TOKEN */
userSchema.methods.generateRefreshToken = async function(){
  jwt.sign(
    {
      _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )

}

const User = mongoose.model("User",userSchema)
export default User