import RegisterForm from "@/components/auth/RegisterForm";
import { registerUser } from "./actions";

export default function RegisterPage() {
  return (
      <RegisterForm onSubmit={registerUser} />
  );
}