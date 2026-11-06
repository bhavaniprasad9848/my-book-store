import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Admin sign in · My Book Store" };

export default function AdminLoginPage() {
  return <LoginForm portal="admin" />;
}
