const express = require("express");
const admin_route = express.Router();

admin_route.use(express.static('public'));

const auth = require("../middleware/adminAuth");
const upload = require("../middleware/multer");
const adminController = require("../controllers/adminController");

admin_route.get('/',auth.isLogout,adminController.loadAdminLogin);
admin_route.post('/',adminController.verifyAdminLogin);
admin_route.get('/dashboard',auth.isLogin,adminController.loadAdminDashboard);

admin_route.get('/chart',auth.isLogin,adminController.loadChart);
admin_route.get('/orderstatuschart',auth.isLogin,adminController.loadOrdersChart);
admin_route.get('/salesreport',auth.isLogin,adminController.loadSalesReport);

admin_route.get('/addcategory',auth.isLogin,adminController.loadAddCategory);
admin_route.post('/addcategory',auth.isLogin,upload.single("categoryPhoto"),adminController.addCategory);
admin_route.get('/categorylist',auth.isLogin,adminController.loadCategoriesList);
admin_route.get('/editcategory',auth.isLogin,adminController.loadEditCategory);
admin_route.post('/editcategory',auth.isLogin,upload.single("categoryPhoto"),adminController.editCategory);
admin_route.post('/blockcategory',auth.isLogin,adminController.blockCategory);

admin_route.get('/addproduct',auth.isLogin,adminController.loadAddProduct);
admin_route.post('/addproduct',auth.isLogin,upload.array("productPhoto",20),adminController.addProduct);
admin_route.get('/productslist',auth.isLogin,adminController.loadProductsList);
admin_route.post('/deleteProductImage',auth.isLogin,adminController.deleteProductImage);
admin_route.get('/editproduct',auth.isLogin,adminController.loadEditProduct);
admin_route.post('/editproduct',auth.isLogin,upload.array("productPhoto",20),adminController.editProduct);
admin_route.post('/blockproduct',auth.isLogin,adminController.blockProduct);

admin_route.get('/userslist',auth.isLogin,adminController.loadUsersList);
admin_route.post('/blockuser',auth.isLogin,adminController.blockUser);

admin_route.get('/orderslist',auth.isLogin,adminController.loadOrdersList);
admin_route.post('/updatestatus',auth.isLogin,adminController.updateOrderStatus);
admin_route.get('/orderview',auth.isLogin,adminController.loadOrderView);

admin_route.get('/couponslist',auth.isLogin,adminController.loadCouponsList);
admin_route.get('/addcoupon',auth.isLogin,adminController.loadAddCoupon);
admin_route.post('/addcoupon',auth.isLogin,adminController.addCoupon);
admin_route.post('/deactivatecoupon',auth.isLogin,adminController.deactivateCoupon);

admin_route.get('/logout',auth.isLogin,adminController.adminLogout);

module.exports =admin_route;