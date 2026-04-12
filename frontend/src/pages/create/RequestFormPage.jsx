// ─────────────────────────────────────────────────────────────────────────────
// RequestFormPage — form for a passenger to post a ride request.
//
// FLOW:
//   FAB (+) → /create (CreatePage chooser) → /create/request (this page)
//
// WHAT A REQUEST POST IS:
//   A passenger is saying "I need a ride from A to B at this time."
//   Drivers browsing the feed can see open requests and offer to pick them up.
//
// FORM FIELDS:
//   • Caption        — free text describing the trip (shown on the post card)
//   • From / To      — pickup and dropoff locations
//   • Purpose        — Shopping / Flight / College Event / Other (for filtering)
//   • Date           — which day (defaults to today or later)
//   • Flexible time  — toggle: if ON, passenger gives a window; if OFF, exact time
//   • Exact Time     — only shown when flexible is toggled OFF
//   • Luggage        — how much stuff they're bringing (helps drivers decide)
//   • Prefer Women   — per-ride toggle (overrides account default for this post)
//
// SUBMIT:
//   Builds a payload and logs it (console.log) for now.
//   TODO: replace console.log with postService.create(payload) when backend is ready.
//   On success, navigates back to the home feed.
//
// FORM LIBRARY:
//   react-hook-form manages field values and validation.
//   Fields that use native <input> use register().
//   Fields that use custom components (DatePickerField, TimePickerField)
//   use Controller, which bridges react-hook-form to non-native inputs.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import LocationInput from "../../components/forms/LocationInput";
import DatePickerField from "../../components/forms/DatePickerField";
import TimePickerField from "../../components/forms/TimePickerField";
import LuggageSelector from "../../components/forms/LuggageSelector";
import { RIDE_PURPOSES } from "../../constants/categories";
import { ROUTES } from "../../constants/routes";
import { postService } from "../../services/post.service";
import { useToastStore } from "../../store/toast.store";

export default function RequestFormPage() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const showToast    = useToastStore((s) => s.show);

  // ── Controlled state for fields that aren't plain text inputs ─────────────
  // These live outside react-hook-form because they use custom components
  // (Toggle, LuggageSelector) that manage their own internal rendering.
  const [luggage,      setLuggage]      = useState("none");   // how much stuff
  const [prefersWomen, setPrefersWomen] = useState(false);    // per-ride preference
  const [flexible,     setFlexible]     = useState(true);     // show window vs exact time
  const [loading,      setLoading]      = useState(false);    // disables button while submitting

  // react-hook-form: register = attach field to form, handleSubmit = wrap onSubmit,
  // control = needed for Controller-based fields (date/time pickers)
  const { register, handleSubmit, control, formState: { errors } } = useForm();

  // ── Form submission ────────────────────────────────────────────────────────
  // Called only after react-hook-form validates all registered fields.
  const onSubmit = async (data) => {
    setLoading(true);

    // Merge react-hook-form values with controlled state values
    const payload = {
      ...data,           // content, fromLocation, toLocation, purpose, date, time
      luggage,           // from LuggageSelector state
      prefersWomen,      // from Toggle state
      flexible,          // from Toggle state
      type: "request",   // tells the backend this is a passenger request (not a driver offer)
    };

    try {
      await postService.create(payload);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      showToast("Ride request posted!");
      navigate(ROUTES.HOME);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>

      {/* Back arrow + "Request a Ride" title */}
      <PageHeader title="Request a Ride" showBack />

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

        {/* Caption — shown as the main text on the post card in the feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Caption</label>
          <textarea
            {...register("content")}
            placeholder="Tell drivers what you need… (e.g. 'Need a ride to Stop & Shop this weekend!')"
            rows={3}
            style={{
              border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 12px",
              fontSize: 15, color: "#111827", resize: "none",
              backgroundColor: "#fff", outline: "none",
              width: "100%", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Pickup location — where the driver should pick you up */}
        <LocationInput
          label="From"
          name="fromLocation"
          placeholder="Where are you starting? (e.g. Northrop House)"
          register={register}
          error={errors.fromLocation?.message}
        />

        {/* Drop-off location — where you need to go */}
        <LocationInput
          label="To"
          name="toLocation"
          placeholder="Where do you need to go? (e.g. Stop & Shop)"
          register={register}
          error={errors.toLocation?.message}
        />

        {/* Purpose — helps drivers and passengers filter posts by trip type */}
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

        {/* Date — which day the ride is needed */}
        <DatePickerField
          label="Date"
          name="date"
          control={control}
          error={errors.date?.message}
        />

        {/* Flexible toggle — "I'm okay with a range" vs "I need an exact time"  */}
        {/* The more flexible you are, the more likely you get matched.          */}
        <Toggle
          checked={flexible}
          onChange={setFlexible}
          label="I'm flexible on time (recommended — more matches!)"
        />

        {/* Exact time input — only shown when the user turns flexible OFF */}
        {!flexible && (
          <TimePickerField
            label="Exact Time"
            name="time"
            control={control}
            error={errors.time?.message}
          />
        )}

        {/* Luggage — tells the driver how much trunk space they'll need */}
        <LuggageSelector
          label="How much luggage are you bringing?"
          value={luggage}
          onChange={setLuggage}
        />

        {/* Per-ride women preference — overrides the account-level default */}
        {/* Useful if someone usually doesn't care but wants women for this trip */}
        <Toggle
          checked={prefersWomen}
          onChange={setPrefersWomen}
          label="Prefer a woman driver for this ride"
        />

        {/* Submit — posts the request to the feed */}
        <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 8 }}>
          Post Request
        </Button>

      </form>
    </div>
  );
}
