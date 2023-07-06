const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const { ObjectId } = require("mongodb");

const addToCart = async (req,res,next) => {
  try {
    const userId = req.session.userData._id;
    const productId = req.body.productId;
    const product = await Product.findOne({_id:productId});
    const cart = await Cart.findOne({userId:userId});

    if(product.noOfStocks > 0){
      if (!cart) {
        const newCart = new Cart({
          userId,
          products: [
            {
              productId,
              quantity: 1,
            },
          ],
        });
        await newCart.save();
        await User.updateOne({_id: userId},{$pull:{wishlist:productId}})
        return res.status(200).json(newCart);
      }
      const existProduct = cart.products.find(
        (product) => product.productId.toString() === productId
      );
      if (existProduct && existProduct.quantity < product.noOfStocks) {       
        return res.status(200).json({ message: 'Product is already present in cart' });
      }
      else if(product.noOfStocks>1 && !existProduct){   
        cart.products.push({
          productId,
          quantity: 1,
        });
        await cart.save(); 
        await User.updateOne({_id: userId},{$pull:{wishlist:productId}})
        const totalQuantity = cart.products.reduce((acc,curr)=>{
          return acc+curr.quantity;
        },0); 
        return res.status(200).json({cart,totalQuantity});
      }
    }
  } catch (error) {    
      next(error);
      res.status(500).json({ message: "Server error" });
  }
};

const loadCart = async (req,res,next) => {
  try {
    const userId = new ObjectId(req.session.userData._id);
    const pipeline = [
      { $match: { userId } },
      { $unwind: "$products" },
      {
        $project: {
          product: "$products.productId",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "items",
        },
      },
    ];
    const findProducts = await Cart.aggregate(pipeline); 

    const totalPipeline = [
      ...pipeline,
      {
        $project: {
          total: {
            $multiply: ["$quantity", { $arrayElemAt: ["$items.price", 0] }],
          },
        },
      },
    ];
    const productTotalPrice = await Cart.aggregate(totalPipeline);    

    const groupTotalPipeline = [
      ...pipeline,
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ["$quantity", { $arrayElemAt: ["$items.price", 0] }],
            },
          },
        },
      },
    ];
    const totalPrice = await Cart.aggregate(groupTotalPipeline);    

    const categories = await Category.find({ block: false });
    
    res.render("users/cart", {
      categories: categories,
      products: findProducts,
      productTotalPrice,
      totalPrice,  
      //cartId
    });
  } catch (error) {    
      next(error);
  }
};

const addQuantityToCart = async (req, res,next) => {
  try {
    const cart = await Cart.findOne({_id:req.body.cartId});
    const product = await Product.findOne({_id:req.body.productId});
    const existProduct = cart.products.find(
      (product)=> product.productId.toString()=== req.body.productId
    );
    if(existProduct){
      const newQuantity = existProduct.quantity+=(req.body.count);
      if(newQuantity > product.noOfStocks){
        return res.status(400).json({message:`Stock limit reached`});
      }
      existProduct.quantity = Math.max(Math.min(newQuantity,product.noOfStocks),1);
    } else{
        cart.products.push({productId:product._id,quantity:1})
    }
    await cart.save();

    const userId = new ObjectId(req.session.userData._id);
    const pipeline = [
      { $match: { userId } },
      { $unwind: "$products" },
      {
        $project: {
          product: "$products.productId",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "items",
        },
      },
    ];

    const totalPipeline = [
      ...pipeline,
      {
        $project: {
          total: {
            $multiply: ["$quantity", { $arrayElemAt: ["$items.price", 0] }],
          },
        },
      },
    ];
    let productTotalPrice = await Cart.aggregate(totalPipeline);

    const groupTotalPipeline = [
      ...pipeline,
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ["$quantity", { $arrayElemAt: ["$items.price", 0] }],
            },
          },
        },
      },
    ];
    let totalPrice = await Cart.aggregate(groupTotalPipeline);

    return res.status(200).json({
      cart,
      productTotalPrice,
      totalPrice
    });    
  } catch (error) {
      next(error);
      res.status(500).json({ message: "Server error" });
  }
};

const removeItemCart = async(req,res,next)=>{
  try {
    const {cartId,productId,index} = req.body;
    const updateCart = await Cart.updateOne(
      {_id:cartId},
      {$unset:{ [`products.${index}`]: null }},
      {new:true}
    ); 
    await Cart.updateOne(
      {_id:cartId},
      {$pull:{products:null}},
      {new:true}
    );    

    const userId = new ObjectId(req.session.userData._id);
    const pipeline = [
      { $match: { userId } },
      { $unwind: "$products" },
      {
        $project: {
          product: "$products.productId",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "items",
        },
      },
    ];
    const totalPipeline = [
      ...pipeline,
      {
        $project: {
          total: {
            $multiply: ["$quantity", { $arrayElemAt: ["$items.price", 0] }],
          },
        },
      },
    ];
    let productTotalPrice = await Cart.aggregate(totalPipeline);
    const groupTotalPipeline = [
      ...pipeline,
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ["$quantity", { $arrayElemAt: ["$items.price", 0] }],
            },
          },
        },
      },
    ];
    let totalPrice = await Cart.aggregate(groupTotalPipeline);     
    return res.json(totalPrice);
  } catch (error) {
      next(error);
      res.status(500).json({message:"Server error"});
  }
}

module.exports = {
  loadCart,
  addToCart,
  addQuantityToCart,
  removeItemCart
};
