require('dotenv').config();
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const { db } = require('../models/userModel');

const emailAdmin = process.env.EMAILADMIN;
const passwordAdmin = process.env.PASSWORDADMIN;

let saveOtp;
let enteredName;
let enteredEmail;
let enteredMobile;
let enteredPassword;

const generateOTP = () => {  
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

const securePassword = async (password,next) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    next(error);
  }
};

const sendResetPasswordMail = async(name,email,token,next)=>{
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user: emailAdmin,
        pass: passwordAdmin
      }
    });
    const mailOptions = {
      from:emailAdmin,
      to:email,
      subject:'For Reset Password',
      html:'<p>Hi, '+name+' please click here to <a href="http://mollacart.online/resetpassword?token='+token+'"> Reset </a> Your Password</p>'
    }
    transporter.sendMail(mailOptions,function(error,info){
      if(error){
        console.log(error);
      }
      else{
        console.log("Email has been sent: ",info.response);
      }
    })

  } catch (error) {
    next(error);
  }
}

const loadRegister = async (req, res ,next) => {
  try {
    if(req.session.user){
      res.redirect("/")
    }else{
      res.render("users/registration");
    }
  } catch (error) {
    next(error);
  }
};

const sendOtpMail = async(email,otp)=>{
  try {
    const transporter = nodemailer.createTransport({
      
      service:"gmail",
      auth:{
        user: emailAdmin,
        pass: passwordAdmin
      }
    });
    const mailOptions= {
      from:emailAdmin,
      to:email,
      subject:'For OTP',
      html:'<p>Hi, Your One Time Password to Login is '+ otp +'</p>'
    }
    transporter.sendMail(mailOptions,function(error,info){
      if(error){
        console.log(error);
      }
      else{
        console.log("Email has been sent: ",info.response);
      }
    })       
  } catch (error) {
    res.status(500).send('Error sending Otp password');
  }
}

const sendOtp = async(req,res)=>{
    try {
      const otp =generateOTP();
      saveOtp = otp;       
      enteredName=req.body.name;
      enteredEmail= req.body.email;
      enteredMobile= req.body.mobile;
      enteredPassword=req.body.password;  
      const userEmail =  await User.findOne({email:enteredEmail}); 
      if(!userEmail){
        sendOtpMail(enteredEmail,otp);
        res.render('users/otpverify');    
      }
      else{
        res.render('users/registration',{message:'Entered Email is already registered. '})
      }
    } catch (error) {
      res.status(500).send('Error sending Otp');
    }
  }

const verifyOtp = async(req,res)=>{
  const enteredOtp = req.body.otpPassword;
  if(enteredOtp === saveOtp){   
    const securedPassword = await securePassword(enteredPassword);
    const user = new User({
      name: enteredName,
      email: enteredEmail,
      mobile: enteredMobile,
      password: securedPassword
    }); 
    const userEmail = await User.findOne({email:enteredEmail});
    const userMobile = await User.findOne({mobile:enteredMobile});    
    if(!userEmail && !userMobile){
      const userData = await user.save();      
      if (userData) {
        res.render("users/registration", {message: "Your registration has been successfull."});
      } 
      else {
        res.render("users/registration", {errmessage: "Your registration has been failed"});
      }
    }
    else{
      res.render('users/registration',{errmessage:"User is already exist"});
    }   
  }
  else{
    res.render("users/otpverify",{errmessage:"Invalid otp"});
  }
}

const loadLogin = async(req,res,next)=>{
  try {
    if(req.session.user){
      res.redirect("/")
    }else{
      res.render('users/login');
    }
  } catch (error) {
    next(error);
  }
}

const loadMainPage = async(req,res,next)=>{
  try {
    const categories = await Category.find({block:false});
    const products = await Product.find();
    if (req.session.user) {
     userData = req.session.userData;
      User.findOne({_id:userData._id}).then((user)=>{
        res.render("users/mainhome", {userData: userData, categories:categories, products:products});
      })
    } else {
      res.render("users/mainhome",{categories:categories, products:products});
    }
  } catch (error) {
    next(error)
  }  
};

const verifyLogin = async(req,res,next)=>{
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({email:email});
    if(user){
      const passwordMatch = await bcrypt.compare(password,user.password);
      if(passwordMatch){
        if(user.block){
          res.render('users/login',{message:"Your account is blocked by Admin"});
        }
        else{        
          req.session.userData = user; 
          req.session.user=true;
          res.redirect('/');
        }
      }
      else{
        res.render('users/login',{message:"Incorrect Email or password"})
      }
    }
    else{
      res.render('users/login',{message:"Incorrect Email or Password"});
    }
  } catch (error) {
    next(error);
  }
}

const loadForgot = async(req,res,next)=>{
  try {
    if(req.session.user){
      res.redirect('/');
    }else{
      res.render('users/forgotpassword');
    }
  } catch (error) {
    next(error);
  }
}
const verifyForgot = async(req,res,next)=>{
  try {
    const email = req.body.email;
    const userData= await User.findOne({email:email});
    if(userData){
      const randomString = randomstring.generate();
      const updatedUserData = await User.updateOne({email:email},{$set:{token:randomString}});
      sendResetPasswordMail(userData.name,userData.email,randomString);
      res.render('users/forgotpassword',{message1:"Please check your mail to reset the Password"});
    }
    else{
      res.render('users/forgotpassword',{message2:"Incorrect Email"});
    }
  } catch (error) {
    next(error);
  }
}
const loadResetPassword = async(req,res,next)=>{
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({token:token});
    if(tokenData){
      res.render('users/resetpassword',{user_id:tokenData._id});
    }else{
      res.render('404',{message:"Page not found"});
    }
  } catch (error) {
    next(error);
  }
}
const verifyResetPassword = async(req,res,next)=>{
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const securedPassword = await securePassword(password);
    const updatedUserData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:securedPassword, token:''}});   
    res.render('users/resetpassword',{user_id:'', message:"Password reset successfully."}); 
  } catch (error) {
    next(error);
  }
}

