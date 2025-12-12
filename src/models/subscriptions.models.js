import mongoose,{Schema} from 'mongoose'

const subscriptionSchema = new Schema({
  channel: {
    type: Schema.Types.ObjectId, // one whom subcriber is subscrbing
    ref:"User",
    required: true,
  },
  subscripber:{
    type:Schema.Types.ObjectId, // one who is subscribing 
    ref:"User",
    required:true,
  },
},{timestamps:true}
)


export const Subscription = mongoose.model("Subscription", subscriptionSchema)