const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/auction_db");

const auctionLogSchema = new mongoose.Schema({
  listingId: String,
  listingTitle: String,
  highestBid: Number,
  highestBidder: String,
  totalBids: Number,
  status: {
    type: String,
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const AuctionLog = mongoose.model("AuctionLog", auctionLogSchema);

module.exports = { AuctionLog };
