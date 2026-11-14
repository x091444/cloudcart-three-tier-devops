import { useContext, useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { CartContext } from "../../context/CartContextValue";
import { AuthContext } from "../../context/AuthContextValue";

import {
  createOrder,
  getProfile,
  updateProfile,
} from "../../services/api";

import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartCount,
    subtotal,
    shipping,
    total,
    clearCart,
  } = useContext(CartContext);

  const {
    isAuthenticated,
    accessToken,
  } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [errors, setErrors] = useState({});

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

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

  /* =========================
     LOAD USER PROFILE
  ========================= */

  useEffect(() => {
    async function loadProfile() {
      if (!isAuthenticated || !accessToken) {
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);

        const profile =
          await getProfile(accessToken);

        setFormData((current) => ({
          ...current,
          firstName:
            profile.first_name || "",
          lastName:
            profile.last_name || "",
          email:
            profile.email || "",
          phone:
            profile.phone || "",
          address:
            profile.address || "",
          city:
            profile.city || "",
          state:
            profile.state || "",
          pincode:
            profile.pincode || "",
        }));
      } catch (error) {
        console.error(
          "Unable to load profile:",
          error
        );
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [isAuthenticated, accessToken]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }

    if (errors.order) {
      setErrors((current) => ({
        ...current,
        order: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName =
        "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName =
        "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required";
    } else if (
      formData.email.trim().length > 254 ||
      formData.email.indexOf("@") <= 0 ||
      formData.email.indexOf("@") !== formData.email.lastIndexOf("@") ||
      formData.email.indexOf(".", formData.email.indexOf("@") + 1) === -1 ||
      /\s/.test(formData.email)
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required";
    } else if (
      !/^[6-9]\d{9}$/.test(formData.phone)
    ) {
      newErrors.phone =
        "Enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city =
        "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state =
        "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode =
        "PIN code is required";
    } else if (
      !/^\d{6}$/.test(formData.pincode)
    ) {
      newErrors.pincode =
        "Enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!isAuthenticated || !accessToken) {
      navigate("/login", {
        state: {
          from: "/checkout",
        },
      });

      return;
    }

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setPlacingOrder(true);

    try {
      /* =========================
         SAVE PROFILE
      ========================= */

      await updateProfile(accessToken, {
        first_name:
          formData.firstName.trim(),

        last_name:
          formData.lastName.trim(),

        phone:
          formData.phone.trim(),

        address:
          formData.address.trim(),

        city:
          formData.city.trim(),

        state:
          formData.state.trim(),

        pincode:
          formData.pincode.trim(),
      });

      /* =========================
         CREATE ORDER
      ========================= */

      const orderData = {
        shipping_name:
          `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),

        shipping_address:
          formData.address.trim(),

        city:
          formData.city.trim(),

        state:
          formData.state.trim(),

        pincode:
          formData.pincode.trim(),

        phone:
          formData.phone.trim(),

        payment_method: paymentMethod,
      };

      const order =
        await createOrder(
          accessToken,
          orderData
        );

      console.log(
        "Order created:",
        order
      );

      /* =========================
         CLEAR CART
      ========================= */

      await clearCart();

      navigate("/orders");
    } catch (error) {
      console.error(
        "Unable to place order:",
        error
      );

      setErrors({
        order:
          error.message ||
          "Unable to place your order. Please try again.",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">
            🛒
          </div>

          <h1>
            Your cart is empty
          </h1>

          <p>
            Add some products to your cart before
            proceeding to checkout.
          </p>

          <Link
            to="/products"
            className="checkout-empty-button"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        {/* Header */}
        <div className="checkout-header">
          <span>
            SECURE CHECKOUT
          </span>

          <h1>
            Complete your order
          </h1>

          <p>
            Enter your delivery details and choose a
            payment method.
          </p>
        </div>

        {errors.order && (
          <div className="auth-error">
            {errors.order}
          </div>
        )}

        <form
          className="checkout-layout"
          onSubmit={handlePlaceOrder}
        >

          {/* Left Side */}
          <div className="checkout-main">

            {/* Contact */}
            <section className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-number">
                  1
                </div>

                <div>
                  <h2>
                    Contact Information
                  </h2>

                  <p>
                    We'll use this information for your
                    order updates.
                  </p>
                </div>
              </div>

              {loadingProfile ? (
                <p>
                  Loading your saved details...
                </p>
              ) : (
                <div className="checkout-form-grid">

                  <div className="form-field">
                    <label htmlFor="firstName">
                      First Name
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Binson"
                    />

                    {errors.firstName && (
                      <small>
                        {errors.firstName}
                      </small>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="lastName">
                      Last Name
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Joseph"
                    />

                    {errors.lastName && (
                      <small>
                        {errors.lastName}
                      </small>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="email">
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />

                    {errors.email && (
                      <small>
                        {errors.email}
                      </small>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength="10"
                    />

                    {errors.phone && (
                      <small>
                        {errors.phone}
                      </small>
                    )}
                  </div>

                </div>
              )}
            </section>

            {/* Address */}
            <section className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-number">
                  2
                </div>

                <div>
                  <h2>
                    Delivery Address
                  </h2>

                  <p>
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="checkout-form-grid">

                <div className="form-field full-width">
                  <label htmlFor="address">
                    Street Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House number, street, locality"
                  />

                  {errors.address && (
                    <small>
                      {errors.address}
                    </small>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Thrissur"
                  />

                  {errors.city && (
                    <small>
                      {errors.city}
                    </small>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="state">
                    State
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Kerala"
                  />

                  {errors.state && (
                    <small>
                      {errors.state}
                    </small>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="pincode">
                    PIN Code
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="680001"
                    maxLength="6"
                  />

                  {errors.pincode && (
                    <small>
                      {errors.pincode}
                    </small>
                  )}
                </div>

              </div>
            </section>

            {/* Payment */}
            <section className="checkout-card">

              <div className="checkout-card-header">
                <div className="checkout-number">
                  3
                </div>

                <div>
                  <h2>
                    Payment Method
                  </h2>

                  <p>
                    Select how you'd like to pay.
                  </p>
                </div>
              </div>

              <div className="payment-methods">

                <label
                  className={
                    paymentMethod === "cod"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={
                      paymentMethod === "cod"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <span className="payment-icon">
                    💵
                  </span>

                  <span className="payment-details">
                    <strong>
                      Cash on Delivery
                    </strong>

                    <small>
                      Pay when your order arrives
                    </small>
                  </span>
                </label>

                <label
                  className={
                    paymentMethod === "upi"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                >
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={
                      paymentMethod === "upi"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <span className="payment-icon">
                    📱
                  </span>

                  <span className="payment-details">
                    <strong>
                      UPI
                    </strong>

                    <small>
                      Google Pay, PhonePe, Paytm and more
                    </small>
                  </span>
                </label>

                <label
                  className={
                    paymentMethod === "card"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={
                      paymentMethod === "card"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <span className="payment-icon">
                    💳
                  </span>

                  <span className="payment-details">
                    <strong>
                      Credit / Debit Card
                    </strong>

                    <small>
                      Secure card payment
                    </small>
                  </span>
                </label>

              </div>

              <div className="payment-notice">
                🔒 Payment processing will be connected to
                the CloudCart backend later.
              </div>

            </section>

          </div>

          {/* Right Side */}
          <aside className="checkout-summary">

            <h2>
              Order Summary
            </h2>

            <div className="checkout-items">

              {cartItems.map((item) => (
                <div
                  className="checkout-item"
                  key={item.id}
                >
                  <div className="checkout-item-image">

                    <img
                      src={item.image}
                      alt={item.name}
                    />

                    <span>
                      {item.quantity}
                    </span>

                  </div>

                  <div className="checkout-item-details">

                    <strong>
                      {item.name}
                    </strong>

                    <small>
                      {getCategoryName(
                        item.category
                      )}
                    </small>

                  </div>

                  <strong>
                    {formatPrice(
                      Number(item.price) *
                        Number(item.quantity)
                    )}
                  </strong>

                </div>
              ))}

            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">

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

            <div className="checkout-summary-row">

              <span>
                Shipping
              </span>

              <strong>
                {shipping === 0
                  ? "FREE"
                  : formatPrice(shipping)}
              </strong>

            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-total">

              <span>
                Total
              </span>

              <strong>
                {formatPrice(total)}
              </strong>

            </div>

            <button
              type="submit"
              className="place-order-button"
              disabled={
                placingOrder ||
                loadingProfile
              }
            >
              {placingOrder
                ? "Placing Order..."
                : "Place Order • " +
                  formatPrice(total)}
            </button>

            <div className="checkout-security">

              <span>
                🔒
              </span>

              <div>
                <strong>
                  Secure Checkout
                </strong>

                <p>
                  Your information is handled securely.
                </p>
              </div>

            </div>

            <Link
              to="/cart"
              className="back-to-cart"
            >
              ← Return to Cart
            </Link>

          </aside>

        </form>

      </div>
    </div>
  );
}

export default Checkout;

