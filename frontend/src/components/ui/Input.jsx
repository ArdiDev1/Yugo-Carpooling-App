export default function Input({
  label,
  name,
  type        = "text",
  placeholder,
  error,
  prefix,
  suffix,
  register,   // react-hook-form register result
  ...rest
}) {
  const regProps = register ? register(name) : {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
      {label && (
        <label
          htmlFor={name}
          style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display:         "flex",
          alignItems:      "center",
          border:          `1px solid ${error ? "#EF4444" : "var(--color-border)"}`,
          borderRadius:    8,
          backgroundColor: "var(--color-surface)",
          overflow:        "hidden",
        }}
      >
        {prefix && (
          <span style={{ padding: "0 10px", color: "var(--color-muted)", flexShrink: 0 }}>
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          style={{
            flex:       1,
            padding:    "10px 12px",
            border:     "none",
            outline:    "none",
            fontSize:   15,
            color:      "var(--color-text)",
            background: "transparent",
            minWidth:   0,
          }}
          {...regProps}
          {...rest}
        />
        {suffix && (
          <span style={{ padding: "0 10px", color: "var(--color-muted)", flexShrink: 0 }}>
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: "#EF4444" }}>{error}</span>
      )}
    </div>
  );
}
