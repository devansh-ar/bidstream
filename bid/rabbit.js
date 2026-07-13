const amqp = require("amqplib");

let channel = null;

async function connectRabbit() {
  const conn = await amqp.connect("amqp://localhost");
  channel = await conn.createChannel();
  await channel.assertQueue("bid.placed", { durable: true });
  return channel;
}

function getChannel() {
  return channel;
}

module.exports = { connectRabbit, getChannel };
