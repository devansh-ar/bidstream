const express = require("express");
const cors = require("cors");
const amqp = require("amqplib");
const axios = require("axios");
const { AuctionLog } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/auctions", async (req, res) => {
  const logs = await AuctionLog.find().sort({ updatedAt: -1 });
  res.json(logs);
});

app.get("/auctions/:listingId", async (req, res) => {
  const log = await AuctionLog.findOne({ listingId: req.params.listingId });
  if (!log) {
    return res.status(404).json({ message: "No auction data found" });
  }
  res.json(log);
});

async function start() {
  const conn = await amqp.connect("amqp://localhost");
  const channel = await conn.createChannel();

  await channel.assertQueue("bid.placed", { durable: true });
  await channel.assertQueue("bid.updated", { durable: true });

  channel.consume("bid.placed", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    let log = await AuctionLog.findOne({ listingId: data.listingId });

    if (!log) {
      log = await AuctionLog.create({
        listingId: data.listingId,
        listingTitle: data.listingTitle,
        highestBid: data.amount,
        highestBidder: data.bidder,
        totalBids: data.totalBids,
      });
    } else {
      log.highestBid = data.amount;
      log.highestBidder = data.bidder;
      log.totalBids = data.totalBids;
      log.updatedAt = new Date();
      await log.save();
    }

    try {
      await axios.patch(
        `http://localhost:8000/listings/${data.listingId}/bid`,
        {
          amount: data.amount,
          bidder: data.bidder,
          totalBids: data.totalBids,
        }
      );
    } catch (err) {
      console.log("failed to update listing:", err.message);
    }

    channel.sendToQueue(
      "bid.updated",
      Buffer.from(
        JSON.stringify({
          listingId: data.listingId,
          listingTitle: data.listingTitle,
          bidder: data.bidder,
          amount: data.amount,
          totalBids: data.totalBids,
        })
      ),
      { persistent: true }
    );

    channel.ack(msg);
  });

  console.log("auction service connected to rabbitmq");

  app.listen(8002, () => {
    console.log("auction service running on 8002");
  });
}

start();
