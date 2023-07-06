require('dotenv').config();
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const bcrypt = require('bcrypt');
const moment = require('moment');
const PDFDocument = require('pdfkit')
const ExcelJS = require('exceljs')
const fs = require('fs');
const path = require('path');

const adminUserName = process.env.ADMINUSERNAME;
const adminPassword = process.env.ADMINPASSWORD;

const loadAdminLogin = async(req,res,next)=>{
  try {
    res.render('admin/adminlogin');
  } catch (error) {    
    next(error);
  }
}

const verifyAdminLogin = async(req,res,next)=>{
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = {
      username : adminUserName,
      password: adminPassword
    }; 
    if(email===adminData.username && password===adminData.password){
      req.session.admin_id = adminData;
      res.redirect('/admin/dashboard');
    }
    else{
      res.render('admin/adminlogin',{message:"Incorrect email or password"});
    }
  } catch (error) {
    next(error);
  }
}
const loadAdminDashboard = async(req,res,next)=>{
  try {
    res.render('admin/admindashboard');
  } catch (error) {
    next(error);
  }
}

const loadChart = async(req,res,next)=>{
  try {
    const startDate = new Date(new Date().getFullYear(),0,1);
    const endDate = new Date(new Date().getFullYear(),11,31,23,59,59,999);
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt :{$gte: startDate, $lte: endDate},
          orderStatus:{$in:['Shipped','Delivered']}
        }
      },
      {
        $group: {
          _id:{
            month: {$month:{$toDate:"$createdAt"}},
            year: {$year:{$toDate:"$createdAt"}}
          },
          totalSales:{$sum:"$totalPrice"},
          totalOrder:{$sum: 1}
        }
      },
      {
        $sort: {'_id.year':1, '_id.month':1}
      }      
    ]);    
    res.json(monthlySales);
  } catch (error) {
    next(error);
  }
}

const loadOrdersChart = async(req,res,next)=>{
  try {
    const startDate = new Date(new Date().getFullYear(),0,1);
    const endDate = new Date(new Date().getFullYear(),11,31,23,59,59,999);
    const pipeline = [
      {
        $match:{
          createdAt:{
            $gte:startDate,
            $lte:endDate
          }
        }
      },
      {
        $group:{
          _id:'$orderStatus',
          count: {$sum:1}
        }
      }
    ];
    const result = await Order.aggregate(pipeline);    
    res.json(result);
  } catch (error) {
    next(error);
  }
}

const loadSalesReport = async(req,res,next)=>{
  try {
    let order;
    if(req.query.startDate && req.query.endDate){      
      const startDate = new Date(req.query.startDate); 
      const endDate = new Date(req.query.endDate); 

      order = await Order.find({
        createdAt:{$gte:startDate,$lte:endDate},
        orderStatus:{$in: ['Shipped','Delivered']}
      }).populate('customer')      
    }
    else{
      order = await Order.find({
        orderStatus:{$in:['Shipped','Delivered']}
      }).populate('customer')
    }
    const total = order.reduce((acc,cur)=> acc + cur.totalPrice , 0);

    order = order.map(order=>({
      ...order.toObject(),
      orderDate: moment(order.createdAt).format('DD/MM/YYYY')
    }))

    res.render('admin/salesreport',{orders:order,total,moment});

  } catch (error) {
    next(error);
  }
}

const loadAddCategory = async(req,res,next)=>{
  try {
    res.render('admin/addcategory');
  } catch (error) {
    next(error);
  }
}
const addCategory =async(req,res,next)=>{
  try { 
    const enteredCategoryName =req.body.categoryName;
    const findCategoryName = await Category.findOne({name:enteredCategoryName});
    if(findCategoryName){
      res.render('admin/addcategory', { message: 'Category is Already Exist' })
    }
    else{    
    const category = new Category({
      name:req.body.categoryName,
      image : req.file.filename
    })
    const categoryData = await category.save();
    if(categoryData){
      res.redirect('/admin/categorylist');
    }else{
      res.render('admin/addcategory',{message:"Category Adding failed"});
    }
  }
  } catch (error) {
    next(error);
  }
}
const loadCategoriesList = async(req,res,next)=>{
  try {
    const categoriesData = await Category.find();
    res.render('admin/categorylist',{categories:categoriesData});
  } catch (error) {
    next(error);
  }
}
const loadEditCategory =async(req,res,next)=>{
  try {
    const id = req.query.id;
    const categoryData = await Category.findById({_id:id}); 
    if (categoryData) {
      res.render('admin/editcategory',{category:categoryData});
    } else {
        res.redirect('/admin/categorylist');
    } 
  } catch (error) {
    next(error);
  }
}

