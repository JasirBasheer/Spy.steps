const User=require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const { findById } = require("../models/userModel");

const loadWishlist = async(req,res,next)=>{
  try {
    const user= await User.findById(req.session.userData._id);
    const wishlistProducts = await Product.find({_id:user.wishlist}); 
    const categories = await Category.find({block:false});    
    res.render('users/wishlist',{categories, wishlistProducts,user});
  } catch (error) {
    next(error);
  }
}

const addWishlist = async(req,res,next)=>{
  try {
    const {productId} = req.body;
    const userId = req.session.userData._id;
    const user = await User.findByIdAndUpdate(
      {_id:userId},
      {$addToSet:{wishlist:productId}},
      {new:true}
    );
    res.json({wishlist: user.wishlist}); // Return only the wishlist items
  } catch (error) {
    next(error);
    res.status(500).json({message: "Error adding product to wishlist!"});
  }
}
const removeWishlist = async(req,res,next)=>{
  try {
    const {productId,index} = req.body;
    const userId = req.session.userData._id;
    const updatedUser = await User.findByIdAndUpdate(
      {_id:userId},
      {$pull:{wishlist:productId}},
      {new:true}
    );
    if(!updatedUser){
      throw new Error('Error removing the product from the wishlist!');
    }
    const wishlistProducts = updatedUser.wishlist;
    res.json({wishlistProducts,message:"Product removed from the wishlist"});
  } catch (error) {
    next(error);
    res.status(500).json({message:"Server error"});
  }
}

module.exports={
  loadWishlist,
  addWishlist,
  removeWishlist
}