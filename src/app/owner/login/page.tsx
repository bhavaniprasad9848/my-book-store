import { redirect } from "next/navigation";

/** The old owner login is now the admin login. Old links still work. */
export default function OwnerLoginRedirect() {
  redirect("/admin/login");
}
