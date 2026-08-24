import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <span className="footer-logo">2CAL</span>
        <nav className="footer-links">
          <a href="#stack">the stack</a>
          <a href="#shop">shop</a>
          <a href="#social">instagram</a>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>Copyright 2026 2CAL. All rights reserved.</span>
        <div className="footer-legal">
          <a href="#">Terms and conditions</a>
          <a href="#">Refund and cancellation</a>
          <a href="#">Shipping and delivery</a>
          <a href="#">Contact us</a>
        </div>
      </div>
    </footer>
  )
}
