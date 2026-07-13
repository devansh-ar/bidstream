const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/notification_db");

const notificationSchema = new mongoose.Schema({
  listingId: String,
  listingTitle: String,
  message: String,
  type: {
    type: String,
    default: "bid",
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
