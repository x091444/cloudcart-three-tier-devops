import { useContext } from "react";
import { Link } from "react-router-dom";

import { WishlistContext } from "../../context/WishlistContextValue";
import ProductCard from "../../components/ProductCard/ProductCard";

import "./Wishlist.css";

function Wishlist() {
  const {
    wishlistItems,
    wishlistCount,
    clearWishlist,
  } = useContext(WishlistContext);

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">♡</div>

            <span className="wishlist-eyebrow">
              CLOUDCART
            </span>

            <h1>Your wishlist is empty</h1>

            <p>
              Save products you love here and come back to
              them whenever you're ready.
            </p>

            <Link
              to="/products"
              className="browse-products-button"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">

        {/* Header */}
        <div className="wishlist-header">
          <div>
            <span className="wishlist-eyebrow">
              CLOUDCART
            </span>

            <h1>My Wishlist</h1>

            <p>
              {wishlistCount}{" "}
              {wishlistCount === 1 ? "product" : "products"}{" "}
              saved for later
            </p>
          </div>

          <button
            className="clear-wishlist-button"
            onClick={clearWishlist}
          >
            Clear Wishlist
          </button>
        </div>

        {/* Wishlist Products */}
        <section className="wishlist-products">
          {wishlistItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </section>

        {/* Bottom CTA */}
        <div className="wishlist-footer">
          <Link
            to="/products"
            className="wishlist-continue-link"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;