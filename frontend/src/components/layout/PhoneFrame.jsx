export default function PhoneFrame({ children }) {
  return (
    <div
      style={{
        width:           "100%",
        maxWidth:        390,
        height:          "100dvh",
        position:        "relative",
        overflow:        "hidden",
        backgroundColor: "#F7F7F8",
        display:         "flex",
        flexDirection:   "column",
        boxShadow:       "0 0 0 1px #d1d5db, 0 4px 32px rgba(0,0,0,0.12)",
      }}
    >
      {children}
    </div>
  );
}
