import type { OrderStatus, Role } from "@prisma/client";

const TRANSITIONS: Record<Role, Partial<Record<OrderStatus, OrderStatus[]>>> = {
  student: {
    placed: ["cancelled"],
  },
  cafeteria: {},
  runner: {
    placed: ["accepted"],
    accepted: ["picked_up"],
    picked_up: ["delivered"],
  },
  admin: {
    placed: ["accepted", "cancelled"],
    accepted: ["picked_up", "cancelled"],
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
