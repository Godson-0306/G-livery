import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@g-livery.app").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const kitchenHash = await bcrypt.hash("Kitchen123!", 10);
  const runnerHash = await bcrypt.hash("Runner123!", 10);
  const studentHash = await bcrypt.hash("Student123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "G-livery Admin",
      email: adminEmail,
      phone: "08000000001",
      passwordHash,
      role: "admin",
    },
  });

  const kitchen = await prisma.user.upsert({
    where: { email: "kitchen@g-livery.app" },
    update: {},
    create: {
      name: "Campus Grill Owner",
      email: "kitchen@g-livery.app",
      phone: "08000000002",
      passwordHash: kitchenHash,
      role: "cafeteria",
    },
  });

  const runnerUser = await prisma.user.upsert({
    where: { email: "runner@g-livery.app" },
    update: {},
    create: {
      name: "Amaka Runner",
      email: "runner@g-livery.app",
      phone: "08000000003",
      passwordHash: runnerHash,
      role: "runner",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@g-livery.app" },
    update: {},
    create: {
      name: "Tunde Student",
      email: "student@g-livery.app",
      phone: "08000000004",
      passwordHash: studentHash,
      role: "student",
    },
  });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const grill = await prisma.cafeteria.upsert({
    where: { slug: "campus-grill" },
    update: { isActive: true, ownerId: kitchen.id },
    create: {
      name: "Campus Grill",
      slug: "campus-grill",
      description: "Jollof, protein, and quick campus meals from the main cafeteria block.",
      location: "Main cafeteria block, ground floor",
      ownerId: kitchen.id,
      isActive: true,
      qrCodeUrl: `${appUrl}/cafeteria/campus-grill`,
    },
  });

  const noodlesOwner = await prisma.user.upsert({
    where: { email: "noodles@g-livery.app" },
    update: {},
    create: {
      name: "Noodle Hub Owner",
      email: "noodles@g-livery.app",
      phone: "08000000005",
      passwordHash: kitchenHash,
      role: "cafeteria",
    },
  });

  const noodles = await prisma.cafeteria.upsert({
    where: { slug: "noodle-hub" },
    update: { isActive: true, ownerId: noodlesOwner.id },
    create: {
      name: "Noodle Hub",
      slug: "noodle-hub",
      description: "Indomie combos, shawarma, and late-night snacks.",
      location: "Hostel road, near Gate 2",
      ownerId: noodlesOwner.id,
      isActive: true,
      qrCodeUrl: `${appUrl}/cafeteria/noodle-hub`,
    },
  });

  const grillItems: Prisma.MenuItemCreateManyInput[] = [
    {
      cafeteriaId: grill.id,
      name: "Jollof rice & chicken",
      description: "Smoky party jollof with grilled chicken and coleslaw.",
      price: 2500,
      category: "Mains",
      isAvailable: true,
    },
    {
      cafeteriaId: grill.id,
      name: "Fried rice & turkey",
      description: "Vegetable fried rice with spicy turkey.",
      price: 2800,
      category: "Mains",
      isAvailable: true,
    },
    {
      cafeteriaId: grill.id,
      name: "Beans & plantain",
      description: "Honey beans, fried plantain, and stew.",
      price: 1800,
      category: "Mains",
      isAvailable: true,
    },
    {
      cafeteriaId: grill.id,
      name: "Chapman",
      description: "Campus classic fruit drink.",
      price: 800,
      category: "Drinks",
      isAvailable: true,
    },
  ];

  const noodleItems: Prisma.MenuItemCreateManyInput[] = [
    {
      cafeteriaId: noodles.id,
      name: "Indomie special",
      description: "Chicken, egg, sausage, and extra spice.",
      price: 1500,
      category: "Mains",
      isAvailable: true,
    },
    {
      cafeteriaId: noodles.id,
      name: "Chicken shawarma",
      description: "Loaded wrap with extra sauce.",
      price: 2200,
      category: "Mains",
      isAvailable: true,
    },
    {
      cafeteriaId: noodles.id,
      name: "Zobo",
      description: "Chilled hibiscus drink.",
      price: 500,
      category: "Drinks",
      isAvailable: true,
    },
  ];

  if ((await prisma.menuItem.count({ where: { cafeteriaId: grill.id } })) === 0) {
    await prisma.menuItem.createMany({ data: grillItems });
  }
  if ((await prisma.menuItem.count({ where: { cafeteriaId: noodles.id } })) === 0) {
    await prisma.menuItem.createMany({ data: noodleItems });
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  await prisma.runner.upsert({
    where: { userId: runnerUser.id },
    update: {
      subscriptionStatus: "active",
      subscriptionExpiresAt: expires,
      isAcceptingOrders: true,
      bankName: "Access Bank",
      accountName: "Amaka Okafor",
      accountNumber: "0123456789",
    },
    create: {
      userId: runnerUser.id,
      personalSlug: "amaka-runs",
      subscriptionStatus: "active",
      subscriptionExpiresAt: expires,
      isAcceptingOrders: true,
      bankName: "Access Bank",
      accountName: "Amaka Okafor",
      accountNumber: "0123456789",
    },
  });

  console.log("Seeded G-livery demo data.");
  console.log(`  Admin:    ${admin.email} / ${adminPassword}`);
  console.log("  Kitchen:  kitchen@g-livery.app / Kitchen123!");
  console.log("  Runner:   runner@g-livery.app / Runner123!");
  console.log(`  Student:  ${student.email} / Student123!`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
