import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getSellerReport } from "@/lib/sellerReport";
import { homeFor } from "@/lib/portal";
import { ReportDashboard } from "@/components/ReportDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Seller dashboard · My Book Store" };

/** A seller's own books: stock, sales and money earned. */
export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/seller/login");
  if (session.user.role !== Role.SELLER) redirect(homeFor(session.user.role));

  const report = await getSellerReport({ kind: "seller", sellerId: session.user.id });
  return <ReportDashboard report={report} sellerName={session.user.name ?? undefined} />;
}
