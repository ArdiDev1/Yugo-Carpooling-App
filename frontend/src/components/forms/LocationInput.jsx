import { useState, useRef, useEffect, useCallback } from "react";

export default function LocationInput({ label, name, placeholder, register, error }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const autocompleteRef = useRef(null);
  const wrapperRef = useRef(null);

  // Get react-hook-form helpers
  const { onChange: rhfOnChange, onBlur: rhfOnBlur, ref: rhfRef, ...rhfRest } = register
    ? register(name)
    : { onChange: () => {}, onBlur: () => {}, ref: () => {} };

  // Load Google Maps script from env and init AutocompleteService
  useEffect(() => {
    const initService = () => {
      if (window.google?.maps?.places?.AutocompleteService) {
        autocompleteRef.current = new window.google.maps.places.AutocompleteService();
      }
    };

    // If already loaded, just init
    if (window.google?.maps?.places) {
      initService();
      return;
    }

    // Load the script dynamically using the env key
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) return;

    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      existing.addEventListener("load", initService);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initService;
    document.head.appendChild(script);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchSuggestions = useCallback(
    (input) => {
      if (!input || input.length < 2 || !autocompleteRef.current) {
        setSuggestions([]);
        return;
      }
      autocompleteRef.current.getPlacePredictions(
        { input, types: ["geocode", "establishment"] },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowDropdown(true);
          } else {
            setSuggestions([]);
          }
        }
      );
    },
    []
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    rhfOnChange(e); // keep react-hook-form in sync
    fetchSuggestions(val);
  };

  const handleSelect = (description) => {
    setQuery(description);
    setSuggestions([]);
    setShowDropdown(false);

    // Create a synthetic event to update react-hook-form
    const nativeInput = document.getElementById(name);
    if (nativeInput) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, "value"
      ).set;
      nativeSetter.call(nativeInput, description);
      nativeInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  return (
    <div ref={wrapperRef} style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", position: "relative" }}>
      {label && (
        <label htmlFor={name} style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: `1px solid ${error ? "#EF4444" : "var(--color-border)"}`,
          borderRadius: 8,
          backgroundColor: "var(--color-surface)",
          overflow: "hidden",
        }}
      >
        <span style={{ padding: "0 10px", color: "var(--color-muted)", flexShrink: 0 }}>
          📍
        </span>
        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder ?? "Enter location..."}
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          onBlur={(e) => {
            // Delay so click on dropdown registers
            setTimeout(() => setShowDropdown(false), 200);
            rhfOnBlur(e);
          }}
          ref={(el) => {
            rhfRef(el); // react-hook-form ref
          }}
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "none",
            outline: "none",
            fontSize: 15,
            color: "var(--color-text)",
            background: "transparent",
            minWidth: 0,
          }}
          {...rhfRest}
        />
      </div>

      {/* Autocomplete dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 10,
            marginTop: 4,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur from firing first
                handleSelect(s.description);
              }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                width: "100%",
                padding: "10px 14px",
                border: "none",
                borderBottom: "1px solid #F3F4F6",
                backgroundColor: "transparent",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
                color: "#111827",
                lineHeight: 1.4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span style={{ color: "#9CA3AF", flexShrink: 0, marginTop: 1 }}>📍</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {s.structured_formatting?.main_text || s.description}
                </div>
                {s.structured_formatting?.secondary_text && (
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1 }}>
                    {s.structured_formatting.secondary_text}
                  </div>
                )}
              </div>
            </button>
          ))}
          <div style={{ padding: "6px 14px", fontSize: 10, color: "#9CA3AF", textAlign: "right" }}>
            Powered by Google
          </div>
        </div>
      )}

      {error && <span style={{ fontSize: 12, color: "#EF4444" }}>{error}</span>}
    </div>
  );
}
