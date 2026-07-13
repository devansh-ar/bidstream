const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Bid } = require("./db");
const { connectRabbit, getChannel } = require("./rabbit");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/bids/:listingId", async (req, res) => {
  const bids = await Bid.find({ listingId: req.params.listingId }).sort({
    createdAt: -1,
  });
  res.json(bids);
});

app.get("/bids", async (req, res) => {
  const bids = await Bid.find().sort({ createdAt: -1 });
  res.json(bids);
});

app.post("/bids", async (req, res) => {
  const { listingId, bidder, amount } = req.body;

  if (!listingId || !bidder || !amount) {
    return res
      .status(400)
      .json({ message: "listingId, bidder and amount are required" });
  }

  let listing;
  try {
    const resp = await axios.get(`http://localhost:8000/listings/${listingId}`);
    listing = resp.data;
  } catch (err) {
    return res.status(404).json({ message: "Listing not found" });
  }

  if (listing.status !== "active") {
    return res.status(400).json({ message: "Auction has ended" });
  }

  if (new Date(listing.endsAt) < new Date()) {
    return res.status(400).json({ message: "Auction has expired" });
  }

  if (amount <= listing.currentBid) {
    return res.status(400).json({
      message: `Bid must be higher than current bid of Rs.${listing.currentBid}`,
    });
  }

  const bid = await Bid.create({
    listingId,
    listingTitle: listing.title,
    bidder,
    amount,
  });

  const totalBids = await Bid.countDocuments({ listingId });

  const ch = getChannel();
  if (ch) {
    ch.sendToQueue(
      "bid.placed",
      Buffer.from(
        JSON.stringify({
          bidId: bid._id,
          listingId,
          listingTitle: listing.title,
          bidder,
          amount,
          totalBids,
        })
      ),
      { persistent: true }
    );
  }

  res.status(201).json({ message: "Bid placed", bid });
});

async function start() {
  await connectRabbit();
  app.listen(8001, () => {
    console.log("bid service running on 8001");
  });
}

start();
