const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/bid_db");

const bidSchema = new mongoose.Schema({
  listingId: {
    type: String,
    required: true,
  },
  listingTitle: {
    type: String,
  },
  bidder: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

bidSchema.index({ listingId: 1, createdAt: -1 });

const Bid = mongoose.model("Bid", bidSchema);

module.exports = { Bid };
