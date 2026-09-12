import type { OrderStatus, Role } from "@prisma/client";

const TRANSITIONS: Record<Role, Partial<Record<OrderStatus, OrderStatus[]>>> = {
  student: {
    placed: ["cancelled"],
  },
  cafeteria: {
    accepted: ["preparing"],
    preparing: ["ready"],
  },
  runner: {
    placed: ["accepted"],
    ready: ["picked_up"],
    picked_up: ["delivered"],
  },
  admin: {
    placed: ["accepted", "cancelled"],
    accepted: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["picked_up", "cancelled"],
    picked_up: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  },
};

export function canTransition(
  role: Role,
  from: OrderStatus,
  to: OrderStatus,
) {
  return TRANSITIONS[role][from]?.includes(to) ?? false;
}
