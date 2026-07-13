const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();

app.use(cors());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests, slow down" },
});

app.use(limiter);

const services = {
  listing: "http://localhost:8000",
  bid: "http://localhost:8001",
  auction: "http://localhost:8002",
  notification: "http://localhost:8003",
};

app.use(
  "/api/listing",
  createProxyMiddleware({
    target: services.listing,
    changeOrigin: true,
    pathRewrite: { "^/api/listing": "" },
  })
);

app.use(
  "/api/bid",
  createProxyMiddleware({
    target: services.bid,
    changeOrigin: true,
    pathRewrite: { "^/api/bid": "" },
  })
);

app.use(
  "/api/auction",
  createProxyMiddleware({
    target: services.auction,
    changeOrigin: true,
    pathRewrite: { "^/api/auction": "" },
  })
);

app.use(
  "/api/notification",
  createProxyMiddleware({
    target: services.notification,
    changeOrigin: true,
    pathRewrite: { "^/api/notification": "" },
  })
);

app.get("/health", (req, res) => {
  res.json({
    status: "gateway running",
    services: Object.keys(services),
  });
});

app.listen(5000, () => {
  console.log("api gateway running on 5000");
});
