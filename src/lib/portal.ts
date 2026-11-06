import { Role } from "@prisma/client";

/** Three separate sign-in pages: /login, /seller/login and /admin/login. */
export type Portal = "customer" | "seller" | "admin";

const ROLE_FOR: Record<Portal, Role> = {
  customer: Role.CUSTOMER,
  seller: Role.SELLER,
  admin: Role.ADMIN,
};

const PAGE_FOR: Record<Role, string> = {
  CUSTOMER: "the customer sign-in page",
  SELLER: "the Seller sign-in page",
  ADMIN: "the Admin sign-in page",
};

export function parsePortal(value: unknown): Portal {
  if (value === "seller") return "seller";
  // "owner" came from an older version of the admin page.
  if (value === "admin" || value === "owner") return "admin";
  return "customer";
}

/** Where each role lands after signing in. */
export function homeFor(role: Role | string | undefined) {
  if (role === Role.ADMIN) return "/admin";
  if (role === Role.SELLER) return "/seller";
  return "/shop";
}

/**
 * Each account may only sign in on its own page. Returns an error message
 * when the account belongs to a different page, otherwise null.
 */
export function portalError(portal: Portal, role: Role) {
  if (ROLE_FOR[portal] === role) return null;
  return `This account can't sign in here. Please use ${PAGE_FOR[role]}.`;
}
