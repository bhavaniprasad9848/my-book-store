import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Seller sign in · My Book Store" };

export default function SellerLoginPage() {
  return <LoginForm portal="seller" />;
}
