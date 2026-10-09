import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import ProductCard from "../../components/ProductCard/ProductCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import { getProducts } from "../../services/api";

import "./Products.css";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );

  const [sortOption, setSortOption] = useState(
    searchParams.get("sort") || "featured"
  );

  /* =========================
     LOAD PRODUCTS FROM API
  ========================= */

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        setProducts(data);
      } catch (requestError) {
        console.error(requestError);

        setError(
          "Unable to load products. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  /* =========================
     SYNC URL PARAMETERS
  ========================= */

  useEffect(() => {
    const categoryFromUrl =
      searchParams.get("category") || "All";

    const searchFromUrl =
      searchParams.get("search") || "";

    const sortFromUrl =
      searchParams.get("sort") || "featured";

    setSelectedCategory(categoryFromUrl);
    setSearchTerm(searchFromUrl);
    setSortOption(sortFromUrl);
  }, [searchParams]);

  /* =========================
     CATEGORIES
  ========================= */

  const categories = useMemo(() => {
    const categoryNames = products
      .map((product) => {
        if (
          product.category &&
          typeof product.category === "object"
        ) {
          return product.category.name;
        }

        return product.category_name;
      })
      .filter(Boolean);

    return [
      "All",
      ...new Set(categoryNames),
    ];
  }, [products]);

  /* =========================
     FILTER + SORT
  ========================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) {
    const search = searchTerm.trimEnd().toLowerCase();

      result = result.filter((product) => {
        const productName =
          product.name || "";

        const categoryName =
          product.category &&
          typeof product.category === "object"
            ? product.category.name || ""
            : product.category_name || "";

        const description =
          product.description || "";

        return (
          productName
            .toLowerCase()
            .includes(search) ||
          categoryName
            .toLowerCase()
            .includes(search) ||
          description
            .toLowerCase()
            .includes(search)
        );
      });
    }

    if (selectedCategory !== "All") {
      result = result.filter((product) => {
        const categoryName =
          product.category &&
          typeof product.category === "object"
            ? product.category.name || ""
            : product.category_name || "";

        return categoryName === selectedCategory;
      });
    }

    switch (sortOption) {
      case "price-low":
        result.sort(
          (a, b) =>
            Number(a.price) - Number(b.price)
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            Number(b.price) - Number(a.price)
        );
        break;

      case "rating":
        result.sort(
          (a, b) =>
            Number(b.rating) - Number(a.rating)
        );
        break;

      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        );
        break;

      default:
        break;
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    sortOption,
  ]);

  /* =========================
     SEARCH
  ========================= */

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);

    const params = new URLSearchParams(
      searchParams
    );

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    setSearchParams(params);
  };

  /* =========================
     CATEGORY
  ========================= */

  const handleCategoryChange = (event) => {
    const category = event.target.value;

    setSelectedCategory(category);

    const params = new URLSearchParams(
      searchParams
    );

    if (category !== "All") {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    setSearchParams(params);
  };

  /* =========================
     SORT
  ========================= */

  const handleSortChange = (event) => {
    const sort = event.target.value;

    setSortOption(sort);

    const params = new URLSearchParams(
      searchParams
    );

    if (sort !== "featured") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    setSearchParams(params);
  };

  /* =========================
     CLEAR FILTERS
  ========================= */

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSortOption("featured");
    setSearchParams({});
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <section className="products-page">
        <div className="products-container">
          <div className="products-loading">
            <div className="loading-spinner"></div>

            <p>
              Loading CloudCart products...
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <section className="products-page">
        <div className="products-container">
          <div className="products-error">

            <h2>
              Unable to load products
            </h2>

            <p>
              {error}
            </p>

            <button
              className="clear-filters-button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>
        </div>
      </section>
    );
  }

  /* =========================
     PAGE
  ========================= */

  return (
    <section className="products-page">
      <div className="products-container">

        <div className="products-header">
          <div>

            <span className="section-eyebrow">
              CLOUDCART STORE
            </span>

            <h1>
              All Products
            </h1>

            <p>
              Discover technology built for work,
              creativity, development, and everyday
              life.
            </p>

          </div>
        </div>

        <div className="products-toolbar">

          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <div className="products-filters">

            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="featured">
                Featured
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="rating">
                Highest Rated
              </option>
            </select>

            {(searchTerm ||
              selectedCategory !== "All" ||
              sortOption !== "featured") && (
              <button
                className="clear-filters-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}

          </div>
        </div>

        <div className="products-result-bar">
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}{" "}
            found
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="products-grid">

            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}

          </div>
        ) : (
          <div className="products-empty">

            <div className="empty-icon">
              ⌕
            </div>

            <h2>
              No products found
            </h2>

            <p>
              Try changing your search or
              category filters.
            </p>

            <button
              className="clear-filters-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>
        )}

        <div className="products-bottom-link">

          <Link to="/">
            ← Back to Home
          </Link>

        </div>

      </div>
    </section>
  );
}

export default Products;

