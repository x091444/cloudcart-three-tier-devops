import { useContext } from "react";
import { Link } from "react-router-dom";

import { CartContext } from "../../context/CartContext";

import "./Cart.css";

function Cart() {
  const {
    cartItems,
    cartCount,
    subtotal,
    shipping,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useContext(CartContext);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));

  const getCategoryName = (category) => {
    if (
      category &&
      typeof category === "object"
    ) {
      return category.name;
    }

    return category;
  };

  const handleImageError = (event) => {
    event.currentTarget.src =
      "https://placehold.co/600x500/f1f5f9/64748b?text=CloudCart";
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">

          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h1>
              Your cart is empty
            </h1>

            <p>
              Looks like you haven't added anything to your
              cart yet. Explore our products and find
              something you love.
            </p>

            <Link
              to="/products"
              className="continue-shopping-button"
            >
              Continue Shopping
            </Link>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">

        {/* Header */}
        <div className="cart-header">

          <div>

            <span className="cart-eyebrow">
              CLOUDCART
            </span>

            <h1>
              Shopping Cart
            </h1>

            <p>
              {cartCount}{" "}
              {cartCount === 1
                ? "item"
                : "items"}{" "}
              in your cart
            </p>

          </div>

          <button
            type="button"
            className="clear-cart-button"
            onClick={clearCart}
          >
            Clear Cart
          </button>

        </div>

        {/* Cart Content */}
        <div className="cart-layout">

          {/* Items */}
          <section className="cart-items-section">

            {cartItems.map((item) => (
              <article
                className="cart-item"
                key={item.id}
              >

                <Link
                  to={"/products/" + item.id}
                  className="cart-item-image-link"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                    onError={handleImageError}
                  />
                </Link>

                <div className="cart-item-details">

                  <span className="cart-item-category">
                    {getCategoryName(
                      item.category
                    )}
                  </span>

                  <Link
                    to={"/products/" + item.id}
                    className="cart-item-name"
                  >
                    {item.name}
                  </Link>

                  <span className="cart-item-price">
                    {formatPrice(item.price)}
                  </span>

                  <div className="cart-item-actions">

                    <div className="cart-quantity">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                        disabled={item.quantity === 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>

                    </div>

                    <button
                      type="button"
                      className="remove-item-button"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>

                <div className="cart-item-total">
                  {formatPrice(
                    Number(item.price) *
                      Number(item.quantity)
                  )}
                </div>

              </article>
            ))}

            <Link
              to="/products"
              className="continue-shopping-link"
            >
              ← Continue Shopping
            </Link>

          </section>

          {/* Summary */}
          <aside className="cart-summary">

            <h2>
              Order Summary
            </h2>

            <div className="summary-row">

              <span>
                Subtotal ({cartCount}{" "}
                {cartCount === 1
                  ? "item"
                  : "items"})
              </span>

              <strong>
                {formatPrice(subtotal)}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Shipping
              </span>

              <strong>
                {shipping === 0
                  ? "FREE"
                  : formatPrice(shipping)}
              </strong>

            </div>

            {shipping === 0 && (
              <div className="free-shipping-message">
                ✓ You qualify for free shipping
              </div>
            )}

            {shipping > 0 && subtotal < 1000 && (
              <div className="shipping-hint">
                Add{" "}
                {formatPrice(
                  1000 - subtotal
                )}{" "}
                more for free shipping
              </div>
            )}

            <div className="summary-divider" />

            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                {formatPrice(total)}
              </strong>

            </div>

            <Link
              to="/checkout"
              className="checkout-button"
            >
              Proceed to Checkout
            </Link>

            <div className="secure-checkout">

              <span>
                🔒
              </span>

              <div>

                <strong>
                  Secure Checkout
                </strong>

                <small>
                  Your information is protected
                </small>

              </div>

            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}

export default Cart;

