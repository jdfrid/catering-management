"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/forms";
import { errState, okState } from "@/lib/forms";
import { KITCHEN_DEPARTMENTS } from "@/lib/constants";

const deptEnum = z.enum(KITCHEN_DEPARTMENTS);
const taskStatusEnum = z.nativeEnum(TaskStatus);

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function optId(v: string | undefined): string | null {
  const t = v?.trim() ?? "";
  return t === "" ? null : t;
}

function parseWorkDate(workDate: string): Date {
  const d = new Date(`${workDate.trim()}T12:00:00`);
  return d;
}

function parseStartTime(
  workDate: string,
  startTime: string | undefined,
): Date | null {
  const t = startTime?.trim() ?? "";
  if (t === "") return null;
  const d = new Date(`${workDate.trim()}T${t}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const baseTaskSchema = z.object({
  eventId: z.string().min(1, "בחר אירוע"),
  menuItemId: z.string().optional(),
  name: z.string().min(1, "שם משימה חובה"),
  department: deptEnum,
  assignee: z.string().optional(),
  workDate: z.string().min(1, "תאריך עבודה חובה"),
  startTime: z.string().optional(),
  durationMinutes: z.string().optional(),
  status: taskStatusEnum.optional(),
  notes: z.string().optional(),
});

export async function createKitchenTask(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = baseTaskSchema.safeParse({
    eventId: String(formData.get("eventId") ?? ""),
    menuItemId: optionalStr(formData.get("menuItemId")),
    name: String(formData.get("name") ?? ""),
    department: String(formData.get("department") ?? ""),
    assignee: optionalStr(formData.get("assignee")),
    workDate: String(formData.get("workDate") ?? ""),
    startTime: optionalStr(formData.get("startTime")),
    durationMinutes: optionalStr(formData.get("durationMinutes")),
    notes: optionalStr(formData.get("notes")),
  });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const ev = await prisma.event.findUnique({ where: { id: parsed.data.eventId } });
  if (!ev) return errState({ eventId: "אירוע לא נמצא" });

  const menuItemId = optId(parsed.data.menuItemId);
  if (menuItemId) {
    const mi = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!mi) return errState({ menuItemId: "מנה לא נמצאה" });
  }

  const workDate = parseWorkDate(parsed.data.workDate);
  if (Number.isNaN(workDate.getTime())) {
    return errState({ workDate: "תאריך לא תקין" });
  }

  let duration: number | null = null;
  if (parsed.data.durationMinutes?.trim()) {
    const n = Number.parseInt(parsed.data.durationMinutes, 10);
    if (Number.isNaN(n) || n < 0) {
      return errState({ durationMinutes: "משך בדקות לא תקין" });
    }
    duration = n;
  }

  const task = await prisma.kitchenTask.create({
    data: {
      eventId: parsed.data.eventId,
      menuItemId: menuItemId,
      name: parsed.data.name.trim(),
      department: parsed.data.department,
      assignee: trimOrNull(parsed.data.assignee),
      workDate,
      startTime: parseStartTime(parsed.data.workDate, parsed.data.startTime),
      durationMinutes: duration,
      status: TaskStatus.OPEN,
      notes: trimOrNull(parsed.data.notes),
    },
  });

  revalidatePath("/kitchen");
  redirect(`/kitchen/${task.id}`);
}

export async function updateKitchenTask(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = baseTaskSchema
    .extend({
      id: z.string().min(1),
      status: taskStatusEnum,
    })
    .safeParse({
      id: String(formData.get("id") ?? ""),
      eventId: String(formData.get("eventId") ?? ""),
      menuItemId: optionalStr(formData.get("menuItemId")),
      name: String(formData.get("name") ?? ""),
      department: String(formData.get("department") ?? ""),
      assignee: optionalStr(formData.get("assignee")),
      workDate: String(formData.get("workDate") ?? ""),
      startTime: optionalStr(formData.get("startTime")),
      durationMinutes: optionalStr(formData.get("durationMinutes")),
      status: String(formData.get("status") ?? ""),
      notes: optionalStr(formData.get("notes")),
    });
  if (!parsed.success) return errState(flattenZod(parsed.error));

  const ev = await prisma.event.findUnique({ where: { id: parsed.data.eventId } });
  if (!ev) return errState({ eventId: "אירוע לא נמצא" });

  const menuItemId = optId(parsed.data.menuItemId);
  if (menuItemId) {
    const mi = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!mi) return errState({ menuItemId: "מנה לא נמצאה" });
  }

  const workDate = parseWorkDate(parsed.data.workDate);
  if (Number.isNaN(workDate.getTime())) {
    return errState({ workDate: "תאריך לא תקין" });
  }

  let duration: number | null = null;
  if (parsed.data.durationMinutes?.trim()) {
    const n = Number.parseInt(parsed.data.durationMinutes, 10);
    if (Number.isNaN(n) || n < 0) {
      return errState({ durationMinutes: "משך בדקות לא תקין" });
    }
    duration = n;
  }

  await prisma.kitchenTask.update({
    where: { id: parsed.data.id },
    data: {
      eventId: parsed.data.eventId,
      menuItemId: menuItemId,
      name: parsed.data.name.trim(),
      department: parsed.data.department,
      assignee: trimOrNull(parsed.data.assignee),
      workDate,
      startTime: parseStartTime(parsed.data.workDate, parsed.data.startTime),
      durationMinutes: duration,
      status: parsed.data.status,
      notes: trimOrNull(parsed.data.notes),
    },
  });

  revalidatePath("/kitchen");
  revalidatePath(`/kitchen/${parsed.data.id}`);
  return okState("נשמר");
}

export async function updateKitchenTaskQuickStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;
  const ok = taskStatusEnum.safeParse(status);
  if (!ok.success) return;
  await prisma.kitchenTask.update({
    where: { id },
    data: { status: ok.data },
  });
  revalidatePath("/kitchen");
  revalidatePath(`/kitchen/${id}`);
}

export async function deleteKitchenTask(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await prisma.kitchenTask.delete({ where: { id } });
  revalidatePath("/kitchen");
  redirect("/kitchen");
}

function optionalStr(v: FormDataEntryValue | null): string | undefined {
  if (v === null || v === undefined) return undefined;
  return String(v);
}

function trimOrNull(s: string | undefined): string | null {
  const t = s?.trim() ?? "";
  return t === "" ? null : t;
}
