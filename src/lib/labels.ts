import type { Role } from "@prisma/client";

export const AGENT_LABEL = "Delivery Agent";

export function roleLabel(role: Role) {
  switch (role) {
    case "runner":
      return AGENT_LABEL;
    case "cafeteria":
      return "Cafeteria";
    case "student":
      return "Student";
    case "admin":
      return "Admin";
  }
}
