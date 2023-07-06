
const createdDate = createOrder.createdAt;
console.log('ordercreateddate-', createdDate);
const dayafter10 = moment(createdDate, 'DD.MM.YYYY HH:mm').add(10, 'd');
console.log('datafter10-', dayafter10);
const today = moment();
console.log('today-', today);

if (today.isBefore(dayafter10)) {
  console.log('today-', today);
} else {
  console.log('dayafte10-',dayafter10);
}


const order = await Order.findById({_id:orderId});
    console.log('order-', order);
    const orderDate = order.createdAt; console.log('orderDate',orderDate);
    const after10Days = moment(orderDate, 'DD.MM.YYYY HH:mm').add(10, 'd');console.log('after10days-',after10Days);
    const today = moment(); console.log('today-',today);
    if (today.isBefore(dayafter10)) {
      console.log('today-', today);
    } else {
      console.log('dayafte10-',dayafter10);
    }


//remove cartitem
 /* function removeItemCart(cartId,productId,index){
        if(confirm("Are you sure you want to delete this item from your cart?")){
        fetch('/removeitem',{
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body: JSON.stringify({
            cartId:cartId,
            productId:productId,
            index:index
          })
        })
        .then((res)=>res.json())
        .then((res)=>window.location.reload())
        .catch(error => console.error(error))
      }  
    }  */  

    // function removeItemCart(cartId, productId, index) {
    //   Swal.fire({
    //     title: 'Are you sure?',
    //     text: 'You are about to remove this item from your cart',
    //     icon: 'warning',
    //     showCancelButton: true,
    //     confirmButtonColor: '#3085d6',
    //     cancelButtonColor: '#d33',
    //     confirmButtonText: 'Yes, remove it!'
    //   }).then((result) => {
    //     if (result.value) {
    //       fetch('/removeitem', {
    //           method: 'POST',
    //           headers: {
    //             'Content-Type': 'application/json'
    //           },
    //           body: JSON.stringify({
    //             cartId: cartId,
    //             productId: productId,
    //             index: index
    //           })
    //         })
    //         .then((res) => res.json())
    //         .then((res) => window.location.reload())
    //         .catch(error => console.error(error))
    //     }
    //   })
    // }    


    
    let offerPrice;
const coupon = async (req, res, next) => {
  try {
    const codeId = req.body.code;
    const total = req.body.total;
    const couponData = await Coupon.findOne({ code: codeId }).lean();
   
    const userData = await Coupon.findOne({
      code: codeId,
      userId: req.session.user_id,
    }).lean();

    let minamount=100;
    let maxamount=1000;

    if (couponData && couponData.date > moment().format("YYYY-MM-DD")) {
      offerPrice = couponData.percentage;
      console.log("jhbaksjdjlhbsd");

      if (userData) {
        res.json("fail");
      } else {
        if(total>=minamount){


         if(total<=maxamount){
          const amount = (total * offerPrice) / 100;
        var gtotal = total - amount;
         
              

         }else{
          const amount = (1000 * offerPrice) / 100;
          var gtotal = total - amount;
        
         }


        }else{
         gtotal=amount;
        }
        
        console.log("after coupon" + gtotal);
        res.json({ offerPrice: offerPrice,gtotal:gtotal});
        const userupdate = await Coupon.updateOne(
          { code: codeId },
          { $push: { userId: req.session.user_id } }
        );
      }
    } else {
      res.json("fail");
    }
  } catch (error) {
    next(error);
  }
};










const loadChart = async (req, res) => {
  try {
    const startDate = new Date(new Date().getFullYear(), 0, 1)
    const endDate = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999)

    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $in: ['Shipped', 'Delivered'] }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: { $toDate: "$createdAt" } },
            year: { $year: { $toDate: "$createdAt" } }
          },
          totalSales: { $sum: '$total' },
          totalOrder: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }  
      }
    ]);

    console.log(monthlySales, 'first');
    res.json(monthlySales)
  } catch (error) {
    console.log(error.message);
  }
} 

//To load chart of order status

