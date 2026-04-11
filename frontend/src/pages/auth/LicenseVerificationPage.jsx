import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useForm } from "react-hook-form";
import { ROUTES } from "../../constants/routes";
import { authService } from "../../services/auth.service";

export default function LicenseVerificationPage() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", fileRef.current.files[0]);
      formData.append("expiration_date", data.expirationDate);
      await authService.uploadLicense(formData);
      navigate(ROUTES.EMAIL_VERIFY);
    } catch {
      // proceed anyway — license can be re-uploaded later
      navigate(ROUTES.EMAIL_VERIFY);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", backgroundColor: "#F7F7F8" }}>
      <PageHeader title="License Verification" showBack />
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20, lineHeight: 1.6 }}>
          Drivers must verify their license before posting rides. Upload a clear photo of your driver's license.
        </p>

        {/* Upload zone */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border:          "2px dashed #6C47FF",
            borderRadius:    12,
            padding:         "28px 20px",
            textAlign:       "center",
            cursor:          "pointer",
            backgroundColor: "#F9F7FF",
            marginBottom:    20,
          }}
        >
          {preview ? (
            <img src={preview} alt="license preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, objectFit: "contain" }} />
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 14, color: "#6C47FF", fontWeight: 600 }}>Tap to upload or take a photo</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>JPG, PNG, or PDF</div>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display: "none" }} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="License Expiration Date" name="expirationDate" type="date" register={register} />
          <Button type="submit" fullWidth loading={loading} disabled={!preview}>
            Submit for Review
          </Button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.EMAIL_VERIFY)}
            style={{ background: "none", border: "none", fontSize: 13, color: "#9CA3AF", cursor: "pointer", textDecoration: "underline" }}
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