const editCategory = async(req,res,next)=>{
  try {
    const enteredCategoryName =req.body.categoryName;   
    const categoryToUpdate = await Category.findById(req.body.id);
    
    if(categoryToUpdate.name == enteredCategoryName){
      let categoryData = {};
      
      if(req.file){
        categoryData.image = req.file.filename;
      }      
      const updatedCategory = await Category.findByIdAndUpdate(
        {_id:req.body.id},
        {$set:categoryData}
      );
      res.redirect('/admin/categorylist');
      
    }else{      
      const findCategoryName = await Category.findOne({name:enteredCategoryName});      
      if(findCategoryName){
        res.render('admin/editcategory', { message: 'Category is Already Exist', category:categoryToUpdate })
      }
      else{     
        let categoryData = {
          name:req.body.categoryName,
        };        
        if(req.file){
          categoryData.image = req.file.filename;
        }        
        const updatedCategory = await Category.findByIdAndUpdate(
          {_id:req.body.id},
          {$set:categoryData}
        );
        res.redirect('/admin/categorylist');
      }
    }
  } catch (error) {
    next(error);
  }
}

const blockCategory = async(req,res,next)=>{
  try {
    const id = req.body.id;
    const category = await Category.findById(id); 
    if(category.block){
      const categoriesData = await Category.findByIdAndUpdate(id,{$set:{block:false}})
      if(categoriesData){
        res.json('success');
      }
    }else{
      const categoriesData = await Category.findByIdAndUpdate(id,{$set:{block:true}});
      if(categoriesData){
        res.json('success');
      }
    }
  } catch (error) {
    next(error);
  }
}

const loadAddProduct = async(req,res,next)=>{
  try {
    const categoriesData = await Category.find(); 
    res.render('admin/addproduct',{categories:categoriesData});
  } catch (error) {
    next(error);
  }
}


const addProduct = async(req,res,next)=>{
  try {
    const images = req.files.map((file)=>{
      return file.filename;
    })
    const product = new Product({
      name:req.body.productName,
      category:req.body.productCategory,
      image:images,
      price : req.body.productPrice,
      noOfStocks : req.body.productStocks,
      description : req.body.productDescription
    }); 
    const productData = await product.save();
    if(productData){
      res.redirect('/admin/productslist');
    }
    else{
      res.render('admin/addproduct',{message:"Product adding failed"});
    }
    
  } catch (error) {
    next(error);
  }
}
const loadProductsList = async(req,res,next)=>{
  try {
    const productsData = await Product.find();
    const categoriesData = await Category.find();   
    res.render('admin/productslist',{products:productsData,categories:categoriesData});
  } catch (error) {
    next(error);
  }
}

const deleteProductImage = async(req,res,next)=>{
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) {      
      return res.status(404).json({ message: "Product not found" })
    }
    const index = product.image.findIndex(img => img === req.body.image);
    if (index !== -1) {
      product.image.splice(index, 1);
      await product.save();
    }
    res.redirect('/admin/productslist');
  } catch (error) {
    next(error);
  }
}

const loadEditProduct = async(req,res,next)=>{
  try {
    const categoriesData = await Category.find();     
    const id = req.query.id;    
    const productData = await Product.findById({_id:id}); 
    if (productData) {      
      res.render('admin/editproduct',{product:productData,categories:categoriesData});
    } else {
        res.redirect('/admin/productslist');
    }    
  } catch (error) {
    next(error);
  }  
}

const editProduct = async(req,res,next)=>{
  const images = req.files.map((file)=>{
    return file.filename;
  })
  const id = req.query.id;
  const updation = {
    $set:{
      name:req.body.productName,
      category:req.body.productCategory,
      price:req.body.productPrice,
      noOfStocks:req.body.productStocks,
      description:req.body.productDescription
    }
  };
  if(images.length>0){
    updation.$push = { image: { $each: images } };
  }
  try {  
    await Product.updateOne({_id:id},updation);
    res.redirect('/admin/productslist');
  } catch (error) {
    next(error);
  }
}

const blockProduct = async(req,res,next)=>{
  try {
    const id = req.body.id;
    const product = await Product.findById(id); 
    if(product.block){
      const productsData = await Product.findByIdAndUpdate(id,{$set:{block:false}})
      if(productsData){
        res.json('success');
      }
    }else{
      const productsData = await Product.findByIdAndUpdate(id,{$set:{block:true}});
      if(productsData){
        res.json('success');
      }
    }
  } catch (error) {
    next(error);
  }
}

const loadUsersList =async(req,res,next)=>{
  try{    
    const usersData = await User.find();
    res.render('admin/userslist',{users:usersData});
  } catch(error){
     next(error);
  }
}
const blockUser = async(req,res,next)=>{
  try {
    const id = req.body.id;
    const user = await User.findById(id); 
    if(user.block){
      const usersData = await User.findByIdAndUpdate(id,{$set:{block:false}});      
      if(usersData){
        res.json('success'); 
      }
    }else{
      const usersData = await User.findByIdAndUpdate(id,{$set:{block:true}});
      if(usersData){
        req.session.user=false;
        userData=undefined;
        res.json('success');
      }
    }
  } catch (error) {
    next(error);
  }
}

