const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    requried: true,
  },
  category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Category',
    required:true
  },
  /*category:{
    type: String,
    required: true,
  },*/
  image: {
    type: Array,
    //required: true,
  },
  /*images: {
    type: Array,
    required: true
  }, */ 
  price: {
    type: Number,
    required: true,
  },
  noOfStocks: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  block: {
    type: Boolean,
    default: false
  },
  reviews:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Review'
  }]
});

module.exports = mongoose.model("Product", productSchema);
