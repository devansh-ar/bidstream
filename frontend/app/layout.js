import "./globals.css";
import Nav from "./components/Nav";

export const metadata = {
  title: "BidStream",
  description: "Live auction platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
