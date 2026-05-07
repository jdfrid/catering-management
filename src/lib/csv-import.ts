import { EventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseCsvToRecords } from "@/lib/csv-parse";
import {
  CUSTOMER_TYPES,
  EVENT_TYPES,
  EVENT_STATUS_LABELS,
  INGREDIENT_TYPES,
  MENU_CATEGORIES,
  SALE_UNITS,
  SERVICE_LEVELS,
  SUPPLIER_CATEGORIES,
} from "@/lib/constants";
import { toDecimal, toDecimalMoney } from "@/lib/money";

export type ImportEntity =
  | "customers"
  | "suppliers"
  | "ingredients"
  | "menu_items"
  | "supplier_prices"
  | "recipe_components"
  | "events"
  | "customer_contacts";

export type ImportRowError = { line: number; message: string };

export type ImportResult = {
  ok: boolean;
  entity: ImportEntity;
  inserted: number;
  updated: number;
  skipped: number;
  errors: ImportRowError[];
};

const MAX_ERRORS = 80;

/** נורמליזציה של שמות עמודות — ערכי מפתח אנגליים אחידים */
const HEADER_MAP: Record<string, string> = {
  // English
  name: "name",
  type: "type",
  phone: "phone",
  email: "email",
  address: "address",
  taxid: "taxId",
  "tax_id": "taxId",
  notes: "notes",
  active: "active",
  category: "category",
  contactname: "contactName",
  "contact_name": "contactName",
  deliverydays: "deliveryDays",
  "delivery_days": "deliveryDays",
  minorderamount: "minOrderAmount",
  "min_order_amount": "minOrderAmount",
  unit: "unit",
  preferredsuppliername: "preferredSupplierName",
  "preferred_supplier": "preferredSupplierName",
  "supplier_preferred": "preferredSupplierName",
  saleunit: "saleUnit",
  "sale_unit": "saleUnit",
  baserecipequantity: "baseRecipeQuantity",
  "base_recipe_quantity": "baseRecipeQuantity",
  suggestedprice: "suggestedPrice",
  "suggested_price": "suggestedPrice",
  prepminutes: "prepMinutes",
  "prep_minutes": "prepMinutes",
  cookminutes: "cookMinutes",
  "cook_minutes": "cookMinutes",
  complexity: "complexity",
  instructions: "instructions",
  suppliername: "supplierName",
  "supplier_name": "supplierName",
  ingredientname: "ingredientName",
  "ingredient_name": "ingredientName",
  price: "price",
  priceunit: "priceUnit",
  "price_unit": "priceUnit",
  validfrom: "validFrom",
  "valid_from": "validFrom",
  validto: "validTo",
  "valid_to": "validTo",
  menuitemname: "menuItemName",
  "menu_item": "menuItemName",
  "menu_item_name": "menuItemName",
  quantity: "quantity",
  wastepercent: "wastePercent",
  "waste_percent": "wastePercent",
  waste: "wastePercent",
  customername: "customerName",
  "customer_name": "customerName",
  customerphone: "customerPhone",
  "customer_phone": "customerPhone",
  eventname: "eventName",
  "event_name": "eventName",
  date: "date",
  guestcount: "guestCount",
  "guest_count": "guestCount",
  servicelevel: "serviceLevel",
  "service_level": "serviceLevel",
  deliverytime: "deliveryTime",
  "delivery_time": "deliveryTime",
  menutype: "menuType",
  "menu_type": "menuType",
  operationalnotes: "operationalNotes",
  "operational_notes": "operationalNotes",
  status: "status",
  contactpersonname: "contactPersonName",
  "contact_person": "contactPersonName",
  role: "role",
  // Hebrew (ללא רווחים — אחרי נירמול)
  שם: "name",
  סוג: "type",
  טלפון: "phone",
  אימייל: "email",
  כתובת: "address",
  חפ: "taxId",
  "ח.פ": "taxId",
  הערות: "notes",
  פעיל: "active",
  קטגוריה: "category",
  אישקשר: "contactName",
  "איש קשר": "contactName",
  ימיאספקה: "deliveryDays",
  "ימי אספקה": "deliveryDays",
  מינהזמנה: "minOrderAmount",
  "מינ׳ם הזמנה": "minOrderAmount",
  יחידה: "unit",
  יחידתמחיר: "priceUnit",
  "יחידת מחיר": "priceUnit",
  ספקמועדף: "preferredSupplierName",
  "ספק מועדף": "preferredSupplierName",
  יחידתמכירה: "saleUnit",
  "יחידת מכירה": "saleUnit",
  כמותבסיס: "baseRecipeQuantity",
  "כמות בסיס": "baseRecipeQuantity",
  מחירמומלץ: "suggestedPrice",
  "מחיר מומלץ": "suggestedPrice",
  דקותהכנה: "prepMinutes",
  "דקות הכנה": "prepMinutes",
  דקותבישול: "cookMinutes",
  "דקות בישול": "cookMinutes",
  מורכבות: "complexity",
  הוראות: "instructions",
  שםספק: "supplierName",
  "שם ספק": "supplierName",
  שםחומר: "ingredientName",
  "שם חומר גלם": "ingredientName",
  חומרגלם: "ingredientName",
  מחיר: "price",
  תקףמ: "validFrom",
  "תקף מ": "validFrom",
  תקףעד: "validTo",
  "תקף עד": "validTo",
  שםמנה: "menuItemName",
  "שם מנה": "menuItemName",
  כמות: "quantity",
  פחת: "wastePercent",
  "פחת אחוז": "wastePercent",
  שםלקוח: "customerName",
  "שם לקוח": "customerName",
  טלפוןלקוח: "customerPhone",
  "טלפון לקוח": "customerPhone",
  שםאירוע: "eventName",
  "שם אירוע": "eventName",
  תאריך: "date",
  מספרמוזמנים: "guestCount",
  "מספר מוזמנים": "guestCount",
  רמתשירות: "serviceLevel",
  "רמת שירות": "serviceLevel",
  שעתאספקה: "deliveryTime",
  "שעת אספקה": "deliveryTime",
  סוגתפריט: "menuType",
  "סוג תפריט": "menuType",
  הערותתפעול: "operationalNotes",
  "הערות תפעול": "operationalNotes",
  סטטוס: "status",
  שםאישקשר: "contactPersonName",
  שםאישקשרנוסף: "contactPersonName",
  תפקיד: "role",
};

