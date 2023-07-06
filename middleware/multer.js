const multer = require("multer");
const path = require("path");
const imageTypes = /jpeg|jpg|png|gif|svg|webp/;
const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.join(__dirname,'../public/productImages'));
  },
  filename:function(req,file,cb){
    const name = Date.now()+'-'+file.originalname;
    cb(null,name);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = imageTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      // Render the error page
      return req.res.render('multererror', { message: 'Only image files are allowed' });
    }
  }
});
module.exports = upload