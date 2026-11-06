import { RegisterForm } from "@/components/RegisterForm";

export const metadata = { title: "Become a seller · My Book Store" };

export default function SellerRegisterPage() {
  return <RegisterForm kind="seller" />;
}