const loadOrdersList = async(req,res,next)=>{
  try {
    let orders = await Order.find().populate('customer'); 
    orders = orders.map(orders => ({
      ...orders.toObject(),
      orderDate: moment(orders.createdAt).format('DD/MM/YYYY')
    }));
           
    res.render('admin/orderslist',{orders,moment});
  } catch (error) {
    next(error);
  }
}

const updateOrderStatus = async(req,res,next)=>{
  try {
    const {orderId,orderStatus} = req.body;
    if(orderStatus === 'Delivered'){
      const order = await Order.findByIdAndUpdate(orderId,
        {$set:{
          orderStatus:orderStatus,
          deliveryDate:Date.now()
        }
      });
    }
    else{
      const order = await Order.findByIdAndUpdate(orderId,
        {$set:{
          orderStatus:orderStatus
        }
      })
    }
    res.json('success');
  } catch (error) {
    next(error);
  }
}
const loadOrderView = async(req,res,next)=>{
  try {
    const orderId= req.query.id; 
    let order = await Order.findOne({_id:orderId}).populate('customer').populate('couponId');
    order = {
      ...order.toObject(),
      orderDate: moment(order.createdAt).format('DD/MM/YYYY')
    };

    res.render('admin/orderview',{order,moment});
  } catch (error) {
    next(error);
  }
}

const loadCouponsList = async(req,res,next)=>{
  try {
    let couponsData = await Coupon.find();
    couponsData = couponsData.map(couponsData => ({
      ...couponsData.toObject(),
      expiryDate: moment(couponsData.expiryDate).format('DD/MM/YYYY')
    }));
    res.render('admin/couponslist',{coupons:couponsData,moment});
  } catch (error) {
    next(error);
  }
}
const loadAddCoupon = async(req,res,next)=>{
  try {
    res.render('admin/addcoupon');
  } catch (error) {
    next(error);
  }
}

//max and min coupon 
const addCoupon = async(req,res,next)=>{
  try {
    const couponName = req.body.couponName.trim().toUpperCase();
    const percentage = req.body.percentage;
    const minimum = req.body.minimum;
    const maximum = req.body.maximum;
    
    const expiryDate = moment(req.body.expiryDate).toISOString();
    
    const today = moment().startOf('day').toISOString();
    existingCoupon = await Coupon.findOne({couponName:couponName});
    if(existingCoupon){
      res.render('admin/addcoupon',{message:"The Coupon is already exist"});
    }
    else if(percentage<1||percentage>99){
      res.render('admin/addcoupon',{message:"Enter value between 1&99"})
    }
    else if(!moment(expiryDate).isValid()||moment(expiryDate).isBefore(today)){
      res.render('admin/addcoupon',{message:"Invalid date"});
    }
    else{
      const newCoupon = new Coupon({
        couponName:couponName,
        percentage:percentage,
        minimum:minimum,
        maximum:maximum,
        expiryDate:expiryDate
      });
      await newCoupon.save();
      if(newCoupon){
        res.redirect('/admin/couponslist');
      }
      else{
        res.render('admin/addcoupon',{message:"Please try again"});
      }
    }
  } catch (error) {
    next(error);
  }
}

const deactivateCoupon = async(req,res,next)=>{
  try {
    const couponId = req.body.id;
    const isActiveCoupon = await Coupon.findById(couponId);
    if(isActiveCoupon.isActive){
      const coupon = await Coupon.findByIdAndUpdate(
        {_id:couponId},
        {$set:{isActive:false}}
      )
      if(coupon){
        res.json('success');
      }
    }
    else{
      const coupon = await Coupon.findByIdAndUpdate(
        {_id:couponId},
        {$set:{isActive:true}}
      )
      if(coupon){
        res.json('success');
      }
    }
  } catch (error) {
    next(error);
  }
}

const adminLogout = async(req,res,next)=>{
  try {
    req.session.admin_id=false;
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  loadAdminLogin,verifyAdminLogin,
  loadAdminDashboard,
  loadChart,loadOrdersChart,
  loadSalesReport,
  loadAddCategory,addCategory,
  loadCategoriesList,loadEditCategory,
  editCategory,blockCategory,  
  loadAddProduct,addProduct,
  loadProductsList,
  deleteProductImage,
  loadEditProduct, 
  editProduct,blockProduct,
  loadUsersList,blockUser,
  loadOrdersList,
  updateOrderStatus,
  loadOrderView,
  loadCouponsList,
  loadAddCoupon,addCoupon,
  deactivateCoupon,
  adminLogout,  
}