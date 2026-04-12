import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/user.service";
import { useToastStore } from "../../store/toast.store";
import PageHeader from "../../components/layout/PageHeader";
import Input from "../../components/ui/Input";
import Toggle from "../../components/ui/Toggle";
import Button from "../../components/ui/Button";
import { ROUTES } from "../../constants/routes";

export default function EditProfilePage() {
  const navigate        = useNavigate();
  const user            = useAuthStore((s) => s.user);
  const { isDriver, updateUser } = useAuth();
  const queryClient              = useQueryClient();
  const showToast                = useToastStore((s) => s.show);
  const [prefersWomen, setPrefersWomen] = useState(user?.prefersWomen ?? false);
  const [loading, setLoading]           = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name:     user?.name ?? "",
      pronouns: user?.pronouns ?? "",
      phone:    user?.phone ?? "",
      location: user?.location ?? "",
      bio:      user?.bio ?? "",
      // vehicle
      vehicleMake:  user?.vehicle?.make  ?? "",
      vehicleModel: user?.vehicle?.model ?? "",
      vehicleYear:  user?.vehicle?.year  ?? "",
      vehicleColor: user?.vehicle?.color ?? "",
      vehiclePlate: user?.vehicle?.plate ?? "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const patch = {
      name:        data.name,
      pronouns:    data.pronouns,
      phone:       data.phone,
      location:    data.location,
      bio:         data.bio,
      prefersWomen,
      ...(isDriver ? {
        vehicle: {
          make:  data.vehicleMake,
          model: data.vehicleModel,
          year:  Number(data.vehicleYear) || data.vehicleYear,
          color: data.vehicleColor,
          plate: data.vehiclePlate,
        },
      } : {}),
    };
    try {
      const { data: updatedUser } = await userService.updateProfile(patch);
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["user", updatedUser.id] });
      showToast("Profile saved!");
      navigate(ROUTES.MY_PROFILE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F7F7F8" }}>
      <PageHeader title="Edit Profile" showBack />
      <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="Full Name"  name="name"     register={register} />
        <Input label="Pronouns"   name="pronouns" register={register} />
        <Input label="Phone"      name="phone"    type="tel" register={register} />
        <Input label="Location"   name="location" placeholder="City, State" register={register} />

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Bio</label>
          <textarea
            {...register("bio")}
            rows={3}
            style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 12px", fontSize: 15, color: "#111827", resize: "none", backgroundColor: "#fff", outline: "none", width: "100%", boxSizing: "border-box" }}
          />
        </div>

        <Toggle checked={prefersWomen} onChange={setPrefersWomen} label="Prefer women by default" />

        {isDriver && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 8 }}>🚗 Vehicle</div>
            <Input label="Make"  name="vehicleMake"  register={register} placeholder="Honda" />
            <Input label="Model" name="vehicleModel" register={register} placeholder="Civic" />
            <Input label="Year"  name="vehicleYear"  register={register} placeholder="2021" />
            <Input label="Color" name="vehicleColor" register={register} placeholder="Silver" />
            <Input label="Plate" name="vehiclePlate" register={register} placeholder="MA 123ABC" />
          </>
        )}

        <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: 8 }}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}