function normHeader(h: string): string {
  const t = h
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/\./g, "")
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .toLowerCase();
  const mapped = HEADER_MAP[t] ?? HEADER_MAP[h.trim().replace(/\s+/g, "")] ?? h.trim();
  return mapped.replace(/\s+/g, "");
}

function canonKey(k: string): string {
  return normHeader(k);
}

function rowToCanonical(row: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    const ck = canonKey(k);
    if (!ck) continue;
    if (!(ck in out)) out[ck] = v.trim();
  }
  return out;
}

function parseBool(raw: string | undefined, defaultVal = true): boolean {
  if (raw === undefined || raw === "") return defaultVal;
  const s = raw.trim().toLowerCase();
  if (["0", "false", "לא", "no", "off"].includes(s)) return false;
  if (["1", "true", "כן", "yes", "on"].includes(s)) return true;
  return defaultVal;
}

function pickEnum<T extends readonly string[]>(
  raw: string | undefined,
  allowed: T,
  fallback: T[number],
): T[number] {
  if (!raw?.trim()) return fallback;
  const v = raw.trim();
  if ((allowed as readonly string[]).includes(v)) return v as T[number];
  return fallback;
}

function parseDateLoose(raw: string | undefined): Date | null {
  if (!raw?.trim()) return null;
  const s = raw.trim();
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) return iso;
  const dm = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/.exec(
    s,
  );
  if (dm) {
    const d = Number(dm[1]);
    const m = Number(dm[2]) - 1;
    let y = Number(dm[3]);
    if (y < 100) y += 2000;
    const hh = dm[4] ? Number(dm[4]) : 12;
    const mm = dm[5] ? Number(dm[5]) : 0;
    const dt = new Date(y, m, d, hh, mm, 0);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

function eventStatusFromText(raw: string | undefined): EventStatus {
  if (!raw?.trim()) return EventStatus.NEW;
  const s = raw.trim();
  if ((Object.values(EventStatus) as string[]).includes(s)) {
    return s as EventStatus;
  }
  const entry = Object.entries(EVENT_STATUS_LABELS).find(
    ([, heb]) => heb === s,
  );
  if (entry) return entry[0] as EventStatus;
  return EventStatus.NEW;
}

function optionalNotes(s: string | undefined): string | null {
  const t = s?.trim() ?? "";
  return t === "" ? null : t;
}

export async function runCsvImport(
  entity: ImportEntity,
  csvText: string,
): Promise<ImportResult> {
  const parsed = parseCsvToRecords(csvText);
  const errors: ImportRowError[] = [];
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  if (parsed.headers.length === 0 || parsed.rows.length === 0) {
    return {
      ok: false,
      entity,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [{ line: 1, message: "קובץ ריק או בלי כותרות/שורות נתונים" }],
    };
  }

  const rowsCanon = parsed.rows.map(rowToCanonical);

  const pushErr = (line: number, message: string) => {
    if (errors.length < MAX_ERRORS) errors.push({ line, message });
  };

  try {
    for (let i = 0; i < rowsCanon.length; i++) {
      const lineNo = i + 2;
      const r = rowsCanon[i];
      if (Object.values(r).every((v) => !v)) {
        skipped++;
        continue;
      }
      try {
        switch (entity) {
          case "customers": {
            const name = r.name?.trim();
            const phone = r.phone?.trim();
            if (!name || !phone) {
              pushErr(lineNo, "לקוח: חובה שם וטלפון");
              break;
            }
            const type = pickEnum(r.type, CUSTOMER_TYPES, CUSTOMER_TYPES[0]);
            const existing = await prisma.customer.findFirst({
              where: { name, phone },
            });
            if (existing) {
              await prisma.customer.update({
                where: { id: existing.id },
                data: {
                  type,
                  email: r.email?.trim() || null,
                  address: r.address?.trim() || null,
                  taxId: r.taxId?.trim() || null,
                  notes: optionalNotes(r.notes),
                  active: parseBool(r.active, existing.active),
                },
              });
              updated++;
            } else {
              await prisma.customer.create({
                data: {
                  name,
                  type,
                  phone,
                  email: r.email?.trim() || null,
                  address: r.address?.trim() || null,
                  taxId: r.taxId?.trim() || null,
                  notes: optionalNotes(r.notes),
                  active: parseBool(r.active, true),
                },
              });
              inserted++;
            }
            break;
          }
          case "suppliers": {
            const name = r.name?.trim();
            if (!name) {
              pushErr(lineNo, "ספק: חובה שם");
              break;
            }
            const category = pickEnum(
              r.category,
              SUPPLIER_CATEGORIES,
              SUPPLIER_CATEGORIES[SUPPLIER_CATEGORIES.length - 1],
            );
            const existing = await prisma.supplier.findFirst({
              where: { name },
            });
            const minRaw = r.minOrderAmount?.trim();
            const minOrderAmount =
              minRaw && minRaw !== ""
                ? toDecimalMoney(minRaw)
                : null;
            if (existing) {
              await prisma.supplier.update({
                where: { id: existing.id },
                data: {
                  category,
                  contactName: r.contactName?.trim() || null,
                  phone: r.phone?.trim() || null,
                  email: r.email?.trim() || null,
                  deliveryDays: r.deliveryDays?.trim() || null,
                  minOrderAmount,
                  active: parseBool(r.active, existing.active),
                },
              });
              updated++;
            } else {
              await prisma.supplier.create({
                data: {
                  name,
                  category,
                  contactName: r.contactName?.trim() || null,
                  phone: r.phone?.trim() || null,
                  email: r.email?.trim() || null,
                  deliveryDays: r.deliveryDays?.trim() || null,
                  minOrderAmount,
                  active: parseBool(r.active, true),
                },
              });
              inserted++;
            }
            break;
          }
          case "ingredients": {
            const name = r.name?.trim();
            if (!name) {
              pushErr(lineNo, "חומר גלם: חובה שם");
              break;
            }
            const type = pickEnum(
              r.type,
              INGREDIENT_TYPES,
              INGREDIENT_TYPES[INGREDIENT_TYPES.length - 1],
            );
            const unit = r.unit?.trim() || "יחידה";
            let preferredSupplierId: string | null = null;
            const psn = r.preferredSupplierName?.trim();
            if (psn) {
              const sup = await prisma.supplier.findFirst({
                where: { name: psn },
              });
              if (!sup) {
                pushErr(lineNo, `ספק מועדף לא נמצא: ${psn}`);
                break;
              }
              preferredSupplierId = sup.id;
            }
            const existing = await prisma.ingredient.findFirst({
              where: { name },
            });
            if (existing) {
              await prisma.ingredient.update({
                where: { id: existing.id },
                data: {
                  type,
                  unit,
                  preferredSupplierId,
                  active: parseBool(r.active, existing.active),
                },
              });
              updated++;
            } else {
              await prisma.ingredient.create({
                data: {
                  name,
                  type,
                  unit,
                  preferredSupplierId,
                  active: parseBool(r.active, true),
                },
              });
              inserted++;
            }
            break;
          }
          case "menu_items": {
            const name = r.name?.trim();
            if (!name) {
              pushErr(lineNo, "מנה: חובה שם");
              break;
            }
            const category = pickEnum(
              r.category,
              MENU_CATEGORIES,
              MENU_CATEGORIES[MENU_CATEGORIES.length - 1],
            );
            const saleUnit = pickEnum(r.saleUnit, SALE_UNITS, SALE_UNITS[0]);
            const baseQ = Number.parseFloat(
              (r.baseRecipeQuantity ?? "1").replace(",", "."),
            );
            if (!Number.isFinite(baseQ) || baseQ <= 0) {
              pushErr(lineNo, "כמות בסיס חייבת להיות מספר חיובי");
              break;
            }
            const suggestedRaw = r.suggestedPrice?.trim();
            const suggestedPrice =
              suggestedRaw && suggestedRaw !== ""
                ? toDecimalMoney(suggestedRaw)
                : null;
            const prepRaw = r.prepMinutes?.trim();
            const cookRaw = r.cookMinutes?.trim();
            const prepMinutes =
              prepRaw && prepRaw !== ""
                ? Number.parseInt(prepRaw, 10)
                : null;
            const cookMinutes =
              cookRaw && cookRaw !== ""
                ? Number.parseInt(cookRaw, 10)
                : null;
            const existing = await prisma.menuItem.findFirst({
              where: { name },
            });
            if (existing) {
              await prisma.menuItem.update({
                where: { id: existing.id },
                data: {
                  category,
                  saleUnit,
                  baseRecipeQuantity: toDecimal(String(baseQ)),
                  suggestedPrice,
                  prepMinutes:
                    prepMinutes !== null && !Number.isNaN(prepMinutes)
                      ? prepMinutes
                      : null,
                  cookMinutes:
                    cookMinutes !== null && !Number.isNaN(cookMinutes)
                      ? cookMinutes
                      : null,
                  complexity: r.complexity?.trim() || null,
                  instructions: r.instructions?.trim() || null,
                  active: parseBool(r.active, existing.active),
                },
              });
              const recipe = await prisma.recipe.findFirst({
                where: { menuItemId: existing.id, active: true },
                orderBy: { version: "desc" },
              });
              if (recipe) {
                await prisma.recipe.update({
                  where: { id: recipe.id },
                  data: { baseQuantity: toDecimal(String(baseQ)) },
                });
              }
              updated++;
            } else {
              await prisma.$transaction(async (tx) => {
                const created = await tx.menuItem.create({
                  data: {
                    name,
                    category,
                    saleUnit,
                    baseRecipeQuantity: toDecimal(String(baseQ)),
                    suggestedPrice,
                    prepMinutes:
                      prepMinutes !== null && !Number.isNaN(prepMinutes)
                        ? prepMinutes
                        : null,
                    cookMinutes:
                      cookMinutes !== null && !Number.isNaN(cookMinutes)
                        ? cookMinutes
                        : null,
                    complexity: r.complexity?.trim() || null,
                    instructions: r.instructions?.trim() || null,
                    active: parseBool(r.active, true),
                  },
                });
                await tx.recipe.create({
                  data: {
                    menuItemId: created.id,
                    version: 1,
                    active: true,
                    baseQuantity: toDecimal(String(baseQ)),
                  },
                });
              });
              inserted++;
            }
            break;
          }
          case "supplier_prices": {
            const sn = r.supplierName?.trim();
            const ingn = r.ingredientName?.trim();
            const priceRaw = r.price?.trim();
            const priceUnit = r.priceUnit?.trim() || "ק״ג";
            if (!sn || !ingn || !priceRaw) {
              pushErr(lineNo, "מחירון: חובה שם ספק, שם חומר ומחיר");
              break;
            }
            const sup = await prisma.supplier.findFirst({ where: { name: sn } });
            const ing = await prisma.ingredient.findFirst({
              where: { name: ingn },
            });
            if (!sup) {
              pushErr(lineNo, `ספק לא נמצא: ${sn}`);
              break;
            }
            if (!ing) {
              pushErr(lineNo, `חומר גלם לא נמצא: ${ingn}`);
              break;
            }
            const price = toDecimalMoney(priceRaw);
            const validFrom = parseDateLoose(r.validFrom);
            const validTo = parseDateLoose(r.validTo);
            const existed = await prisma.supplierPrice.findUnique({
              where: {
                supplierId_ingredientId_priceUnit: {
                  supplierId: sup.id,
                  ingredientId: ing.id,
                  priceUnit,
                },
              },
            });
            await prisma.supplierPrice.upsert({
              where: {
                supplierId_ingredientId_priceUnit: {
                  supplierId: sup.id,
                  ingredientId: ing.id,
                  priceUnit,
                },
              },
              create: {
                supplierId: sup.id,
                ingredientId: ing.id,
                price,
                priceUnit,
                validFrom,
                validTo,
                notes: optionalNotes(r.notes),
              },
              update: {
                price,
                validFrom,
                validTo,
                notes: optionalNotes(r.notes),
              },
            });
            if (existed) updated++;
            else inserted++;
            break;
          }
          case "recipe_components": {
            const mn = r.menuItemName?.trim();
            const ingn = r.ingredientName?.trim();
            const qtyRaw = r.quantity?.trim();
            if (!mn || !ingn || !qtyRaw) {
              pushErr(lineNo, "מתכון: חובה שם מנה, שם חומר וכמות");
              break;
            }
            const menuItem = await prisma.menuItem.findFirst({
              where: { name: mn },
            });
            if (!menuItem) {
              pushErr(lineNo, `מנה לא נמצאה: ${mn}`);
              break;
            }
            const ing = await prisma.ingredient.findFirst({
              where: { name: ingn },
            });
            if (!ing) {
              pushErr(lineNo, `חומר גלם לא נמצא: ${ingn}`);
              break;
            }
            let recipe = await prisma.recipe.findFirst({
              where: { menuItemId: menuItem.id, active: true },
              orderBy: { version: "desc" },
            });
            if (!recipe) {
              recipe = await prisma.recipe.create({
                data: {
                  menuItemId: menuItem.id,
                  version: 1,
                  active: true,
                  baseQuantity: menuItem.baseRecipeQuantity,
                },
              });
            }
            const qty = Number.parseFloat(qtyRaw.replace(",", "."));
            if (!Number.isFinite(qty) || qty < 0) {
              pushErr(lineNo, "כמות לא תקינה");
              break;
            }
            const unit = r.unit?.trim() || ing.unit;
            const wasteRaw = r.wastePercent?.trim();
            const wastePercent =
              wasteRaw && wasteRaw !== ""
                ? Number.parseFloat(wasteRaw.replace(",", "."))
                : 0;
            const waste = Number.isFinite(wastePercent) ? wastePercent : 0;
            const existingComp = await prisma.recipeComponent.findFirst({
              where: { recipeId: recipe.id, ingredientId: ing.id },
            });
            if (existingComp) {
              await prisma.recipeComponent.update({
                where: { id: existingComp.id },
                data: {
                  quantity: toDecimal(String(qty)),
                  unit,
                  wastePercent: toDecimal(String(waste)),
                  notes: optionalNotes(r.notes),
                },
              });
              updated++;
            } else {
              await prisma.recipeComponent.create({
                data: {
                  recipeId: recipe.id,
                  ingredientId: ing.id,
                  quantity: toDecimal(String(qty)),
                  unit,
                  wastePercent: toDecimal(String(waste)),
                  notes: optionalNotes(r.notes),
                },
              });
              inserted++;
            }
            break;
          }
          case "events": {
            const cn = r.customerName?.trim();
            const cp = r.customerPhone?.trim();
            if (!cn || !cp) {
              pushErr(lineNo, "אירוע: חובה שם לקוח וטלפון לקוח");
              break;
            }
            const customer = await prisma.customer.findFirst({
              where: { name: cn, phone: cp },
            });
            if (!customer) {
              pushErr(
                lineNo,
                `לקוח לא נמצא (${cn} / ${cp}) — ייבאו לקוחות תחילה`,
              );
              break;
            }
            const type = pickEnum(r.type, EVENT_TYPES, EVENT_TYPES[EVENT_TYPES.length - 1]);
            const date = parseDateLoose(r.date);
            if (!date) {
              pushErr(lineNo, "תאריך אירוע לא תקין");
              break;
            }
            const guestRaw = r.guestCount?.trim();
            const guestCount = guestRaw ? Number.parseInt(guestRaw, 10) : NaN;
            if (!Number.isFinite(guestCount) || guestCount < 0) {
              pushErr(lineNo, "מספר מוזמנים לא תקין");
              break;
            }
            const serviceLevel = pickEnum(
              r.serviceLevel,
              SERVICE_LEVELS,
              SERVICE_LEVELS[0],
            );
            const deliveryTime = parseDateLoose(r.deliveryTime);
            const status = eventStatusFromText(r.status);
            await prisma.event.create({
              data: {
                customerId: customer.id,
                name: r.eventName?.trim() || null,
                type,
                date,
                deliveryTime,
                address: r.address?.trim() || null,
                guestCount,
                serviceLevel,
                menuType: r.menuType?.trim() || null,
                operationalNotes: optionalNotes(r.operationalNotes),
                status,
              },
            });
            inserted++;
            break;
          }
          case "customer_contacts": {
            const cn = r.customerName?.trim();
            const cp = r.customerPhone?.trim();
            const cname =
              r.contactPersonName?.trim() || r.contactName?.trim();
            if (!cn || !cp || !cname) {
              pushErr(
                lineNo,
                "איש קשר: חובה שם לקוח, טלפון לקוח ושם איש קשר (או contactPersonName)",
              );
              break;
            }
            const customer = await prisma.customer.findFirst({
              where: { name: cn, phone: cp },
            });
            if (!customer) {
              pushErr(lineNo, `לקוח לא נמצא (${cn} / ${cp})`);
              break;
            }
            const existing = await prisma.customerContact.findFirst({
              where: { customerId: customer.id, name: cname },
            });
            if (existing) {
              await prisma.customerContact.update({
                where: { id: existing.id },
                data: {
                  role: r.role?.trim() || null,
                  phone: r.phone?.trim() || null,
                  email: r.email?.trim() || null,
                },
              });
              updated++;
            } else {
              await prisma.customerContact.create({
                data: {
                  customerId: customer.id,
                  name: cname,
                  role: r.role?.trim() || null,
                  phone: r.phone?.trim() || null,
                  email: r.email?.trim() || null,
                },
              });
              inserted++;
            }
            break;
          }
          default:
            pushErr(lineNo, "סוג ייבוא לא מוכר");
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        pushErr(lineNo, msg);
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.unshift({ line: 0, message: msg });
  }

  const ok = errors.length === 0;
  return {
    ok,
    entity,
    inserted,
    updated,
    skipped,
    errors,
  };
}