const loadOrderChart = async (req,res) => {
  try {

    

      const pipeline = [
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getFullYear(), 0, 1),
              $lte: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999)
            },
          },
        },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
          },
        },
      ];
      const result = await Order.aggregate(pipeline);
      console.log(result);
      res.json(result)
    
    
  } catch (error) {
    console.log(error.message);
  }
}










  let total = Number(document.getElementById('total').value);
  let remainingAmount = total;
  const radioButtons = document.getElementsByName('payment');
  const walletBalance = <%= user.wallet %>; // get user wallet balance from the server-side
  radioButtons.forEach(radioButton => {
    radioButton.addEventListener('change', (event) => {
      if (event.target.value === 'COD') {
        if (walletBalance >= total) {
          remainingAmount = 0;
          document.getElementById('proceedButton').disabled = false;
        } else {
          remainingAmount = total - walletBalance;
          document.getElementById('proceedButton').disabled = true;
          alert(`You have insufficient wallet balance. Please pay remaining amount of INR ${remainingAmount} during the delivery.`);
        }
      } else if (event.target.value === 'wallet') {
        remainingAmount = 0;
        document.getElementById('proceedButton').disabled = false;
      } else {
        remainingAmount = total;
        document.getElementById('proceedButton').disabled = false;
        var orderId;
        $(document).ready(function() {
          var settings = {
            url: "/create/orderId",
            method: "POST",
            timeout: 0,
            headers: {
              "Content-Type": "application/json"
            },
            data: JSON.stringify({
              amount: remainingAmount * 100, //CHANGE THE AMOUNT AS NEEDED
            }),
          };

          //creates new orderId everytime
          $.ajax(settings).done(function(response) {

            orderId = response.orderId;
            console.log(orderId);
          });
        });
        document.getElementById('proceedButton').onclick = function(e) {
          var options = {
            key: "rzp_test_NT5lfbdTihBLLO", // Enter the Key ID generated from the Dashboard
            amount: remainingAmount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            currency: "INR",
            name: "Molla",
            description: "Clothing Accessories Store",
            image: "",
            order_id: orderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            handler: function(response) {
              // alert(response.razorpay_payment_id);
              // alert(response.razorpay_order_id);
              // alert(response.razorpay_signature)
              var settings = {
                url: "/api/payment/verify",
                method: "POST",
                timeout: 0,
                headers: {
                  "Content-Type": "application/json"
                },
                data: JSON.stringify({
                  response
                }),
              };
              console.log(response);
              $.ajax(settings).done(function(response) {
                placeOrder(orderId);
                //alert(JSON.stringify(response));
              })
            },
            theme: {
              "color": "#3399cc"
            }
          };
          var rzp1 = new Razorpay(options);
          rzp1.on('payment.failed', function(response) {
            alert(response.error.code);
            alert(response.error.description);
            alert(response.error.source);
            alert(response.error.step);




            async function placeOrder(req, res) {
              try {
                const { payment } = req.body;
                const user = await User.findById(req.session.userData._id);
            
                const pipeline = [
                  { $match: { userId: new ObjectId(req.session.userData._id) } },
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
            
                const groupTotalPipeline = [
                  ...pipeline,
                  {
                    $group: {
                      _id: null,
                      total: {
                        $sum: {
                          $multiply: [
                            "$quantity",
                            { $arrayElemAt: ["$items.price", 0] },
                          ],
                        },
                      },
                    },
                  },
                ];
            
                const totalPrice = await Cart.aggregate(groupTotalPipeline);
                console.log("totalprice", totalPrice[0].total);
            
                const userId = req.session.userData._id;
                const addressData = req.body.address;
            
                let walletOrder;
                let remainingOrder;
                let balanceAmount;
            
                if (user.wallet >= totalPrice[0].total) {
                  walletOrder = new Order({
                    customer: req.session.userData._id,
                    address: addressData,
                    items: findProducts,
                    totalPrice: totalPrice[0].total,
                    payment: "wallet",
                    createdAt: new Date(),
                  });
                } else {
                  balanceAmount = totalPrice[0].total - user.wallet;
                  console.log("balanceAmount", balanceAmount);
            
                  walletOrder = new Order({
                    customer: req.session.userData._id,
                    address: addressData,
                    items: findProducts,
                    totalPrice: user.wallet,
                    payment: "wallet",
                    createdAt: new Date(),
                  });
            
                  remainingOrder = new Order({
                    customer: req.session.userData._id,
                    address: addressData,
                    items: findProducts,
                    totalPrice: balanceAmount,
                    payment: payment,
                    createdAt: new Date(),
                  });
                }
            
                let walletOrderResult = await walletOrder.save();
                let remainingOrderResult;
            
                if (remainingOrder) {
                  remainingOrderResult = await remainingOrder.save();
                }
            
                if (walletOrderResult) {
                  for (let i = 0; i < findProducts.length; i++) {
                    const productId = findProducts[i].product;
                    const quantityPurchased = findProducts[i].quantity;
            
                    await Product.updateOne(
                      { _id: new ObjectId(productId) },
                      { $inc: { noOfStocks: -quantityPurchased } }
                    );
                  }
            
                  if (user.wallet >= totalPrice[0].total) {
                    await User.findByIdAndUpdate(userId, {
                      $inc: { wallet: -totalPrice[0].total },
                    });
                  } else {
                    await User.findByIdAndUpdate(userId,

                      


/

//walletcheckboxthing
if (isWalletPayment) {
  const walletBalance = user.wallet;
  const walletAmount = Math.min(totalPrice[0].total, walletBalance);
  balanceAmount = totalPrice[0].total - walletAmount;
 
  if (walletAmount > 0) {
    newOrder = new Order({
      customer: req.session.userData._id,
      address: req.body.address,
      items: findProducts,
      totalPrice: totalPrice[0].total,
      payment: 'wallet',
      createdAt: new Date(),
    });
    await User.updateOne(
      { _id: req.session.userData._id },
      { $inc: { wallet: -walletAmount } }
    );
  }
} else {
  newOrder = new Order({
    customer: req.session.userData._id,
    address: req.body.address,
    items: findProducts,
    totalPrice: totalPrice[0].total,
    payment: req.body.payment,
    createdAt: new Date(),
  });
}


if (createOrder.payment === 'wallet') {
  const walletBalance = user.wallet;
  if (walletBalance >= createOrder.totalPrice) {
    await User.updateOne(
      { _id: req.session.userData._id },
      { $inc: { wallet: -createOrder.totalPrice } }
    );
  } else {
    balanceAmount = createOrder.totalPrice - walletBalance;
    await User.updateOne(
      { _id: req.session.userData._id },
      { $set: { wallet: 0 } }
    );
  }
}

if (createOrder.payment === 'wallet') {
  await User.updateOne(
    { _id: req.session.userData._id },
    { $set: { wallet: 0 } }
  );
} else if (isWalletPayment) {
  await User.updateOne(
    { _id: req.session.userData._id },
    { $inc: { wallet: -balanceAmount } }
  );
}




if (req.method === 'POST') {
  const useWallet = req.body.useWallet;
  const walletAmount = req.body.walletAmount;

  if (useWallet) {
    if (walletAmount >= totalPrice[0].total) {
      balanceAmount = 0;
    }
    else {
      balanceAmount = totalPrice[0].total - walletAmount;
    }
  } else {
    // set balanceAmount to be equal to totalPrice[0].total
    balanceAmount = totalPrice[0].total;
  }

  res.json(balanceAmount);
}


if(req.method === 'POST'){  
  const useWallet = req.body.useWallet;
  const walletAmount=req.body.walletAmount; console.log('usewallet,walletamount',useWallet,walletAmount);
  if(useWallet){
    if(walletAmount>=totalPrice[0].total){
      balanceAmount = 0;
    }
    else{
      balanceAmount = totalPrice[0].total-walletAmount;
    }
    res.json(balanceAmount);
  } else {
    res.render('users/checkout',{
      categories:categories, 
      address:user.address,
      products:findProducts,
      productTotalPrice,
      totalPrice,
      cartId,user, balanceAmount         
    });
  }
} else {
  res.render('users/checkout',{
    categories:categories, 
    address:user.address,
    products:findProducts,
    productTotalPrice,
    totalPrice,
    cartId,user, balanceAmount         
  });
}






// define custom event for wallet checkbox change
const walletChangeEvent = new Event('walletChange');

const walletCheckbox = document.getElementById('wallet-checkbox');
const totalValue = document.getElementById('totalvalue');
const totalInput = document.getElementById('total');
const walletAmountInput = document.getElementById('wallet-amount');

const walletCheckboxInput = document.getElementById('walletCheckbox');

function updateTotal() {
  const totalPrice = parseFloat(totalInput.value);
  const walletAmount = parseFloat(walletAmountInput.value);
  if (walletAmount >= totalPrice) {
    totalValue.innerText = 'Rs. 0';
    totalInput.value = 0;

    document.getElementsByName("payment")[0].removeAttribute("required");
    document.getElementsByName("payment")[1].removeAttribute("required");

  } else {
    const newTotalPrice = totalPrice - walletAmount;
    totalValue.innerText = `Rs. ${newTotalPrice}`;
    totalInput.value = newTotalPrice;
  }
  
  // dispatch wallet change event
  walletCheckbox.dispatchEvent(walletChangeEvent);
}

let updatedTotalAmount = parseFloat(totalInput.value);
console.log('totalaftercheckboxclickornot', updatedTotalAmount);

function clickWallet(totalPrice) {
  if (walletCheckbox.checked) {
    walletCheckboxInput.value = '1';
    updateTotal();
    updatedTotalAmount = parseFloat(totalInput.value);
  } else {
    walletCheckboxInput.value = '0'
    totalValue.innerText = `Rs. ${totalPrice}`;
    totalInput.value = totalPrice;
    updatedTotalAmount = parseFloat(totalInput.value);
  }
}

let orderId = null;

const radioButtons = document.getElementsByName('payment');
radioButtons.forEach(radioButton => {
  radioButton.addEventListener('change', (event) => {
    if (event.target.value === 'COD') {
      orderId = null;
      document.getElementById('proceedButton').disabled = false;
    } else {
      if (document.getElementById('address').value.trim() === '') {
        document.getElementById('proceedButton').disabled = true;
      } else {
        document.getElementById('proceedButton').disabled = false;

        // listen for wallet change event and update amount accordingly
        walletCheckbox.addEventListener('walletChange', () => {
          updatedTotalAmount = parseFloat(totalInput.value);
          console.log('updatedtotal', updatedTotalAmount);
          if (orderId == null) {
            var settings = {
              url: "/create/orderId",
              method: "POST",
              timeout: 0,
              headers: {
                "Content-Type": "application/json",
              },
              data: JSON.stringify({
                amount: updatedTotalAmount * 100,
              }),
            };
            $.ajax(settings).done(function (response) {
              orderId = response.orderId;
              console.log(orderId);
            });
          }
        });

        document.getElementById("proceedButton").onclick = function (e) {
          if (orderId != null) {
            var options = {
              key: "rzp_test_NT5lfbdTihBLLO",
              amount: updatedTotalAmount * 100,
              currency: "INR",
              name: "MOLLA",
              description: "Clothing Accessories Store",
              image: "",
              order_id: orderId,
              handler: function (response) {
                var settings = {
                  url: "/api/payment/verify",
                  method: "POST",
                  timeout: 0,
                  headers: {
                    "Content-Type": "application/json",
                  },
                  data: JSON.stringify({ response }),
                };
                console.log(response)
                $.ajax(settings).done(function (response) {
                  placeOrder(orderId);
                });
              },
              theme: {
                color: "#3399cc",
              },
            };
            var rzp1 = new Razorpay(options);
            rzp1.on("payment.failed", function (response) {
            });
            rzp1.open();
            e.preventDefault();
          }
        };
      }
    });
  }); 

