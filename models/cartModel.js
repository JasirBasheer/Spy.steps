const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId : {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  products : [{
    productId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity:{
      type: Number,
      required: true
    },
    /*price:{
      type:Number,
      required: true
    }*/
  }],
  couponId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Coupon'
  },
  isCouponApplied:{
    type:Boolean,
    default:false
  }
})

module.exports = mongoose.model('Cart',cartSchema);