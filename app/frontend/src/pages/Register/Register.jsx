import { useContext, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContextValue";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const {
      username,
      email,
      password,
      confirmPassword,
    } = formData;

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailValue = email.trim();

    if (emailValue.length > 254) {
      setError("Please enter a valid email address.");
      return;
    }

    const atIndex = emailValue.indexOf("@");
    const dotIndex = emailValue.indexOf(".", atIndex + 1);

    const hasWhitespace = Array.from(emailValue).some(
      (character) => character.trim() === ""
    );

    if (
      atIndex <= 0 ||
      atIndex !== emailValue.lastIndexOf("@") ||
      dotIndex <= atIndex + 1 ||
      dotIndex === emailValue.length - 1 ||
      hasWhitespace
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const result = await register({
        username,
        email: emailValue,
        password,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      navigate("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            Cloud<span>Cart</span>
          </Link>

          <p>
            Create your CloudCart account and start
            shopping.
          </p>
        </div>

        <div className="auth-card">

          <div className="auth-card-header">
            <span className="auth-eyebrow">
              CREATE ACCOUNT
            </span>

            <h1>Join CloudCart</h1>

            <p>
              Create your account to manage orders,
              wishlist and shopping.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-field">
              <label htmlFor="register-username">
                Username
              </label>

              <input
                id="register-username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">
                Email Address
              </label>

              <input
                id="register-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-password">
                Password
              </label>

              <input
                id="register-password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Enter password again"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
            >
              Create Account
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?
            <Link to="/login">Sign in</Link>
          </div>

        </div>

        <Link to="/" className="auth-back">
          ← Back to CloudCart
        </Link>

      </div>
    </div>
  );
}

export default Register;


