import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import ProductCard from "../../components/ProductCard/ProductCard";
import { getProducts } from "../../services/api";

import "./Home.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const data = await getProducts();
        setProducts(data);
      } catch (requestError) {
        console.error(requestError);
        setError("Unable to load featured products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const featuredProducts = products.slice(0, 8);

  const categories = [
    {
      name: "Laptops",
      description: "Powerful machines for work and development",
      icon: "💻",
      category: "Laptops",
    },
    {
      name: "Smartphones",
      description: "Stay connected with the latest technology",
      icon: "📱",
      category: "Smartphones",
    },
    {
      name: "Audio",
      description: "Immersive sound for every moment",
      icon: "🎧",
      category: "Audio",
    },
    {
      name: "Accessories",
      description: "Upgrade your everyday setup",
      icon: "⌨️",
      category: "Accessories",
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="home-container hero-container">
          <div className="hero-content">
            <span className="hero-eyebrow">
              <span className="eyebrow-dot"></span>
              Technology made simple
            </span>

            <h1>
              Upgrade your
              <span> digital world.</span>
            </h1>

            <p>
              Discover carefully selected technology, electronics and
              accessories designed to make your work, entertainment and
              everyday life better.
            </p>

            <div className="hero-actions">
              <Link to="/products" className="hero-primary-button">
                Shop Now
                <span>→</span>
              </Link>

              <a href="#featured" className="hero-secondary-button">
                Explore Products
              </a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <strong>500+</strong>
                <span>Products</span>
              </div>

              <div className="hero-stat-divider"></div>

              <div className="hero-stat">
                <strong>10K+</strong>
                <span>Happy Customers</span>
              </div>

              <div className="hero-stat-divider"></div>

              <div className="hero-stat">
                <strong>4.8/5</strong>
                <span>Customer Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-glow"></div>

            <div className="hero-card hero-card-back">
              <span>NEW</span>
              <strong>Next-gen</strong>
              <small>technology</small>
            </div>

            <div className="hero-main-card">
              <div className="hero-card-top">
                <span className="hero-product-label">CloudCart</span>
                <span className="hero-product-badge">2026</span>
              </div>

              <div className="hero-product-icon">☁️</div>

              <div className="hero-main-card-text">
                <span>SMARTER TECHNOLOGY</span>
                <strong>Built for your world.</strong>
              </div>
            </div>

            <div className="floating-card floating-card-one">
              <span className="floating-icon">⚡</span>
              <div>
                <strong>Fast Delivery</strong>
                <small>Across India</small>
              </div>
            </div>

            <div className="floating-card floating-card-two">
              <span className="floating-icon">✓</span>
              <div>
                <strong>Secure Shopping</strong>
                <small>100% Protected</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section" id="categories">
        <div className="home-container">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">SHOP BY CATEGORY</span>
              <h2>Find what you need.</h2>
            </div>

            <Link to="/products" className="section-link">
              View All Products →
            </Link>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(
                  category.category
                )}`}
                className="category-card"
              >
                <div className="category-icon">{category.icon}</div>

                <div className="category-content">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>

                <span className="category-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section" id="featured">
        <div className="home-container">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">FEATURED PRODUCTS</span>
              <h2>Popular right now.</h2>
              <p>
                Explore some of the products our customers are loving.
              </p>
            </div>

            <Link to="/products" className="section-link">
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p>Loading featured products...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-danger)" }}>
              <p>{error}</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="featured-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p>No products available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Why CloudCart */}
      <section className="benefits-section">
        <div className="home-container">
          <div className="benefits-header">
            <span className="section-eyebrow">WHY CLOUDCART</span>
            <h2>A better way to shop technology.</h2>
            <p>
              We focus on giving you a simple, reliable and enjoyable
              shopping experience.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>
                Get your technology delivered quickly and safely to your
                doorstep.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>
                Your orders and payment information are protected with
                secure technology.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">⭐</div>
              <h3>Quality Products</h3>
              <p>
                Shop products selected for quality, reliability and
                everyday value.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">💬</div>
              <h3>Customer Support</h3>
              <p>
                Get help whenever you need it from our customer support
                team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="home-cta-section">
        <div className="home-container">
          <div className="home-cta">
            <div>
              <span className="section-eyebrow">READY TO UPGRADE?</span>
              <h2>Your next favorite device is waiting.</h2>
              <p>
                Explore the CloudCart collection and find technology that
                fits your world.
              </p>
            </div>

            <Link to="/products" className="cta-button">
              Start Shopping
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;