import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/catalog";

export type ShopCategory = { id: string; name: string; blurb: string };

/**
 * Categories now live in the database so the owner can add new ones.
 * The first time this runs, the six original categories are copied in.
 */
export async function getCategories(): Promise<ShopCategory[]> {
  const order = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];
  let rows = await prisma.category.findMany({ orderBy: order });
  if (rows.length === 0) {
    await prisma.$transaction(
      CATEGORIES.map((c, i) =>
        prisma.category.upsert({
          where: { id: c.id },
          create: { id: c.id, name: c.name, blurb: c.blurb, sortOrder: i },
          update: {},
        })
      )
    );
    rows = await prisma.category.findMany({ orderBy: order });
  }
  return rows.map(({ id, name, blurb }) => ({ id, name, blurb }));
}
