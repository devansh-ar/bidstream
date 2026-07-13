# BidStream

Live auction platform built with microservices architecture. 5 independent services communicate asynchronously through RabbitMQ message queues.

## Architecture

```
                    +------------------+
                    |   Next.js App    |
                    |   (port 3000)    |
                    +--------+---------+
                             |
                        HTTP requests
                             |
                    +--------v---------+
                    |   API Gateway    |
                    |   (port 5000)    |
                    |  rate limiting   |
                    |  proxy routing   |
                    +--------+---------+
                             |
          +------------------+------------------+
          |                  |                  |
 +--------v------+  +-------v-------+  +-------v--------+
 | Listing Svc   |  | Bid Svc       |  | Auction Svc    |
 | (8000)        |  | (8001)        |  | (8002)         |
 | listing_db    |  | bid_db        |  | auction_db     |
 +---------------+  +-------+-------+  +---+-----+------+
                            |               ^     |
                       bid.placed      bid.placed  |
                            |               |     |
                    +-------v---------------+     |
                    |        RabbitMQ              |
                    +---------+-------------------+
                              |
                         bid.updated
                              |
                    +---------v------+
                    | Notification   |
                    | Svc (8003)     |
                    | notification_db|
                    +----------------+
```

## Services

| Service | Port | Database | RabbitMQ |
|---------|------|----------|----------|
| Gateway | 5000 | - | - |
| Listing | 8000 | listing_db | - |
| Bid | 8001 | bid_db | Publishes `bid.placed` |
| Auction | 8002 | auction_db | Consumes `bid.placed`, publishes `bid.updated` |
| Notification | 8003 | notification_db | Consumes `bid.updated` |

## How It Works

1. Seller posts an auction listing with a starting price and duration
2. Buyer places a bid — Bid Service validates (is auction active? is bid higher than current?) and saves it
3. Bid Service publishes `bid.placed` to RabbitMQ
4. Auction Service consumes the message, updates the listing with the new highest bid, publishes `bid.updated`
5. Notification Service consumes `bid.updated`, creates an activity feed entry

The bidder gets an instant response at step 2. Steps 3-5 happen asynchronously in the background.

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB (separate DB per service)
- **Message Queue:** RabbitMQ (via Docker)
- **Frontend:** Next.js
- **Gateway:** http-proxy-middleware, express-rate-limit

## Prerequisites

- Node.js
- MongoDB
- Docker (for RabbitMQ)

## Setup

Start RabbitMQ:
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.13-management
```

Install dependencies:
```bash
cd listing && npm install
cd ../bid && npm install
cd ../auction && npm install
cd ../notification && npm install
cd ../gateway && npm install
cd ../frontend && npm install
```

Run each service in a separate terminal:
```bash
cd listing && node index.js
cd bid && node index.js
cd auction && node index.js
cd notification && node index.js
cd gateway && node index.js
cd frontend && npm run dev
```

Open `http://localhost:3000`

## RabbitMQ Dashboard

Open `http://localhost:15672` (guest/guest) to see queues, message rates, and consumers in real-time.

Try stopping the Notification Service, place a few bids, watch messages pile up in the `bid.updated` queue, then restart the service and watch it drain — zero messages lost.
