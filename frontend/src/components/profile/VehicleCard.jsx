export default function VehicleCard({ vehicle, isOwnProfile = false, onEdit }) {
  if (!vehicle) {
    return isOwnProfile ? (
      <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 8, border: "1.5px dashed #E5E7EB" }}>
        <p style={{ fontSize: 14, color: "#9CA3AF", textAlign: "center" }}>No vehicle added yet</p>
        <button onClick={onEdit} style={{ display: "block", margin: "8px auto 0", fontSize: 13, color: "#6C47FF", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          + Add vehicle
        </button>
      </div>
    ) : null;
  }

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>🚗 Vehicle</span>
        {isOwnProfile && (
          <button onClick={onEdit} style={{ fontSize: 13, color: "#6C47FF", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Edit
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
        {[
          ["Make",  vehicle.make],
          ["Model", vehicle.model],
          ["Year",  vehicle.year],
          ["Color", vehicle.color],
          ["Plate", vehicle.plate],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</div>
            <div style={{ fontSize: 14, color: "#111827", fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
