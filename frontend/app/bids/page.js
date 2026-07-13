"use client";

import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function Bids() {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    fetch(`${API}/bid/bids`)
      .then((r) => r.json())
      .then(setBids);
  }, []);

  return (
    <div>
      <h1 className="page-title">All Bids</h1>

      {bids.length === 0 ? (
        <div className="empty">No bids placed yet.</div>
      ) : (
        bids.map((b) => (
          <div key={b._id} className="card">
            <div className="card-row">
              <div>
                <div className="card-title">
                  {b.bidder}
                  <span className="card-sub" style={{ marginLeft: 10 }}>
                    on {b.listingTitle || "listing"}
                  </span>
                </div>
                <div className="card-sub">
                  {new Date(b.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="bid-amount">Rs.{b.amount}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
