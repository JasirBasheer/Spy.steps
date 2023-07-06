const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },  
  token: {
    type: String,
    default:''
  },
  block: {
    type: Boolean,
    default: false
  },
  address:[{
    fullName:{type:String,required:true},
    number:{type:Number,required:true},
    house:{type:String,required:true},
    street:{type:String,required:true},
    landMark:{type:String},
    city:{type:String,required:true},
    state:{type:String,required:true},
    pincode:{type:Number,required:true}
  }],

  wishlist:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Product'
  }],

  wallet:{
    type : Number,
    default: 0
  }
});

module.exports = mongoose.model("User", userSchema);
