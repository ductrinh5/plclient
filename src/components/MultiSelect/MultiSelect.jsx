import { useState, useRef, useEffect } from "react";
import "./MultiSelect.css";

const MultiSelect = ({ options, placeholder, onChange, shouldReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Handle reset from parent component
  useEffect(() => {
    if (shouldReset !== undefined) {
      setSelectedOptions([]);
      setSearchTerm("");
      setIsOpen(false);
    }
  }, [shouldReset]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (option) => {
    let newSelected;
    if (selectedOptions.includes(option.value)) {
      newSelected = selectedOptions.filter((item) => item !== option.value);
    } else {
      newSelected = [...selectedOptions, option.value];
    }
    setSelectedOptions(newSelected);
    onChange(newSelected);
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderOptions = (options, level = 0) => {
    return options.map((option) => {
      if (option.options) {
        // Render optgroup
        return (
          <div key={option.label} className="optgroup">
            <div className="optgroup-label" style={{ paddingLeft: `${10 + level * 16}px` }}>
              {option.label}
            </div>
            {renderOptions(option.options, level + 1)}
          </div>
        );
      }
      // Render option
      return (
        <div
          key={option.value}
          className="option"
          style={{ paddingLeft: `${10 + level * 16}px` }}
          onClick={() => handleOptionClick(option)}
        >
          <input
            type="checkbox"
            checked={selectedOptions.includes(option.value)}
            onChange={() => {}}
          />
          <span>{option.label}</span>
        </div>
      );
    });
  };

  return (
    <div className="multi-select" ref={dropdownRef}>
      <div className="select-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="selected-display">
          {selectedOptions.length === 0
            ? placeholder
            : `${selectedOptions.length} selected`}
        </div>
        <img
          src="/general/arrow-down.svg"
          alt="toggle"
          className={`arrow ${isOpen ? "open" : ""}`}
        />
      </div>
      {isOpen && (
        <div className="dropdown">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="options-container">
            {renderOptions(filteredOptions)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect; 