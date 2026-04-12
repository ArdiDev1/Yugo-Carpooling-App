// ─────────────────────────────────────────────────────────────────────────────
// OfferFormPage — form for a driver to post an available ride.
//
// FLOW:
//   FAB (+) → /create (CreatePage chooser) → /create/offer (this page)
//
// WHAT AN OFFER POST IS:
//   A driver is saying "I'm going from A to B and have N empty seats."
//   Passengers browsing the feed can see open offers and request to join.
//
// ROLE GATE:
//   Only users with role "driver" can access this page.
//   If a non-driver somehow reaches /create/offer (e.g. by typing the URL),
//   the useEffect at the top immediately redirects them to /home.
//   The "Offer a Ride" button in CreatePage is also disabled for passengers.
//
// FORM FIELDS:
//   • Caption            — free text describing the trip (shown on the post card)
//   • From / To          — where the driver is starting and heading
//   • Purpose            — Shopping / Flight / College Event / Other
//   • Date               — which day
//   • Flexible time      — toggle: window vs exact departure time
//   • Departure Time     — shown only when flexible is OFF
//   • Passenger Capacity — how many people can fit (1–3, not counting driver)
//   • Storage / Trunk    — how much luggage space is available
//   • Prefer Women       — per-ride toggle for who they'll accept
//   • No Payment Needed  — driver can waive gas money for short/friendly trips
//
// SUBMIT:
//   Builds a payload and logs it (console.log) for now.
//   TODO: replace console.log with postService.create(payload) when backend is ready.
//   On success, navigates back to the home feed.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import LocationInput from "../../components/forms/LocationInput";
import DatePickerField from "../../components/forms/DatePickerField";
import TimePickerField from "../../components/forms/TimePickerField";
import CapacitySelector from "../../components/forms/CapacitySelector";
import { RIDE_PURPOSES, STORAGE_OPTIONS } from "../../constants/categories";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import { postService } from "../../services/post.service";
import { useToastStore } from "../../store/toast.store";

export default function OfferFormPage() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const { isDriver } = useAuth(); // reads role from the auth Zustand store
  const showToast    = useToastStore((s) => s.show);

  // ── Role gate — redirect passengers immediately ────────────────────────────
  // This runs once on mount. If the user isn't a driver (e.g., they typed
  // the URL directly), send them back to the home feed silently.
  useEffect(() => {
    if (!isDriver) navigate(ROUTES.HOME, { replace: true });
  }, [isDriver, navigate]);

  // ── Controlled state for non-text-input fields ────────────────────────────
  const [seats,        setSeats]        = useState(1);      // 1–3 passengers max
  const [storage,      setStorage]      = useState("half"); // trunk space available
  const [prefersWomen, setPrefersWomen] = useState(false);  // per-ride preference
  const [flexible,     setFlexible]     = useState(true);   // window vs exact time
  const [noPayment,    setNoPayment]    = useState(false);  // waive gas money
  const [loading,      setLoading]      = useState(false);  // submitting state

  const { register, handleSubmit, control, formState: { errors } } = useForm();

  // ── Form submission ────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setLoading(true);

    // Merge react-hook-form values (text/date/time fields) with controlled state
    const payload = {
      ...data,                    // content, fromLocation, toLocation, purpose, date, time
      seatsTotal:      seats,     // max passengers (not counting driver)
      storageCapacity: storage,   // none / half / full trunk
      prefersWomen,               // passenger gender preference for this ride
      flexible,                   // is the departure time flexible?
      noPaymentNeeded: noPayment, // driver waiving gas split
      type: "offer",              // tells backend this is a driver offer (not a passenger request)
    };

    try {
      await postService.create(payload);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      showToast("Ride offer posted!");
      navigate(ROUTES.HOME);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>

      {/* Back arrow + "Offer a Ride" title */}
      <PageHeader title="Offer a Ride" showBack />

      {/* ── Scrollable form body ─────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          flex:          1,
          overflowY:     "auto",
          padding:       "16px 16px 32px",
          display:       "flex",
          flexDirection: "column",
          gap:           16,
        }}
      >

        {/* Caption — main text shown on the offer post card in the feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Caption</label>
          <textarea
            {...register("content")}
            placeholder="Tell passengers where you're going… (e.g. 'Driving to ALDI Saturday, 2 seats open!')"
            rows={3}
            style={{
              border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 12px",
              fontSize: 15, color: "#111827", resize: "none",
              backgroundColor: "#fff", outline: "none",
              width: "100%", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Where the driver is starting from */}
        <LocationInput
          label="From"
          name="fromLocation"
          placeholder="Where are you starting? (e.g. Northrop House)"
          register={register}
          error={errors.fromLocation?.message}
        />

        {/* Where the driver is going */}
        <LocationInput
          label="To"
          name="toLocation"
          placeholder="Where are you heading? (e.g. ALDI, Northampton)"
          register={register}
          error={errors.toLocation?.message}
        />

        {/* Purpose — helps passengers find relevant trips */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>What's this trip for?</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {RIDE_PURPOSES.map((p) => (
              <label key={p.value} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                <input type="radio" value={p.value} {...register("purpose")} />
                <span style={{ fontSize: 13, color: "#374151" }}>{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date — which day the driver is making this trip */}
        <DatePickerField
          label="Date"
          name="date"
          control={control}
          error={errors.date?.message}
        />

        {/* Flexible toggle — "I'll leave within a window" vs "I'm leaving at exactly X" */}
        <Toggle
          checked={flexible}
          onChange={setFlexible}
          label="I'm flexible on departure time (recommended — more matches!)"
        />

        {/* Exact time — only shown when flexible is OFF */}
        {!flexible && (
          <TimePickerField
            label="Departure Time"
            name="time"
            control={control}
            error={errors.time?.message}
          />
        )}

        {/* How many passengers the driver can take (not including themselves) */}
        {/* App rules: max 3 passengers per ride */}
        <CapacitySelector
          label="How many passengers can you take?"
          value={seats}
          onChange={setSeats}
          min={1}
          max={3}
        />

        {/* Storage — how much trunk/cargo space is available for luggage */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Storage / Trunk Space</span>
          <div style={{ display: "flex", gap: 8 }}>
            {STORAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStorage(opt.value)}
                style={{
                  flex:            1,
                  padding:         "8px 0",
                  borderRadius:    8,
                  border:          `1.5px solid ${storage === opt.value ? "#6C47FF" : "#E5E7EB"}`,
                  backgroundColor: storage === opt.value ? "#EDE8FF" : "#fff",
                  color:           storage === opt.value ? "#6C47FF" : "#6B7280",
                  fontSize:        13,
                  fontWeight:      storage === opt.value ? 700 : 500,
                  cursor:          "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Per-ride passenger gender preference */}
        <Toggle
          checked={prefersWomen}
          onChange={setPrefersWomen}
          label="Prefer women passengers for this ride"
        />

        {/* Gas money toggle — short trips (e.g. grocery run) often don't need splitting */}
        {/* GasBot in the chat will still show the calculation, but note it's waived.   */}
        <Toggle
          checked={noPayment}
          onChange={setNoPayment}
          label="No payment needed (I'll cover gas myself)"
        />

        {/* Submit — publishes the offer to the feed */}
        <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 8 }}>
          Post Offer
        </Button>

      </form>
    </div>
  );
}
