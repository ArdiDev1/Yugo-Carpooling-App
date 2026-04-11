import Input from "../ui/Input";

export default function LocationInput({ label, name, placeholder, register, error }) {
  return (
    <Input
      label={label}
      name={name}
      placeholder={placeholder ?? "Enter location..."}
      prefix="📍"
      register={register}
      error={error}
    />
  );
}
