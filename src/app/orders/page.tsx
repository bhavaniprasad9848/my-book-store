import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { Topbar } from "@/components/Topbar";
import { getOrdersFor } from "@/lib/orders";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  // Sellers follow their sales on their own dashboard.
  if (session.user.role === Role.SELLER) redirect("/seller");
  const isAdmin = session.user.role === Role.ADMIN;
  const initial = await getOrdersFor({ id: session.user.id, isAdmin });

  return (
    <>
      <Topbar />
      <main className="page orders-page">
        <OrdersClient initial={initial} isAdmin={isAdmin} />
      </main>
    </>
  );
}
