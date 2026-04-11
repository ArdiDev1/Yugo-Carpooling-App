import { Controller } from "react-hook-form";

export default function DatePickerField({ name, label, control, error, minDate }) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            type="date"
            min={minDate ?? today}
            {...field}
            style={{
              border:          `1px solid ${error ? "#EF4444" : "#E5E7EB"}`,
              borderRadius:    8,
              padding:         "10px 12px",
              fontSize:        15,
              color:           "#111827",
              backgroundColor: "#fff",
              width:           "100%",
              outline:         "none",
            }}
          />
        )}
      />
      {error && <span style={{ fontSize: 12, color: "#EF4444" }}>{error}</span>}
    </div>
  );
}
