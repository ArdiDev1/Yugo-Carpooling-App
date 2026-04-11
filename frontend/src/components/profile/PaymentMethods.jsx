import { PAYMENT_METHODS } from "../../constants/categories";

export default function PaymentMethods({ methods = [], isOwnProfile = false }) {
  if (!methods.length && !isOwnProfile) return null;

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 10 }}>💳 Payment</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {methods.length === 0 && isOwnProfile && (
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>No payment methods added</span>
        )}
        {methods.map((m) => {
          const opt = PAYMENT_METHODS.find((p) => p.value === m);
          return (
            <span
              key={m}
              style={{
                backgroundColor: "#EDE8FF",
                color:           "#6C47FF",
                fontSize:        13,
                fontWeight:      600,
                padding:         "5px 12px",
                borderRadius:    999,
              }}
            >
              {opt?.label ?? m}
            </span>
          );
        })}
      </div>
    </div>
  );
}
