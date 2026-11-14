import { Link } from "react-router-dom";
import { useContext } from "react";

import { CartContext } from "../../context/CartContextValue";
import { WishlistContext } from "../../context/WishlistContextValue";

import "./ProductCard.css";

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  const { toggleWishlist, isInWishlist } =
    useContext(WishlistContext);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const categoryName =
    product.category &&
    typeof product.category === "object"
      ? product.category.name
      : product.category;

  const stockQuantity =
    Number(product.stock_quantity) || 0;

  const isOutOfStock =
    stockQuantity <= 0;

  const isLowStock =
    stockQuantity > 0 &&
    stockQuantity <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    addToCart(product);
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  const handleImageError = (event) => {
    event.currentTarget.src =
      "https://placehold.co/900x700/f1f5f9/64748b?text=CloudCart";
  };

  const productInWishlist =
    isInWishlist(product.id);

  return (
    <article className="product-card">

      <div className="product-image-wrapper">

        {product.badge && (
          <span className="product-badge">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          className={
            productInWishlist
              ? "wishlist-button wishlist-active"
              : "wishlist-button"
          }
          onClick={handleWishlist}
          aria-label={
            productInWishlist
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          {productInWishlist ? "♥" : "♡"}
        </button>

        <Link to={"/products/" + product.id}>
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            onError={handleImageError}
          />
        </Link>

      </div>

      <div className="product-content">

        <span className="product-category">
          {categoryName}
        </span>

        <Link
          to={"/products/" + product.id}
          className="product-name-link"
        >
          <h3 className="product-name">
            {product.name}
          </h3>
        </Link>

        <div className="product-rating">

          <span className="stars">
            ★
          </span>

          <span className="rating-value">
            {product.rating}
          </span>

          <span className="reviews">
            ({product.reviews})
          </span>

        </div>

        <div className="product-price-row">

          <div className="product-prices">

            <span className="product-price">
              {formatPrice(product.price)}
            </span>

            {product.old_price !== null &&
              product.old_price !== undefined && (
                <span className="product-old-price">
                  {formatPrice(product.old_price)}
                </span>
              )}

          </div>

          {product.old_price &&
            Number(product.old_price) >
              Number(product.price) && (
              <span className="discount-badge">
                {Math.round(
                  ((Number(product.old_price) -
                    Number(product.price)) /
                    Number(product.old_price)) *
                    100
                )}
                % OFF
              </span>
            )}

        </div>

        {/* Stock Information */}
        {isOutOfStock ? (
          <div className="product-stock out-of-stock">
            Out of Stock
          </div>
        ) : isLowStock ? (
          <div className="product-stock low-stock">
            Only {stockQuantity} left
          </div>
        ) : (
          <div className="product-stock in-stock">
            In Stock
          </div>
        )}

        <button
          type="button"
          className={
            isOutOfStock
              ? "add-to-cart-button disabled"
              : "add-to-cart-button"
          }
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock
            ? "Out of Stock"
            : "🛒 Add to Cart"}
        </button>

      </div>

    </article>
  );
}

export default ProductCard;

