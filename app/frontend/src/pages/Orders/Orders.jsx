import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../../context/AuthContextValue";
import {
  getOrders,
  cancelOrder,
} from "../../services/api";

import "./Orders.css";

function Orders() {
  const { isAuthenticated, accessToken } =
    useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] =
    useState(null);

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated || !accessToken) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getOrders(accessToken);

        setOrders(data);
      } catch (requestError) {
        console.error(
          "Unable to load orders:",
          requestError
        );

        setError(
          requestError.message ||
            "Unable to load your orders."
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [isAuthenticated, accessToken]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getPaymentLabel = (order) => {
    return (
      order.payment_method_display ||
      order.payment_method ||
      "Payment method"
    );
  };

  /*
    Cancel Order
  */
  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrderId(orderId);

      const updatedOrder = await cancelOrder(
        accessToken,
        orderId
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? updatedOrder
            : order
        )
      );
    } catch (requestError) {
      console.error(
        "Unable to cancel order:",
        requestError
      );

      alert(
        requestError.message ||
          "Unable to cancel this order."
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  const orderStatuses = [
    {
      key: "pending",
      label: "Order Placed",
    },
    {
      key: "confirmed",
      label: "Confirmed",
    },
    {
      key: "shipped",
      label: "Shipped",
    },
    {
      key: "delivered",
      label: "Delivered",
    },
  ];

  const getStatusIndex = (status) => {
    return orderStatuses.findIndex(
      (item) => item.key === status
    );
  };

  const renderOrderTimeline = (order) => {
    const currentStatus = order.status;

    if (currentStatus === "cancelled") {
      return (
        <div className="order-timeline order-timeline-cancelled">
          <div className="timeline-step active">
            <div className="timeline-dot">
              ✓
            </div>

            <span>
              Order Placed
            </span>
          </div>

          <div className="timeline-line"></div>

          <div className="timeline-step cancelled">
            <div className="timeline-dot">
              ✕
            </div>

            <span>
              Cancelled
            </span>
          </div>
        </div>
      );
    }

    const currentIndex =
      getStatusIndex(currentStatus);

    return (
      <div className="order-timeline">
        {orderStatuses.map(
          (status, index) => {
            const isCompleted =
              index <= currentIndex;

            const isCurrent =
              index === currentIndex;

            return (
              <div
                className="timeline-wrapper"
                key={status.key}
              >
                <div
                  className={
                    isCompleted
                      ? "timeline-step active"
                      : "timeline-step"
                  }
                >
                  <div
                    className={
                      isCurrent
                        ? "timeline-dot current"
                        : "timeline-dot"
                    }
                  >
                    {isCompleted
                      ? "✓"
                      : index + 1}
                  </div>

                  <span>
                    {status.label}
                  </span>
                </div>

                {index <
                  orderStatuses.length - 1 && (
                  <div
                    className={
                      index < currentIndex
                        ? "timeline-line completed"
                        : "timeline-line"
                    }
                  ></div>
                )}
              </div>
            );
          }
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="empty-orders">
            <div className="empty-orders-icon">
              🔐
            </div>

            <span className="orders-eyebrow">
              CLOUDCART
            </span>

            <h1>
              Sign in to view your orders
            </h1>

            <p>
              Please sign in to your CloudCart
              account to view your order history.
            </p>

            <Link
              to="/login"
              className="shop-orders-button"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="empty-orders">
            <div className="empty-orders-icon">
              📦
            </div>

            <span className="orders-eyebrow">
              CLOUDCART
            </span>

            <h1>
              Loading your orders...
            </h1>

            <p>
              Please wait while we retrieve your
              order history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="empty-orders">
            <div className="empty-orders-icon">
              ⚠️
            </div>

            <span className="orders-eyebrow">
              CLOUDCART
            </span>

            <h1>
              Unable to load orders
            </h1>

            <p>
              {error}
            </p>

            <button
              className="shop-orders-button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="empty-orders">
            <div className="empty-orders-icon">
              📦
            </div>

            <span className="orders-eyebrow">
              CLOUDCART
            </span>

            <h1>
              No orders yet
            </h1>

            <p>
              You haven't placed any orders yet.
              Start exploring CloudCart and find
              something you love.
            </p>

            <Link
              to="/products"
              className="shop-orders-button"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">

        {/* Header */}
        <div className="orders-header">
          <div>
            <span className="orders-eyebrow">
              CLOUDCART
            </span>

            <h1>
              My Orders
            </h1>

            <p>
              {orders.length}{" "}
              {orders.length === 1
                ? "order"
                : "orders"}{" "}
              placed
            </p>
          </div>
        </div>

        {/* Orders */}
        <div className="orders-list">
          {orders.map((order) => (
            <article
              className="order-card"
              key={order.id}
            >

              {/* Order Header */}
              <div className="order-card-header">
                <div>
                  <span className="order-label">
                    ORDER ID
                  </span>

                  <strong>
                    #{order.id}
                  </strong>
                </div>

                <div className="order-date">
                  <span className="order-label">
                    ORDER DATE
                  </span>

                  <strong>
                    {formatDate(
                      order.created_at
                    )}
                  </strong>
                </div>

                <span className="order-status">
                  {order.status_display ||
                    order.status}
                </span>
              </div>

              {/* Status Timeline */}
              {renderOrderTimeline(order)}

              {/* Products */}
              <div className="order-products">
                {order.items.map((item) => (
                  <div
                    className="order-product"
                    key={item.id}
                  >
                    <div className="order-product-image">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                      />

                      <span>
                        {item.quantity}
                      </span>
                    </div>

                    <div className="order-product-info">
                      <Link
                        to={`/products/${item.product.id}`}
                      >
                        {item.product.name}
                      </Link>

                      <span>
                        {item.product.category_name}
                      </span>

                      <small>
                        {formatPrice(item.price)} ×{" "}
                        {item.quantity}
                      </small>
                    </div>

                    <strong className="order-product-total">
                      {formatPrice(
                        Number(item.price) *
                          Number(item.quantity)
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="order-card-footer">

                <div className="order-payment">
                  <span>
                    Payment
                  </span>

                  <strong>
                    {getPaymentLabel(order)}
                  </strong>
                </div>

                <div className="order-delivery">
                  <span>
                    Delivery
                  </span>

                  <strong>
                    {order.city},{" "}
                    {order.state}
                  </strong>
                </div>

                <div className="order-total">
                  <span>
                    Order Total
                  </span>

                  <strong>
                    {formatPrice(
                      order.total_amount
                    )}
                  </strong>
                </div>

                {/* Cancel Order */}
                {["pending", "confirmed"].includes(
                  order.status
                ) && (
                  <button
                    type="button"
                    className="cancel-order-btn"
                    onClick={() =>
                      handleCancelOrder(order.id)
                    }
                    disabled={
                      cancellingOrderId ===
                      order.id
                    }
                  >
                    {cancellingOrderId ===
                    order.id
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </button>
                )}

              </div>

            </article>
          ))}
        </div>

        {/* Bottom */}
        <div className="orders-bottom">
          <Link
            to="/products"
            className="orders-shop-link"
          >
            ← Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Orders;


