"use client";

import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function Activity() {
  const [notifs, setNotifs] = useState([]);

  async function fetchNotifs() {
    const res = await fetch(`${API}/notification/notifications`);
    const data = await res.json();
    setNotifs(data);
  }

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 3000);
    return () => clearInterval(interval);
  }, []);

  async function markRead(id) {
    await fetch(`${API}/notification/notifications/${id}/read`, {
      method: "PATCH",
    });
    fetchNotifs();
  }

  return (
    <div>
      <h1 className="page-title">Activity Feed</h1>

      {notifs.length === 0 ? (
        <div className="empty">No activity yet. Place a bid to see updates.</div>
      ) : (
        notifs.map((n) => (
          <div key={n._id} className={`card ${!n.read ? "notif-unread" : ""}`}>
            <div className="card-row">
              <div>
                <div className="card-title">{n.message}</div>
                <div className="card-sub">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                {!n.read ? (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => markRead(n._id)}
                  >
                    Mark read
                  </button>
                ) : (
                  <span className="badge badge-info">Read</span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
