"use server";

import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { uploadImageFile } from "@/lib/uploads";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/actions/auth";

async function ownedCafeteria(userId: string) {
  return prisma.cafeteria.findFirst({ where: { ownerId: userId } });
}

async function maybeUpload(formData: FormData, folder: string) {
  const value = formData.get("photo");
  if (!value || typeof value === "string") return undefined;
  const file = value as File;
  if (typeof file.arrayBuffer !== "function" || file.size === 0) return undefined;
  return uploadImageFile(file, folder);
}

export async function createMenuItemAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("cafeteria");
  const cafeteria = await ownedCafeteria(session.user.id);
  if (!cafeteria) return { error: "No cafeteria is linked to this account." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = Number(formData.get("price"));
  if (!name || !Number.isFinite(price) || price <= 0) {
    return { error: "Name and a valid price are required." };
  }

  let photoUrl: string | undefined;
  try {
    photoUrl = await maybeUpload(formData, `menu/${cafeteria.id}`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }

  await prisma.menuItem.create({
    data: {
      cafeteriaId: cafeteria.id,
      name,
      description: description || null,
      category: category || null,
      price,
      photoUrl,
    },
  });

  revalidatePath("/dashboard/cafeteria");
  revalidatePath(`/cafeteria/${cafeteria.slug}`);
  redirect("/dashboard/cafeteria/menu");
}

export async function updateMenuItemAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("cafeteria");
  const cafeteria = await ownedCafeteria(session.user.id);
  if (!cafeteria) return { error: "No cafeteria is linked to this account." };

  const id = String(formData.get("id") ?? "");
  const item = await prisma.menuItem.findFirst({
    where: { id, cafeteriaId: cafeteria.id },
  });
  if (!item) return { error: "Menu item not found." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = Number(formData.get("price"));
  if (!name || !Number.isFinite(price) || price <= 0) {
    return { error: "Name and a valid price are required." };
  }

  let photoUrl: string | undefined;
  try {
    photoUrl = await maybeUpload(formData, `menu/${cafeteria.id}`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }

  await prisma.menuItem.update({
    where: { id },
    data: {
      name,
      description: description || null,
      category: category || null,
      price,
      ...(photoUrl ? { photoUrl } : {}),
    },
  });

  revalidatePath("/dashboard/cafeteria/menu");
  revalidatePath(`/cafeteria/${cafeteria.slug}`);
  redirect("/dashboard/cafeteria/menu");
}

export async function toggleSoldOutAction(itemId: string) {
  const session = await requireRole("cafeteria");
  const cafeteria = await ownedCafeteria(session.user.id);
  if (!cafeteria) return;

  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, cafeteriaId: cafeteria.id },
  });
  if (!item) return;

  await prisma.menuItem.update({
    where: { id: itemId },
    data: { isAvailable: !item.isAvailable },
  });

  revalidatePath("/dashboard/cafeteria/menu");
  revalidatePath(`/cafeteria/${cafeteria.slug}`);
}

export async function deleteMenuItemAction(itemId: string) {
  const session = await requireRole("cafeteria");
  const cafeteria = await ownedCafeteria(session.user.id);
  if (!cafeteria) return;

  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, cafeteriaId: cafeteria.id },
  });
  if (!item) return;

  await prisma.menuItem.delete({ where: { id: itemId } });
  revalidatePath("/dashboard/cafeteria/menu");
  revalidatePath(`/cafeteria/${cafeteria.slug}`);
}

export async function updateCafeteriaProfileAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole("cafeteria");
  const cafeteria = await ownedCafeteria(session.user.id);
  if (!cafeteria) return { error: "No cafeteria is linked to this account." };

  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return { error: "Name is required." };

  let logoUrl: string | undefined;
  try {
    logoUrl = await maybeUpload(formData, `logos/${cafeteria.id}`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }

  await prisma.cafeteria.update({
    where: { id: cafeteria.id },
    data: {
      name,
      location: location || null,
      description: description || null,
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  revalidatePath("/dashboard/cafeteria");
  revalidatePath(`/cafeteria/${cafeteria.slug}`);
  return { success: "Profile saved." };
}
