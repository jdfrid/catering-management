"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/forms";
import { errState, okState } from "@/lib/forms";
import { EVENT_TYPES, SERVICE_LEVELS } from "@/lib/constants";

function combineDateTime(dateStr: string, timeStr: string | undefined): Date {
  const d = dateStr.trim();
  const t = (timeStr?.trim() || "12:00").slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return new Date(d);
  }
  return new Date(`${d}T${t}:00`);
}

function optionalCombineDateTime(
  dateStr: string,
  timeStr: string | undefined | null,
): Date | null {
  if (!timeStr?.trim()) return null;
  return combineDateTime(dateStr, timeStr);
}

const eventTypes = [...EVENT_TYPES] as [string, ...string[]];
const serviceLevels = [...SERVICE_LEVELS] as [string, ...string[]];

const eventSchema = z.object({
  customerId: z.string().min(1, "בחר לקוח"),
  name: z.string().optional(),
  type: z.enum(eventTypes),
  eventDate: z.string().min(1, "תאריך אירוע חובה"),
  eventTime: z.string().optional(),
  deliveryTime: z.string().optional(),
  address: z.string().optional(),
  guestCount: z.coerce.number().int().positive("מספר סועדים חיובי"),
  serviceLevel: z.enum(serviceLevels),
  menuType: z.string().optional(),
  operationalNotes: z.string().optional(),
  status: z.nativeEnum(EventStatus),
});

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createEvent(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    customerId: formData.get("customerId"),
    name: formData.get("name"),
    type: formData.get("type"),
    eventDate: formData.get("eventDate"),
    eventTime: formData.get("eventTime"),
    deliveryTime: formData.get("deliveryTime"),
    address: formData.get("address"),
    guestCount: formData.get("guestCount"),
    serviceLevel: formData.get("serviceLevel"),
    menuType: formData.get("menuType"),
    operationalNotes: formData.get("operationalNotes"),
    status: formData.get("status"),
  };

  const parsed = eventSchema.safeParse({
    customerId: String(raw.customerId ?? ""),
    name:
      raw.name === null || raw.name === undefined
        ? undefined
        : String(raw.name),
    type: String(raw.type ?? ""),
    eventDate: String(raw.eventDate ?? ""),
    eventTime:
      raw.eventTime === null || raw.eventTime === undefined
        ? undefined
        : String(raw.eventTime),
    deliveryTime:
      raw.deliveryTime === null || raw.deliveryTime === undefined
        ? undefined
        : String(raw.deliveryTime),
    address:
      raw.address === null || raw.address === undefined
        ? undefined
        : String(raw.address),
    guestCount: raw.guestCount,
    serviceLevel: String(raw.serviceLevel ?? ""),
    menuType:
      raw.menuType === null || raw.menuType === undefined
        ? undefined
        : String(raw.menuType),
    operationalNotes:
      raw.operationalNotes === null || raw.operationalNotes === undefined
        ? undefined
        : String(raw.operationalNotes),
    status: raw.status as EventStatus,
  });

  if (!parsed.success) {
    return errState(flattenZod(parsed.error));
  }

  const date = combineDateTime(parsed.data.eventDate, parsed.data.eventTime);
  const delivery = optionalCombineDateTime(
    parsed.data.eventDate,
    parsed.data.deliveryTime,
  );

  const ev = await prisma.event.create({
    data: {
      customerId: parsed.data.customerId,
      name: parsed.data.name?.trim() || null,
      type: parsed.data.type,
      date,
      deliveryTime: delivery,
      address: parsed.data.address?.trim() || null,
      guestCount: parsed.data.guestCount,
      serviceLevel: parsed.data.serviceLevel,
      menuType: parsed.data.menuType?.trim() || null,
      operationalNotes: parsed.data.operationalNotes?.trim() || null,
      status: parsed.data.status,
    },
  });

  revalidatePath("/events");
  revalidatePath(`/customers/${parsed.data.customerId}`);
  redirect(`/events/${ev.id}`);
}

export async function updateEvent(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return errState({ _form: "חסר מזהה אירוע" });
  }

  const raw = {
    customerId: formData.get("customerId"),
    name: formData.get("name"),
    type: formData.get("type"),
    eventDate: formData.get("eventDate"),
    eventTime: formData.get("eventTime"),
    deliveryTime: formData.get("deliveryTime"),
    address: formData.get("address"),
    guestCount: formData.get("guestCount"),
    serviceLevel: formData.get("serviceLevel"),
    menuType: formData.get("menuType"),
    operationalNotes: formData.get("operationalNotes"),
    status: formData.get("status"),
  };

  const parsed = eventSchema.safeParse({
    customerId: String(raw.customerId ?? ""),
    name:
      raw.name === null || raw.name === undefined
        ? undefined
        : String(raw.name),
    type: String(raw.type ?? ""),
    eventDate: String(raw.eventDate ?? ""),
    eventTime:
      raw.eventTime === null || raw.eventTime === undefined
        ? undefined
        : String(raw.eventTime),
    deliveryTime:
      raw.deliveryTime === null || raw.deliveryTime === undefined
        ? undefined
        : String(raw.deliveryTime),
    address:
      raw.address === null || raw.address === undefined
        ? undefined
        : String(raw.address),
    guestCount: raw.guestCount,
    serviceLevel: String(raw.serviceLevel ?? ""),
    menuType:
      raw.menuType === null || raw.menuType === undefined
        ? undefined
        : String(raw.menuType),
    operationalNotes:
      raw.operationalNotes === null || raw.operationalNotes === undefined
        ? undefined
        : String(raw.operationalNotes),
    status: raw.status as EventStatus,
  });

  if (!parsed.success) {
    return errState(flattenZod(parsed.error));
  }

  const date = combineDateTime(parsed.data.eventDate, parsed.data.eventTime);
  const delivery = optionalCombineDateTime(
    parsed.data.eventDate,
    parsed.data.deliveryTime,
  );

  await prisma.event.update({
    where: { id },
    data: {
      customerId: parsed.data.customerId,
      name: parsed.data.name?.trim() || null,
      type: parsed.data.type,
      date,
      deliveryTime: delivery,
      address: parsed.data.address?.trim() || null,
      guestCount: parsed.data.guestCount,
      serviceLevel: parsed.data.serviceLevel,
      menuType: parsed.data.menuType?.trim() || null,
      operationalNotes: parsed.data.operationalNotes?.trim() || null,
      status: parsed.data.status,
    },
  });

  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  revalidatePath(`/customers/${parsed.data.customerId}`);
  return okState("האירוע עודכן");
}

export async function deleteEvent(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  const q = await prisma.quote.count({ where: { eventId: id } });
  if (q > 0) {
    redirect(`/events/${id}?deleteBlocked=1`);
  }
  const ev = await prisma.event.findUnique({
    where: { id },
    select: { customerId: true },
  });
  await prisma.event.delete({ where: { id } });
  revalidatePath("/events");
  if (ev) revalidatePath(`/customers/${ev.customerId}`);
  redirect("/events");
}
