// ─────────────────────────────────────────────────────────────────────────────
// CreatePage — the first step of the "post a ride" flow.
//
// WHEN IT APPEARS:
//   The floating "+" button (BottomBar) navigates to /create.
//   This page renders as an `overlay` inside AppLayout, meaning its Modal
//   backdrop and slide-up sheet sit above the home feed without being clipped
//   by the scroll container.
//
// WHAT IT DOES:
//   Shows a bottom-sheet with two options:
//     • "Request a Ride"  → navigates to /create/request  (open to everyone)
//     • "Offer a Ride"    → navigates to /create/offer    (drivers only)
//
//   Passengers see the "Offer" option grayed out and disabled.
//   Closing the sheet (backdrop tap or handle) navigates back to the feed.
//
// ROLE GATING:
//   isDriver comes from the auth store via useAuth().
//   Passengers cannot post offers — they can only request rides.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import raiseHandIcon from "../../assets/raise_hand_icon.png";
import acceptHandIcon from "../../assets/accept_hand_icon.png";

export default function CreatePage() {
  const navigate     = useNavigate();
  const { isDriver } = useAuth(); // true if logged-in user has role "driver"

  // Modal starts open the moment this page mounts.
  // When closing, we animate it shut (300ms) then navigate back.
  const [open, setOpen] = useState(true);

  const close = () => {
    setOpen(false);
    // Wait for the slide-down animation to finish before unmounting
    setTimeout(() => navigate(-1), 300);
  };

  // Navigate to the appropriate form page.
  // Passengers are blocked from the offer form at the route level too,
  // but we also disable the button here for clear UI feedback.
  const goToRequest = () => navigate(ROUTES.CREATE_REQUEST);
  const goToOffer   = () => { if (isDriver) navigate(ROUTES.CREATE_OFFER); };

  return (
    <Modal isOpen={open} onClose={close} title="What would you like to post?">
      <div style={{ padding: "16px 20px 36px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── Request a Ride ─────────────────────────────────────────────── */}
        {/* Always available — any logged-in user can request a ride.        */}
        <button
          onClick={goToRequest}
          style={{
            display:         "flex",
            alignItems:      "center",
            gap:             16,
            padding:         "18px 20px",
            borderRadius:    12,
            border:          "1.5px solid #E5E7EB",
            backgroundColor: "#fff",
            cursor:          "pointer",
            textAlign:       "left",
            width:           "100%",
          }}
        >
          <img src={raiseHandIcon} alt="request" style={{ width: 36, height: 36, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
              Request a Ride
            </div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>
              Ask a driver to pick you up
            </div>
          </div>
        </button>

        {/* ── Offer a Ride ───────────────────────────────────────────────── */}
        {/* Only drivers can offer rides. Passengers see this grayed out.    */}
        {/* The disabled prop prevents click; opacity gives visual feedback. */}
        <button
          onClick={goToOffer}
          disabled={!isDriver}
          style={{
            display:         "flex",
            alignItems:      "center",
            gap:             16,
            padding:         "18px 20px",
            borderRadius:    12,
            border:          `1.5px solid ${isDriver ? "#6C47FF" : "#E5E7EB"}`,
            backgroundColor: isDriver ? "#EDE8FF" : "#F9FAFB",
            cursor:          isDriver ? "pointer" : "not-allowed",
            textAlign:       "left",
            opacity:         isDriver ? 1 : 0.5,
            width:           "100%",
          }}
        >
          <img src={acceptHandIcon} alt="offer" style={{ width: 36, height: 36, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: isDriver ? "#111827" : "#9CA3AF" }}>
              Offer a Ride
            </div>
            <div style={{ fontSize: 13, color: "#9CA3AF" }}>
              {isDriver ? "Post open seats in your car" : "Drivers only — create a driver account to offer rides"}
            </div>
          </div>
        </button>

      </div>
    </Modal>
  );
}
