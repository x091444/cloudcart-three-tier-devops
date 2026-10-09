function SearchBar({ value, onChange }) {
  return (
    <div className="products-search">
      <input
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={onChange}
        aria-label="Search products"
      />
    </div>
  );
}

export default SearchBar;

