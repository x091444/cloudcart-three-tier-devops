import { Link } from "react-router-dom";

import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-brand-column">
            <Link to="/" className="footer-brand">
              <span className="footer-brand-icon">☁</span>
              <span>
                Cloud<span>Cart</span>
              </span>
            </Link>

            <p className="footer-description">
              Your destination for modern technology, electronics and
              accessories. Discover products that make your digital life
              better.
            </p>

            <div className="footer-socials">
              <a href="#" aria-label="Instagram">
                ◎
              </a>

              <a href="#" aria-label="Facebook">
                f
              </a>

              <a href="#" aria-label="Twitter">
                𝕏
              </a>

              <a href="#" aria-label="LinkedIn">
                in
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Shop</h3>

            <Link to="/products">All Products</Link>
            <Link to="/products">Laptops</Link>
            <Link to="/products">Smartphones</Link>
            <Link to="/products">Audio</Link>
            <Link to="/products">Accessories</Link>
          </div>

          <div className="footer-column">
            <h3>Account</h3>

            <Link to="/login">Login</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/cart">Shopping Cart</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/orders">My Orders</Link>
          </div>

          <div className="footer-column">
            <h3>Help</h3>

            <a href="#">Contact Us</a>
            <a href="#">Shipping Information</a>
            <a href="#">Returns & Refunds</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
          </div>

          <div className="footer-column footer-contact">
            <h3>Contact</h3>

            <div className="contact-item">
              <span>📍</span>
              <p>Kerala, India</p>
            </div>

            <div className="contact-item">
              <span>✉</span>
              <p>support@cloudcart.in</p>
            </div>

            <div className="contact-item">
              <span>☎</span>
              <p>+91 90000 00000</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-container">
          <p>
            © {currentYear} CloudCart. All rights reserved.
          </p>

          <p>
            Built with React • Designed for the cloud
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;