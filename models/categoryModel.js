const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    requried: true,
  },
  image: {
    type: String,
    required: true
  },
  block: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Category", categorySchema);
