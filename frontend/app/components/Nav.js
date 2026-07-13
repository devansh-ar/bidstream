"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        BidStream
      </Link>
      <ul className="nav-links">
        <li>
          <Link href="/" className={path === "/" ? "active" : ""}>
            Auctions
          </Link>
        </li>
        <li>
          <Link href="/bids" className={path === "/bids" ? "active" : ""}>
            Bids
          </Link>
        </li>
        <li>
          <Link
            href="/notifications"
            className={path === "/notifications" ? "active" : ""}
          >
            Activity
          </Link>
        </li>
      </ul>
    </nav>
  );
}
