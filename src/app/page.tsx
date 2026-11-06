import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { homeFor } from "@/lib/portal";

export default async function HomePage() {
  const session = await auth();
  redirect(session?.user ? homeFor(session.user.role) : "/login");
}
