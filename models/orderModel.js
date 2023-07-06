const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,    
    required: true
  },
  items: {
    type: Array,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  isWalletApplied: {
    type:Boolean
  },
  balanceTotal: {
    type: Number
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered','Cancelled','Returned'],
    default: 'Pending'
  },
  payment:{
    type: String,
    default:'Pending'
  }, 
  createdAt: {
    type: Date,
    required:true     
  },
  couponId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Coupon'
  },
  isCouponApplied:{
    type:Boolean
  },
  deliveryDate :{
    type:Date
  }
});
module.exports= mongoose.model('Order',orderSchema);