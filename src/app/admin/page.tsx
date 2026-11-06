import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getSellerReport } from "@/lib/sellerReport";
import { homeFor } from "@/lib/portal";
import { ReportDashboard } from "@/components/ReportDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin dashboard · My Book Store" };

/** The whole store: every seller, every book, every paid order. */
export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  if (session.user.role !== Role.ADMIN) redirect(homeFor(session.user.role));

  const report = await getSellerReport({ kind: "store" });
  return <ReportDashboard report={report} />;
}
