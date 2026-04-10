import React, { useEffect, useRef, useState } from "react";

export default function DropdownSelect({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  emptyLabel = "No options available"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function toggleOpen() {
    if (disabled) {
      return;
    }

    setIsOpen((currentValue) => !currentValue);
  }

  function handleSelect(nextValue) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div className={`dropdown-select ${isOpen ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`.trim()} ref={rootRef}>
      <button className="dropdown-select__trigger" type="button" onClick={toggleOpen} disabled={disabled} aria-expanded={isOpen}>
        <span className={value ? "" : "is-placeholder"}>{value || placeholder}</span>
        <span className="dropdown-select__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="dropdown-select__menu" role="listbox">
          {options.length ? (
            options.map((option) => (
              <button
                key={option}
                className={`dropdown-select__option ${option === value ? "is-selected" : ""}`.trim()}
                type="button"
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={option === value}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="dropdown-select__empty">{emptyLabel}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
