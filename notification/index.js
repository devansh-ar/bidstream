const express = require("express");
const cors = require("cors");
const amqp = require("amqplib");
const { Notification } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/notifications", async (req, res) => {
  const notifs = await Notification.find().sort({ createdAt: -1 });
  res.json(notifs);
});

app.patch("/notifications/:id/read", async (req, res) => {
  const notif = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );
  if (!notif) {
    return res.status(404).json({ message: "Notification not found" });
  }
  res.json(notif);
});

async function start() {
  const conn = await amqp.connect(process.env.RABBIT_URI || "amqp://localhost");
  const channel = await conn.createChannel();

  await channel.assertQueue("bid.updated", { durable: true });

  channel.consume("bid.updated", async (msg) => {
    const data = JSON.parse(msg.content.toString());

    await Notification.create({
      listingId: data.listingId,
      listingTitle: data.listingTitle,
      message: `${data.bidder} bid Rs.${data.amount} on ${data.listingTitle}`,
      type: "bid",
    });

    channel.ack(msg);
  });

  console.log("notification service connected to rabbitmq");

  app.listen(8003, () => {
    console.log("notification service running on 8003");
  });
}

start();
