"use client";

import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function Auctions() {
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    startingPrice: "",
    hours: "24",
  });

  async function fetchListings() {
    const res = await fetch(`${API}/listing/listings`);
    const data = await res.json();
    setListings(data);
  }

  useEffect(() => {
    fetchListings();
    const interval = setInterval(fetchListings, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const endsAt = new Date(
      Date.now() + Number(form.hours) * 60 * 60 * 1000
    ).toISOString();

    await fetch(`${API}/listing/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        image: form.image,
        startingPrice: Number(form.startingPrice),
        endsAt,
      }),
    });
    setForm({ title: "", description: "", image: "", startingPrice: "", hours: "24" });
    setShowForm(false);
    fetchListings();
  }

  return (
    <div>
      <div className="card-row" style={{ marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Live Auctions
        </h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Post Listing"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 20 }}>
          <div className="grid-2">
            <div className="form-group">
              <label>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="iPhone 15 Pro Max"
                required
              />
            </div>
            <div className="form-group">
              <label>Starting Price (Rs.)</label>
              <input
                type="number"
                value={form.startingPrice}
                onChange={(e) =>
                  setForm({ ...form, startingPrice: e.target.value })
                }
                placeholder="10000"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Brand new, sealed box"
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Image URL (optional)</label>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label>Duration (hours)</label>
              <input
                type="number"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                min="1"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Start Auction
          </button>
        </form>
      )}

      {listings.length === 0 ? (
        <div className="empty">No auctions yet. Post one above.</div>
      ) : (
        listings.map((l) => (
          <ListingCard key={l._id} listing={l} onBid={fetchListings} />
        ))
      )}
    </div>
  );
}

function getTimeLeft(endsAt) {
  const diff = new Date(endsAt) - new Date();
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  if (hours > 0) return `${hours}h ${mins}m left`;
  if (mins > 0) return `${mins}m ${secs}s left`;
  return `${secs}s left`;
}

function ListingCard({ listing, onBid }) {
  const [bidder, setBidder] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(listing.endsAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(listing.endsAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [listing.endsAt]);

  const ended = listing.status === "ended" || timeLeft === "Ended";

  async function placeBid() {
    if (!bidder || !amount) return;
    setLoading(true);
    setMsg({ text: "", type: "" });

    const res = await fetch(`${API}/bid/bids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: listing._id,
        bidder,
        amount: Number(amount),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMsg({ text: "Bid placed!", type: "ok" });
      setAmount("");
      onBid();
    } else {
      setMsg({ text: data.message, type: "err" });
    }
    setLoading(false);
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  }

  return (
    <div className="card">
      <div className="card-row">
        <div>
          <div className="card-title">{listing.title}</div>
          {listing.description && (
            <div className="card-sub">{listing.description}</div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="bid-amount">Rs.{listing.currentBid}</div>
          <div className="bid-count">
            {listing.totalBids} bid{listing.totalBids !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
        <span className={`timer ${ended ? "expired" : ""}`}>{timeLeft}</span>
        {listing.currentBidder && (
          <span className="card-sub" style={{ marginTop: 0 }}>
            Highest: {listing.currentBidder}
          </span>
        )}
        <span
          className={`badge ${ended ? "badge-ended" : "badge-active"}`}
          style={{ marginLeft: "auto" }}
        >
          {ended ? "Ended" : "Active"}
        </span>
      </div>

      {!ended && (
        <div className="bid-form">
          <input
            className="bid-name-input"
            placeholder="Your name"
            value={bidder}
            onChange={(e) => setBidder(e.target.value)}
          />
          <input
            type="number"
            placeholder={`Min ${listing.currentBid + 1}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={placeBid}
            disabled={loading}
          >
            {loading ? "Bidding..." : "Place Bid"}
          </button>
        </div>
      )}
      {msg.text && (
        <div className={`msg msg-${msg.type}`}>{msg.text}</div>
      )}
    </div>
  );
}
