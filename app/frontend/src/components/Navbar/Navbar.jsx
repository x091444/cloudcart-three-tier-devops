import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { CartContext } from "../../context/CartContextValue";
import { WishlistContext } from "../../context/WishlistContextValue";
import { AuthContext } from "../../context/AuthContextValue";

import "./Navbar.css";

function Navbar() {
  const { cartCount } = useContext(CartContext);
  const { wishlistCount } = useContext(WishlistContext);
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const username =
    user && user.username
      ? user.username
      : "Account";

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          Cloud<span>Cart</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-links">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/products" end>
            Products
          </NavLink>
        </nav>

        {/* Navbar Actions */}
        <div className="navbar-actions">

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="navbar-action"
            aria-label="Wishlist"
          >
            <span className="navbar-icon">
              ♡
            </span>

            {wishlistCount > 0 && (
              <span className="navbar-badge">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="navbar-action"
            aria-label="Cart"
          >
            <span className="navbar-icon">
              🛒
            </span>

            {cartCount > 0 && (
              <span className="navbar-badge">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account */}
          <div className="navbar-account">

            <button
              type="button"
              className={
                isAuthenticated
                  ? "account-button account-logged-in"
                  : "account-button"
              }
              onClick={() =>
                setAccountOpen(function (previous) {
                  return !previous;
                })
              }
            >
              <span className="account-icon">
                {isAuthenticated ? "👤" : "♙"}
              </span>

              <span className="account-name">
                {isAuthenticated
                  ? "Hi, " + username
                  : "Account"}
              </span>

              <span className="account-arrow">
                ▾
              </span>
            </button>

            {accountOpen && (
              <div className="account-dropdown">

                {isAuthenticated ? (
                  <>
                    <div className="account-user">
                      <strong>
                        {user.username}
                      </strong>
                    </div>

                    <div className="account-divider" />

                    <Link
                      to="/orders"
                      onClick={closeMenu}
                    >
                      📦 My Orders
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={closeMenu}
                    >
                      ♡ Wishlist
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="logout-button"
                    >
                      ↪ Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="account-dropdown-title">
                      Welcome to CloudCart
                    </div>

                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="dropdown-login"
                    >
                      Sign In
                    </Link>

                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="dropdown-register"
                    >
                      Create Account
                    </Link>
                  </>
                )}

              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMenuOpen(function (previous) {
                return !previous;
              })
            }
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="mobile-navigation">

            <NavLink
              to="/"
              end
              onClick={closeMenu}
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              end
              onClick={closeMenu}
            >
              Products
            </NavLink>

            <NavLink
              to="/wishlist"
              onClick={closeMenu}
            >
              Wishlist
            </NavLink>

            <NavLink
              to="/cart"
              onClick={closeMenu}
            >
              Cart
            </NavLink>

            <NavLink
              to="/orders"
              onClick={closeMenu}
            >
              Orders
            </NavLink>

            {!isAuthenticated ? (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                >
                  Sign In
                </NavLink>

                <NavLink
                  to="/register"
                  onClick={closeMenu}
                >
                  Create Account
                </NavLink>
              </>
            ) : (
              <button
                type="button"
                className="mobile-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}

          </nav>
        )}

      </div>
    </header>
  );
}

export default Navbar;
