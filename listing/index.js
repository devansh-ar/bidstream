const express = require("express");
const cors = require("cors");
const { Listing } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/listings", async (req, res) => {
  const listings = await Listing.find().sort({ createdAt: -1 });
  res.json(listings);
});

app.get("/listings/:id", async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }
  res.json(listing);
});

app.post("/listings", async (req, res) => {
  const { title, description, image, startingPrice, endsAt } = req.body;

  if (!title || !startingPrice || !endsAt) {
    return res
      .status(400)
      .json({ message: "Title, starting price and end time are required" });
  }

  const listing = await Listing.create({
    title,
    description,
    image,
    startingPrice,
    currentBid: startingPrice,
    endsAt: new Date(endsAt),
  });

  res.status(201).json(listing);
});

app.patch("/listings/:id/bid", async (req, res) => {
  const { amount, bidder, totalBids } = req.body;

  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    {
      currentBid: amount,
      currentBidder: bidder,
      totalBids: totalBids,
    },
    { new: true }
  );

  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }
  res.json(listing);
});

app.patch("/listings/:id/end", async (req, res) => {
  const { winner } = req.body;

  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { status: "ended", winner },
    { new: true }
  );

  res.json(listing);
});

app.listen(8000, () => {
  console.log("listing service running on 8000");
});
