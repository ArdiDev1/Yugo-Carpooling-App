export default function GasBotMessage({ gasData }) {
  if (!gasData) return null;
  const { totalMiles, gasPrice, mpg, totalCost, perPassengerCost, passengers, driverCoverage, note } = gasData;

  return (
    <div style={{ margin: "10px 12px", padding: "12px 14px", backgroundColor: "#EDE8FF", borderRadius: 12, border: "1.5px solid #6C47FF" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>🤖</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#6C47FF" }}>GasBot</span>
      </div>
      <div style={{ fontSize: 13, color: "#4C1D95", lineHeight: 1.6 }}>
        <div>📏 <strong>{totalMiles} miles</strong> at <strong>${gasPrice}/gal</strong> ({mpg} MPG)</div>
        <div>💰 Total gas cost: <strong>${totalCost?.toFixed(2)}</strong></div>
        {passengers > 0 && (
          <div>👤 Each passenger pays: <strong>${perPassengerCost?.toFixed(2)}</strong></div>
        )}
        {driverCoverage > 0 && (
          <div>🚗 Driver gets covered: <strong>${driverCoverage?.toFixed(2)}</strong></div>
        )}
        {note && (
          <div style={{ marginTop: 6, fontStyle: "italic", color: "#6D28D9", fontSize: 12 }}>{note}</div>
        )}
      </div>
    </div>
  );
}
