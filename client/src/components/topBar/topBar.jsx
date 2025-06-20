import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import MultiSelect from "../MultiSelect/MultiSelect";
import "./topBar.css";

const TopBar = ({ onFiltersChange, onSearch }) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [shouldResetFilters, setShouldResetFilters] = useState(false);

  const usesOptions = [
    { value: "Thực phẩm", label: "Thực phẩm" },
    { value: "Trang trí", label: "Trang trí" },
    { value: "Y học", label: "Y học" },
    { value: "Nhiên liệu", label: "Nhiên liệu" },
    { value: "Cây lấy gỗ", label: "Cây lấy gỗ" },
  ];

  const regionOptions = [
    { value: "Thế giới", label: "Thế giới" },
    {
      label: "Châu Mỹ",
      options: [
        { value: "Châu Mỹ", label: "Châu Mỹ" },
        { value: "Bắc Mỹ", label: "Bắc Mỹ" },
        { value: "Trung Mỹ", label: "Trung Mỹ" },
        { value: "Nam Mỹ", label: "Nam Mỹ" },
      ],
    },
    {
      label: "Châu Âu",
      options: [
        { value: "Châu Âu", label: "Châu Âu" },
        { value: "Tây Âu", label: "Tây Âu" },
        { value: "Đông Âu", label: "Đông Âu" },
      ],
    },
    {
      label: "Châu Á",
      options: [
        { value: "Châu Á", label: "Châu Á" },
        { value: "Đông Á", label: "Đông Á" },
        { value: "Đông Nam Á", label: "Đông Nam Á" },
        { value: "Tây Á", label: "Tây Á" },
        { value: "Nam Á", label: "Nam Á" },
        { value: "Bắc Á", label: "Bắc Á" },
      ],
    },
    {
      label: "Châu Phi",
      options: [
        { value: "Châu Phi", label: "Châu Phi" },
        { value: "Đông Phi", label: "Đông Phi" },
        { value: "Tây Phi", label: "Tây Phi" },
        { value: "Nam Phi", label: "Nam Phi" },
        { value: "Bắc Phi", label: "Bắc Phi" },
      ],
    },
    {
      label: "Châu Úc",
      options: [{ value: "Châu Úc", label: "Châu Úc" }],
    },
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    (value) => {
      onSearch(value);
    },
    [onSearch]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(searchInput);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchInput, debouncedSearch]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission
  };

  const handleUsesChange = (selected) => {
    onFiltersChange?.({
      type: "applications",
      values: selected,
    });
  };

  const handleRegionChange = (selected) => {
    onFiltersChange?.({
      type: "regions",
      values: selected,
    });
  };

  const handleReset = () => {
    // Reset search
    setSearchInput("");
    onSearch("");

    // Reset filters
    onFiltersChange?.({ type: "applications", values: [] });
    onFiltersChange?.({ type: "regions", values: [] });

    // Trigger reset in MultiSelect components
    setShouldResetFilters((prev) => !prev);
  };

  return (
    <div className="topBar">
      <div className="search-container">
        <div className="search">
          <form onSubmit={handleSubmit}>
            <img src="/general/search.svg" alt="" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchInput}
              onChange={handleSearchChange}
            />
          </form>
        </div>
      </div>
      <div className="filters">
        <MultiSelect
          options={usesOptions}
          placeholder="Ứng dụng"
          onChange={handleUsesChange}
          shouldReset={shouldResetFilters}
        />
        <MultiSelect
          options={regionOptions}
          placeholder="Khu vực"
          onChange={handleRegionChange}
          shouldReset={shouldResetFilters}
        />
        <button className="reset-button" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default TopBar;
