require('dotenv').config();
const express = require("express");
const user_route = express.Router();
const Razorpay = require('razorpay');
const auth =require("../middleware/userAuth");

const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController");
const wishlistController=require("../controllers/wishlistController");
const checkoutController=require("../controllers/checkoutController");

user_route.get('/',userController.loadMainPage);
user_route.get('/register',userController.loadRegister);
user_route.post('/register',userController.sendOtp);
user_route.post('/verify',auth.isLogout,userController.verifyOtp);
user_route.get('/login',userController.loadLogin);
user_route.post('/login',auth.isLogout,userController.verifyLogin);
user_route.get('/forgot',userController.loadForgot);
user_route.post('/forgot',auth.isLogout,userController.verifyForgot);
user_route.get('/resetpassword',auth.isLogout,userController.loadResetPassword);
user_route.post('/resetpassword',auth.isLogout,userController.verifyResetPassword);

user_route.get('/about',userController.loadAbout);
user_route.get('/contact',userController.loadContact);

user_route.get('/account',auth.isLogin,userController.loadAccount);
user_route.get('/addnewaddress',auth.isLogin,userController.loadAddAddress);
user_route.post('/addnewaddress',auth.isLogin,userController.addAddress);
user_route.get('/address',auth.isLogin,userController.loadAddress);
user_route.get('/editaddress',auth.isLogin,userController.loadEditAddress);
user_route.post('/editaddress',auth.isLogin,userController.editAddress);
user_route.get('/deleteaddress',auth.isLogin,userController.deleteAddress);
user_route.get('/accountedit',auth.isLogin,userController.loadEditAccount);
user_route.post('/accountedit',auth.isLogin,userController.editAccount);

user_route.get('/categories',productController.loadCategories);
user_route.get('/categorywise',productController.loadCategoryWise);
user_route.get('/products',productController.loadProducts);
user_route.get('/singleproduct',productController.loadSingleProduct);

user_route.get('/addreview',auth.isLogin,productController.loadAddReview);
user_route.post('/addreview',auth.isLogin,productController.addReview);

user_route.get('/wishlist',auth.isLogin,wishlistController.loadWishlist);
user_route.post('/addwishlist',auth.isLogin,wishlistController.addWishlist);
user_route.post('/removewishlist',auth.isLogin,wishlistController.removeWishlist);

user_route.post('/addtocart',auth.isLogin,cartController.addToCart);
user_route.get('/cart',auth.isLogin,cartController.loadCart);
user_route.post('/addquantity',auth.isLogin,cartController.addQuantityToCart);
user_route.post('/removeitem',auth.isLogin,cartController.removeItemCart);

user_route.get('/checkout',auth.isLogin,checkoutController.loadCheckout);
user_route.post('/applycoupon',auth.isLogin,checkoutController.applyCoupon);
user_route.post('/removecoupon',auth.isLogin,checkoutController.removeCoupon);
user_route.get('/addcheckoutaddress',auth.isLogin,checkoutController.loadAddAddress);
user_route.post('/addcheckoutaddress',auth.isLogin,checkoutController.addAddress);
user_route.get('/editcheckoutaddress',auth.isLogin,checkoutController.loadEditAddress);
user_route.post('/editcheckoutaddress',auth.isLogin,checkoutController.editAddress);
user_route.get('/deletecheckoutaddress',auth.isLogin,checkoutController.deleteAddress);
user_route.post('/checkout',auth.isLogin,checkoutController.createOrder);
user_route.get('/orderconfirmation',auth.isLogin,checkoutController.loadOrderConfirmation);
user_route.get('/orders',auth.isLogin,checkoutController.loadOrders);
user_route.get('/orderdetails',auth.isLogin,checkoutController.loadOrderDetails);
user_route.post('/cancelorder',auth.isLogin,checkoutController.cancelOrder);
user_route.post('/returnorder',auth.isLogin,checkoutController.returnOrder);
user_route.get('/downloadInvoice',auth.isLogin,checkoutController.downloadInvoice);

user_route.post('/create/orderId',auth.isLogin,checkoutController.razorPayFunction);
user_route.post("/api/payment/verify",auth.isLogin,checkoutController.razorPayOrder);

user_route.post('/checkout',auth.isLogin,checkoutController.loadCheckout);

user_route.get('/logout',auth.isLogout);

module.exports = user_route;