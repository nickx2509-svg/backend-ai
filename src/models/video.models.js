import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideoSchema = new Schema(
  {


    videoOwner:{
      type:Schema.Types.ObjectId,
      ref:"User",
    },
    videoFile:{
      type:String, //Cloundinary URL
      required:true
    },
    thumbnail:{
      type:String,  //Cloundinary URL
      required:true,
    },
    title:{
      type:String,
      required:true,
      index:true, 
    },
    description:{
      type:String,
      required:true,
      minlength:20,
      trim:true,
    },
    isPublished:{
      type:Boolean,
      required:true,
      default:true
    },
    duration:{
      type:Number, // Cloundinary URL Send Duration of video
      required:true,
    },
    views:{
      type:Number,
      default:0,
    },

  },
  {
    timestamps:true
  }
)
VideoSchema.plugin(mongooseAggregatePaginate)
const Video = mongoose.model("Video",VideoSchema)
export default Video