const loadAbout = async(req,res,next)=>{
  try {    
    const categories = await Category.find({block:false});
    res.render('users/about',{categories:categories});
  } catch (error) {
    next(error);
  }
}

const loadContact = async(req,res,next)=>{
  try {   
    const categories = await Category.find({block:false});
    res.render('users/contact',{categories:categories});
  } catch (error) {
    next(error);
  }
}

const loadAccount = async(req,res,next)=>{
  try {
    const userData = req.session.userData;
    const user = await User.findOne({_id:userData._id});   
    const categories = await Category.find({block:false});
    res.render('users/account',{categories:categories,user:user});
  } catch (error) {
    next(error);
  }
}
const loadAddAddress = async(req,res,next)=>{
  try {
    const categories = await Category.find({block:false});
    res.render('users/addnewaddress',{categories:categories});
  } catch (error) {
    next(error);
  }
}
const addAddress = async(req,res,next)=>{
  try {
    const address = await User.findByIdAndUpdate({
      _id:req.session.userData._id
    },{
      $addToSet:{
        address:req.body
      }
    })
    res.redirect('/address');
  } catch (error) {
    next(error);
  }
}
const loadAddress = async(req,res,next)=>{
  try {
    const userData = req.session.userData;
    const user = await User.findOne({_id:userData._id}); 
    const categories = await Category.find({block:false});
    res.render('users/address',{categories:categories,address:user.address,user:user});
  } catch (error) {
    next(error);
  }
}
const loadEditAddress = async(req,res,next)=>{
  try {
    const id = req.query.id;    
    const userAddress = await User.findOne({address:{$elemMatch:{_id:id}}},{"address.$":1,_id:0}); 
    const categories = await Category.find({block:false});
    res.render('users/editaddress',{address:userAddress,categories:categories});
  } catch (error) {
    next(error);
  }
}
const editAddress = async(req,res,next)=>{
  try {
    const id = req.query.id;
    const userAddress = await User.updateOne(
      {address:{$elemMatch:{_id:id}}},
      {$set:{"address.$" :req.body}}); 
      res.redirect('/address');
  } catch (error) {
    next(error);
  } 
}
const deleteAddress = async(req,res,next)=>{
  try {
    const id = req.query.id;
    const userData = await User.findByIdAndUpdate(
      {_id:req.session.userData._id},
      {$pull:{address:{_id:id}}}
    );
    res.redirect('/address');
  } catch (error) {
    next(error);
  }
}
const loadEditAccount = async(req,res,next)=>{
  try {    
    const user = await User.findOne({_id:req.session.userData._id});
    res.render('users/accountedit',{user:user});
  } catch (error) {
    next(error);
  }
}

const editAccount = async (req, res,next) => {
  try {
    const id = req.body.id;
    const enteredName = req.body.name;
    const enteredEmail = req.body.email;
    const enteredMobile = req.body.mobile;
    const enteredPassword = req.body.password;

    const userToUpdate = await User.findById(id);

    if (!userToUpdate) {
      return res.status(404).send('User not found');
    }

    if (enteredEmail && enteredEmail !== userToUpdate.email) {
      const existingUserByEmail = await User.findOne({ email: enteredEmail });
      if (existingUserByEmail) {
        return res.render('users/accountedit', {
          message: 'Email already exists',
          user: userToUpdate,
        });
      }
      userToUpdate.email = enteredEmail;
    }

    if (enteredMobile && enteredMobile !== userToUpdate.mobile) {
      const existingUserByMobile = await User.findOne({ mobile: enteredMobile });
      if (existingUserByMobile && existingUserByMobile.id !== userToUpdate.id) {
        return res.render('users/accountedit', {
          message: 'Mobile already exists',
          user: userToUpdate,
        });
      }
      userToUpdate.mobile = enteredMobile;
    }

    if (enteredName) {
      userToUpdate.name = enteredName;
    }

    if (enteredPassword) {
      const securedPassword = await securePassword(enteredPassword);
      userToUpdate.password = securedPassword;
    }

    await userToUpdate.save();

    res.redirect('/account');
  } catch (error) {
    next(error);
    res.status(500).send('Server error');
  }
};

const userLogout = async(req,res,next)=>{
  try {
    req.session.userData=false;    
    req.session.user=false;
    res.redirect('/');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  loadMainPage,
  loadRegister,
  sendOtp,verifyOtp,
  loadLogin,verifyLogin,
  loadForgot,verifyForgot,
  loadResetPassword,verifyResetPassword,  
  loadAbout,
  loadContact,
  loadAccount,     
  loadAddress,loadAddAddress,
  addAddress,
  loadEditAddress,editAddress,
  deleteAddress,
  loadEditAccount,
  editAccount, 
  userLogout  
};
