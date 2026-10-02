-- Kitchen no longer owns preparing/packed hops. Remap those tickets to accepted.
UPDATE "Order" SET status = 'accepted' WHERE status IN ('preparing', 'ready');

CREATE TYPE "OrderStatus_new" AS ENUM ('placed', 'accepted', 'picked_up', 'delivered', 'cancelled');

ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");

DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";

ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'placed';
