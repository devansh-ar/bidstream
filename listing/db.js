const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/listing_db");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  startingPrice: {
    type: Number,
    required: true,
  },
  currentBid: {
    type: Number,
    default: 0,
  },
  currentBidder: {
    type: String,
    default: "",
  },
  totalBids: {
    type: Number,
    default: 0,
  },
  endsAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: "active",
  },
  winner: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

listingSchema.index({ status: 1, endsAt: 1 });

const Listing = mongoose.model("Listing", listingSchema);

module.exports = { Listing };
