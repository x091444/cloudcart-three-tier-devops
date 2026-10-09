import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";
import { getProduct } from "../../services/api";

import "./ProductDetails.css";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } =
    useContext(WishlistContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingStock, setCheckingStock] = useState(false);
  const [error, setError] = useState("");
  const [stockError, setStockError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  /*
   * Initial product load
   */
  useEffect(() => {
    const controller = new AbortController();

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProduct(productId, {
          signal: controller.signal,
        });

        setProduct(data);
        setQuantity(1);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(
            requestError.message ||
              "Unable to load product."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();

    return () => {
      controller.abort();
    };
  }, [productId]);

  /*
   * Silent automatic stock refresh
   *
   * Runs every 5 seconds while the user
   * remains on the Product Details page.
   *
   * There is NO loading state here, so the
   * page does not flicker.
   */
  useEffect(() => {
    if (!productId) {
      return;
    }

    const refreshStock = async () => {
      try {
        const latestProduct =
          await getProduct(productId);

        const latestStock =
          Number(
            latestProduct.stock_quantity
          ) || 0;

        setProduct((currentProduct) => {
          if (!currentProduct) {
            return latestProduct;
          }

          /*
           * Only update React state if the
           * stock quantity actually changed.
           *
           * This prevents unnecessary renders.
           */
          const currentStock =
            Number(
              currentProduct.stock_quantity
            ) || 0;

          if (currentStock === latestStock) {
            return currentProduct;
          }

          return {
            ...currentProduct,
            stock_quantity:
              latestProduct.stock_quantity,
          };
        });

        /*
         * If another customer purchased stock
         * while this user was viewing the page,
         * make sure their selected quantity
         * doesn't exceed the new stock.
         */
        setQuantity((currentQuantity) => {
          if (latestStock <= 0) {
            return 1;
          }

          return Math.min(
            currentQuantity,
            latestStock
          );
        });

        /*
         * Clear an old stock warning after
         * successfully getting the latest stock.
         */
        setStockError("");
      } catch (requestError) {
        /*
         * Background refresh failure should
         * NOT disturb the user's page.
         */
        console.error(
          "Background stock refresh failed:",
          requestError
        );
      }
    };

    /*
     * Check every 5 seconds.
     */
    const intervalId = setInterval(
      refreshStock,
      5000
    );

    /*
     * Stop checking when the user leaves
     * the Product Details page.
     */
    return () => {
      clearInterval(intervalId);
    };
  }, [productId]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-loading">
          Loading product...
        </div>
      </main>
    );
  }

  /*
   * Error state
   */
  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="product-details-not-found">
          <h2>Product not found</h2>

          <p>
            {error ||
              "This product could not be loaded."}
          </p>

          <Link
            to="/products"
            className="back-to-products"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  /*
   * Current stock
   */
  const stockQuantity =
    Number(product.stock_quantity) || 0;

  const isOutOfStock =
    stockQuantity <= 0;

  const isLowStock =
    stockQuantity > 0 &&
    stockQuantity <= 5;

  const maximumQuantity =
    Math.max(stockQuantity, 1);

  /*
   * Price formatter
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  /*
   * Category
   */
  const categoryName =
    product.category &&
    typeof product.category === "object"
      ? product.category.name
      : product.category_name ||
        product.category;

  /*
   * Wishlist
   */
  const productInWishlist =
    isInWishlist(product.id);

  /*
   * Increase quantity
   */
  const handleIncrease = () => {
    if (isOutOfStock) {
      return;
    }

    setQuantity((current) =>
      Math.min(
        current + 1,
        maximumQuantity
      )
    );
  };

  /*
   * Decrease quantity
   */
  const handleDecrease = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  /*
   * Added to cart message
   */
  const showAddedMessage = () => {
    setAddedMessage(true);

    setTimeout(() => {
      setAddedMessage(false);
    }, 2500);
  };

  /*
   * Final stock verification
   *
   * This happens immediately before
   * Add to Cart / Buy Now.
   */
  const checkLatestStock = async () => {
    try {
      setCheckingStock(true);
      setStockError("");

      const latestProduct =
        await getProduct(productId);

      const latestStock =
        Number(
          latestProduct.stock_quantity
        ) || 0;

      /*
       * Update the displayed stock only.
       */
      setProduct((currentProduct) => {
        if (!currentProduct) {
          return latestProduct;
        }

        const currentStock =
          Number(
            currentProduct.stock_quantity
          ) || 0;

        if (currentStock === latestStock) {
          return currentProduct;
        }

        return {
          ...currentProduct,
          stock_quantity:
            latestProduct.stock_quantity,
        };
      });

      /*
       * No stock available.
       */
      if (latestStock <= 0) {
        setQuantity(1);

        setStockError(
          "Sorry, this product is now out of stock."
        );

        return null;
      }

      /*
       * Requested quantity is greater
       * than the latest available stock.
       */
      if (quantity > latestStock) {
        setQuantity(latestStock);

        setStockError(
          `Only ${latestStock} item(s) are currently available.`
        );

        return null;
      }

      /*
       * Stock is sufficient.
       */
      return latestProduct;
    } catch (requestError) {
      console.error(
        "Final stock check failed:",
        requestError
      );

      setStockError(
        "Unable to verify the latest stock. Please try again."
      );

      return null;
    } finally {
      setCheckingStock(false);
    }
  };

  /*
   * Add to Cart
   */
  const handleAddToCart = async () => {
    if (
      checkingStock ||
      isOutOfStock
    ) {
      return;
    }

    /*
     * Get the latest database stock.
     */
    const latestProduct =
      await checkLatestStock();

    if (!latestProduct) {
      return;
    }

    const latestStock =
      Number(
        latestProduct.stock_quantity
      ) || 0;

    /*
     * Final frontend protection.
     */
    if (
      latestStock <= 0 ||
      quantity > latestStock
    ) {
      return;
    }

    /*
     * Add the requested quantity.
     */
    for (
      let i = 0;
      i < quantity;
      i += 1
    ) {
      addToCart(latestProduct);
    }

    showAddedMessage();
  };

  /*
   * Buy Now
   */
  const handleBuyNow = async () => {
    if (
      checkingStock ||
      isOutOfStock
    ) {
      return;
    }

    /*
     * Get the latest database stock.
     */
    const latestProduct =
      await checkLatestStock();

    if (!latestProduct) {
      return;
    }

    const latestStock =
      Number(
        latestProduct.stock_quantity
      ) || 0;

    /*
     * Final frontend protection.
     */
    if (
      latestStock <= 0 ||
      quantity > latestStock
    ) {
      return;
    }

    /*
     * Add the requested quantity.
     */
    for (
      let i = 0;
      i < quantity;
      i += 1
    ) {
      addToCart(latestProduct);
    }

    navigate("/checkout");
  };

  /*
   * Wishlist
   */
  const handleWishlist = () => {
    toggleWishlist(product);
  };

  /*
   * Product image fallback
   */
  const handleImageError = (event) => {
    event.currentTarget.src =
      "https://placehold.co/900x700/f1f5f9/64748b?text=CloudCart";
  };

  /*
   * Stock message
   */
  const getStockMessage = () => {
    if (isOutOfStock) {
      return "Out of Stock";
    }

    if (isLowStock) {
      return `Only ${stockQuantity} left`;
    }

    return "In Stock";
  };

  /*
   * Stock CSS class
   */
  const stockClass = isOutOfStock
    ? "out-of-stock"
    : isLowStock
      ? "low-stock"
      : "in-stock";

  return (
    <main className="product-details-page">

      <div className="product-details-container">

        {/* Breadcrumb */}
        <nav className="product-breadcrumb">

          <Link to="/">
            Home
          </Link>

          <span>/</span>

          <Link to="/products">
            Products
          </Link>

          <span>/</span>

          <span>
            {product.name}
          </span>

        </nav>

        {/* Main Product */}
        <section className="product-details-main">

          {/* Product Image */}
          <div className="product-details-image-section">

            <div className="product-details-image-wrapper">

              <img
                src={product.image}
                alt={product.name}
                className="product-details-image"
                onError={handleImageError}
              />

              {product.badge && (
                <span className="product-details-badge">
                  {product.badge}
                </span>
              )}

            </div>

          </div>

          {/* Product Information */}
          <div className="product-details-info">

            <p className="product-details-category">
              {categoryName}
            </p>

            <h1>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="product-details-rating">

              <span className="stars">
                ★★★★★
              </span>

              <span className="rating-value">
                {Number(product.rating).toFixed(1)}
              </span>

              <span className="review-count">
                ({product.reviews} reviews)
              </span>

            </div>

            {/* Price */}
            <div className="product-details-price-row">

              <span className="product-details-price">
                {formatPrice(product.price)}
              </span>

              {product.old_price && (
                <span className="product-details-old-price">
                  {formatPrice(
                    product.old_price
                  )}
                </span>
              )}

            </div>

            {/* Stock */}
            <div
              className={`details-stock ${stockClass}`}
            >

              <span className="stock-dot"></span>

              <span>
                {getStockMessage()}
              </span>

            </div>

            {/* Stock Error */}
            {stockError && (
              <div className="stock-error-message">
                {stockError}
              </div>
            )}

            {/* Description */}
            <div className="product-details-description">

              <h3>
                Description
              </h3>

              <p>
                {product.description}
              </p>

            </div>

            {/* Features */}
            {product.features &&
              product.features.length > 0 && (
                <div className="product-details-features">

                  <h3>
                    Key Features
                  </h3>

                  <ul>
                    {product.features.map(
                      (feature, index) => (
                        <li key={index}>
                          {feature}
                        </li>
                      )
                    )}
                  </ul>

                </div>
              )}

            {/* Quantity */}
            <div className="product-details-quantity-section">

              <div className="quantity-label">

                <span>
                  Quantity
                </span>

                {!isOutOfStock && (
                  <span className="quantity-stock">
                    {stockQuantity} available
                  </span>
                )}

              </div>

              <div className="quantity-control">

                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={
                    isOutOfStock ||
                    quantity <= 1 ||
                    checkingStock
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={
                    isOutOfStock ||
                    quantity >= stockQuantity ||
                    checkingStock
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

              {!isOutOfStock &&
                quantity >= stockQuantity && (
                  <p className="quantity-limit-message">
                    Maximum available quantity reached.
                  </p>
                )}

            </div>

            {/* Actions */}
            <div className="product-details-actions">

              <button
                type="button"
                className={`details-add-cart ${
                  isOutOfStock ||
                  checkingStock
                    ? "disabled"
                    : ""
                }`}
                onClick={handleAddToCart}
                disabled={
                  isOutOfStock ||
                  checkingStock
                }
              >
                {checkingStock
                  ? "Checking Stock..."
                  : isOutOfStock
                    ? "Out of Stock"
                    : "🛒 Add to Cart"}
              </button>

              <button
                type="button"
                className={`details-buy-now ${
                  isOutOfStock ||
                  checkingStock
                    ? "disabled"
                    : ""
                }`}
                onClick={handleBuyNow}
                disabled={
                  isOutOfStock ||
                  checkingStock
                }
              >
                {checkingStock
                  ? "Checking..."
                  : isOutOfStock
                    ? "Unavailable"
                    : "Buy Now"}
              </button>

              <button
                type="button"
                className={`details-wishlist ${
                  productInWishlist
                    ? "active"
                    : ""
                }`}
                onClick={handleWishlist}
                aria-label={
                  productInWishlist
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {productInWishlist
                  ? "♥"
                  : "♡"}
              </button>

            </div>

            {/* Added Message */}
            {addedMessage && (
              <div className="product-added-message">
                ✓ Product added to cart
              </div>
            )}

            {/* Benefits */}
            <div className="product-details-benefits">

              <div className="benefit-item">

                <span>
                  🚚
                </span>

                <div>

                  <strong>
                    Free Delivery
                  </strong>

                  <p>
                    On eligible orders
                  </p>

                </div>

              </div>

              <div className="benefit-item">

                <span>
                  ↩️
                </span>

                <div>

                  <strong>
                    Easy Returns
                  </strong>

                  <p>
                    Simple return process
                  </p>

                </div>

              </div>

              <div className="benefit-item">

                <span>
                  🔒
                </span>

                <div>

                  <strong>
                    Secure Payment
                  </strong>

                  <p>
                    Your payment is protected
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Product Specifications */}
        <section className="product-specifications">

          <h2>
            Product Information
          </h2>

          <div className="specifications-grid">

            <div className="specification-item">

              <span>
                Availability
              </span>

              <strong
                className={`availability-${stockClass}`}
              >
                {getStockMessage()}
              </strong>

            </div>

            <div className="specification-item">

              <span>
                Stock Quantity
              </span>

              <strong>
                {stockQuantity}
              </strong>

            </div>

            <div className="specification-item">

              <span>
                Category
              </span>

              <strong>
                {categoryName}
              </strong>

            </div>

            <div className="specification-item">

              <span>
                Rating
              </span>

              <strong>
                {Number(product.rating).toFixed(1)}
                {" / 5"}
              </strong>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default ProductDetails;

