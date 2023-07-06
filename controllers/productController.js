const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Review = require("../models/reviewModel");
const { ObjectId } = require("mongodb");

const loadCategories = async(req,res,next)=>{
  let page = 1;
  if(req.query.page){
    page = req.query.page;
  } 
  const limit =6;
  try {    
    const categories = await Category.find({
      block:false}).limit(limit*1).skip((page-1)*limit).exec();
      const count =  await Category.find({
        block:false}).countDocuments();
    const categoryScroll = await Category.find({block:false});
    res.render('users/categories',{
      categories:categories, categoryScroll,
      totalPages: Math.ceil(count/limit),
      currentPage:page,
      previous:page-1,
      next: Number(page)+1,
      limit:limit
    });
  } catch (error) {
    next(error);
  }
} 

const loadCategoryWise = async(req,res,next)=>{
  let search = '';
    if(req.query.search){
      search = req.query.search; 
    }    
    let page = 1;
    if(req.query.page){
      page = req.query.page;
    } 
    const limit = 6;
  try {    
    const categoryId = req.query.id; 
    const products = await Product.find({
      category:categoryId,
      $or:[
        {name:{$regex:'.*'+search+'.*',$options:'i'}},
      ],
    }).limit(limit * 1).skip((page-1)*limit).exec();   
    
    const count = await Product.find({
      category:categoryId,
      $or:[
        {name:{$regex:'.*'+search+'.*',$options:'i'}},
      ],
    }).countDocuments(); 

    const user= req.session.userData;
    const categories = await Category.findOne({_id:categoryId}); 
    const categoryScroll= await Category.find({block:false});
    res.render('users/categorywiseproduct',
      {products:products,
        categories:categories,
        categoryScroll,
        user,totalPages: Math.ceil(count/limit),
        currentPage:page,
        previous:page-1,
        next: Number(page)+1,
        limit:limit,search:search
      });
  } catch (error) {    
    next(error);
  }
}

const loadProducts = async(req,res,next)=>{
  try {
    let search = '';
    if(req.query.search){
      search = req.query.search.trim();
    }    
    let page = 1;
    if(req.query.page){
      page = req.query.page;
    } 
    const categoryId = req.query.category; 
    const limit = 9;
    const sortBy = req.query.sortBy;
    let sortQuery = {};

    if(req.query.sortBy){
      if(req.query.sortBy === 'lowprice'){
        sortQuery = { price: 1 };
      } else if(req.query.sortBy === 'highprice'){
        sortQuery = { price: -1 };
      }
    }
    let filterQuery = {};
    if (search) {
      filterQuery.$or = [{ name: { $regex: search, $options: "i" } }];
    } else {
      filterQuery.$or = [];
    }
    if (categoryId) {
      filterQuery.category = categoryId;       
    } else {
      filterQuery.category = {
        $nin: await Category.find({ block: true }).distinct('_id'), 
      }; 
    }
   
    const products = await Product.find(filterQuery)
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.find(filterQuery).countDocuments();
    const user = req.session.userData;
    const categories = await Category.find({ block: false });

    res.render('users/products', {
      categories: categories,
      user: user,
      sortBy,categoryId,
      products: products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      previous: page - 1,
      next: Number(page) + 1,
      limit: limit,
      search: search, 
    });
  } catch (error) {
    next(error);
  }
};

const loadSingleProduct = async(req,res,next)=>{
  try {
    const user = req.session.userData;
    const id= req.query.id;
    const product = await Product.findOne({_id:id}).populate('reviews'); 
    const reviews = await Review.find({product:product._id}).populate('user');
    const findRating = product.reviews;
    const totalRating = reviews.reduce((acc, cur) => acc + cur.rating, 0);
    const averageRating = totalRating / reviews.length; 
    const categories = await Category.findOne({_id:product.category}); 
    const categoryScroll = await Category.find({block:false});
    const relatedProducts = await Product.find({category:categories._id});
    const index = relatedProducts.findIndex((product)=>product._id.toString()===req.query.id);
    if(index!==-1){
      relatedProducts.splice(index,1);
    }     
    res.render('users/singleproduct',
      {categories:categories,
      product:product,user:user,
      categoryScroll, 
      relatedProducts,
      reviews,averageRating,
    });
  } catch (error) {
    next(error);
  }
}

const loadAddReview = async(req,res,next)=>{
  try {
    const id=req.query.id;
    const product = await Product.findOne({_id:id}); 
    const user = await User.findOne({_id:req.session.userData._id});          
    const order= await Order.findOne({customer:user._id,'items.product':product._id,'orderStatus':"Delivered"}); 
      if(!order){
        return res.render('users/sorrypage');
      }     
    res.render('users/addreview',{product});
  } catch (error) {
    next(error);
  }
}

const addReview = async(req,res,next)=>{
  try {   
    const product = await Product.findOne({_id:req.body.id}).populate('category'); 
    const user = await User.findOne({_id:req.session.userData._id});     
    const existingReview = await Review.findOne({product:product._id,user:user._id});    

    const order= await Order.findOne({customer:user._id,'items.product':product._id,'orderStatus':"Delivered"});      
    if (!order) {
      return res.render('users/sorrypage', {product}); // Render the sorry page
    }
    if(existingReview){
      res.render('users/addreview',{product,message:'You have already reviewed this product.'});
    }
    else{ 
      const review = new Review({
        product:req.body.id,
        user:req.session.userData._id,
        rating:req.body.rating,
        reviewTitle:req.body.reviewTitle,
        comment:req.body.review
      });
      const reviewData = await review.save(); 
      if(reviewData){
        await Product.updateOne(
          {_id:req.body.id},
          {$push:{reviews:reviewData._id}}
        );
        res.redirect(`/singleproduct?id=${product._id}`);
      }
      else{
        res.render('users/addreview',{message:'Review added Failed'});
      }
    }
  } catch (error) {
    next(error);
  }
}

module.exports={
  loadCategories,loadCategoryWise,
  loadProducts,loadSingleProduct,
  loadAddReview,addReview,
}