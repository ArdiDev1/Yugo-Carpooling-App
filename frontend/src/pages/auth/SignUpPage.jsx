import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import PageHeader from "../../components/layout/PageHeader";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import { SEX_OPTIONS } from "../../constants/categories";
import { ROUTES } from "../../constants/routes";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import raiseHandIcon from "../../assets/raise_hand_icon.png";
import taxiIcon from "../../assets/taxi_icon.png";

// Steps: 0 = role, 1 = basic info, 2 = personal details
const TOTAL_STEPS = 3;

export default function SignUpPage() {
  const navigate = useNavigate();
  const setUser  = useAuthStore((s) => s.setUser);

  const [step,         setStep]         = useState(0);
  const [role,         setRole]         = useState(null);
  const [prefersWomen, setPrefersWomen] = useState(false);
  const [error,        setError]        = useState(null);
  const [loading,      setLoading]      = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const goBack = () => {
    setError(null);
    if (step === 0) navigate(ROUTES.LANDING);
    else setStep((s) => s - 1);
  };

  // Step 1 → 2: validate basic info and advance
  const onStep1Submit = () => {
    setError(null);
    goNext();
  };

  // Step 2: collect personal details and register
  const onFinish = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const basic = getValues();
      const payload = {
        ...basic,
        ...data,
        role,
        prefers_women: prefersWomen,
      };

      let res;
      if (role === "driver") {
        res = await authService.registerDriver(payload);
      } else {
        res = await authService.registerPassenger(payload);
      }

      setUser(res.data.user, res.data.token);
      navigate(ROUTES.HOME);
    } catch (e) {
      setError(e.response?.data?.detail ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", backgroundColor: "#F7F7F8" }}>
      <PageHeader title={`Sign Up (${step + 1}/${TOTAL_STEPS})`} showBack onBack={goBack} />

      {/* Progress bar */}
      <div style={{ height: 3, backgroundColor: "#E5E7EB" }}>
        <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#6C47FF", transition: "width 0.3s" }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>

        {/* Step 0: Role selection */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>I am a...</h2>
            {[
              { value: "passenger", icon: raiseHandIcon, label: "Passenger", desc: "I need rides" },
              { value: "driver",    icon: taxiIcon,      label: "Driver",    desc: "I can drive others" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                style={{
                  display:         "flex",
                  alignItems:      "center",
                  gap:             16,
                  padding:         "18px 20px",
                  borderRadius:    12,
                  border:          `2px solid ${role === opt.value ? "#6C47FF" : "#E5E7EB"}`,
                  backgroundColor: role === opt.value ? "#EDE8FF" : "#fff",
                  cursor:          "pointer",
                  textAlign:       "left",
                }}
              >
                <img src={opt.icon} alt={opt.label} style={{ width: 36, height: 36, objectFit: "contain" }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{opt.label}</div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>{opt.desc}</div>
                </div>
              </button>
            ))}
            <Button fullWidth onClick={goNext} disabled={!role} style={{ marginTop: 8 }}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 1: Basic info */}
        {step === 1 && (
          <form onSubmit={handleSubmit(onStep1Submit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Basic Info</h2>
            <Input label="Full Name"    name="name"     placeholder="First Last"              register={register} required error={errors.name?.message} />
            <Input label="School Email" name="email"    type="email" placeholder="you@school.edu" register={register} required error={errors.email?.message} />
            <Input label="Password"     name="password" type="password" placeholder="Min 8 characters" register={register} required error={errors.password?.message} />
            <Input label="Phone Number" name="phone"    type="tel" placeholder="(413) 555-0000"  register={register} required error={errors.phone?.message} />
            {error && <p style={{ fontSize: 13, color: "#EF4444", textAlign: "center", margin: 0 }}>{error}</p>}
            <Button type="submit" fullWidth>Continue</Button>
          </form>
        )}

        {/* Step 2: Personal details → triggers registration */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onFinish)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>About You</h2>
            <Input label="Date of Birth" name="dob"      type="date"                           register={register} required error={errors.dob?.message} />
            <Input label="Pronouns"      name="pronouns" placeholder="e.g. she/her, they/them" register={register} />

            {/* Sex */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Sex</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SEX_OPTIONS.map((opt) => (
                  <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="radio" value={opt.value} {...register("sex", { required: true })} />
                    <span style={{ fontSize: 14, color: "#374151" }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Toggle
              checked={prefersWomen}
              onChange={setPrefersWomen}
              label="I prefer riding with women"
            />

            <p style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.5, margin: 0 }}>
              This can be toggled per-ride later. It helps us match you with people you're comfortable with.
            </p>

            {error && <p style={{ fontSize: 13, color: "#EF4444", textAlign: "center", margin: 0 }}>{error}</p>}
            <Button type="submit" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>
        )}

      </div>
    </div>
  );
}
