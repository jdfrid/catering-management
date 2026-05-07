import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/money";

export type RecipeCostLineDetail = {
  componentId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  wastePercent: number;
  qtyWithWaste: number;
  unitPrice: number | null;
  supplierId: string | null;
  supplierName: string | null;
  lineCost: number | null;
  source: "preferred" | "cheapest" | "missing";
};

export type RecipeCostResult = {
  total: Prisma.Decimal;
  lines: RecipeCostLineDetail[];
  missing: { ingredientName: string; unit: string }[];
};

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function isPriceActive(
  p: { validFrom: Date | null; validTo: Date | null },
  at: Date,
): boolean {
  if (p.validFrom && at < startOfLocalDay(p.validFrom)) return false;
  if (p.validTo && at > endOfLocalDay(p.validTo)) return false;
  return true;
}

/**
 * עלות מתכון פעיל למנה — לפי מחירון ספקים (יחידת המחיר במחירון חייבת להתאים ליחידה בשורת המתכון).
 * ספק מועדף לחומר נבחר אם יש לו מחיר תקף; אחרת המחיר הזול ביותר.
 */
export async function estimateMenuItemRecipeCost(
  menuItemId: string,
  at: Date = new Date(),
): Promise<RecipeCostResult | null> {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
  });
  if (!menuItem) return null;

  const recipe = await prisma.recipe.findFirst({
    where: { menuItemId, active: true },
    orderBy: { version: "desc" },
    include: {
      components: {
        orderBy: { id: "asc" },
        include: {
          ingredient: {
            select: {
              id: true,
              name: true,
              preferredSupplierId: true,
            },
          },
        },
      },
    },
  });

  if (!recipe || recipe.components.length === 0) {
    return {
      total: new Prisma.Decimal(0),
      lines: [],
      missing: [],
    };
  }

  const ingredientIds = [
    ...new Set(recipe.components.map((c) => c.ingredientId)),
  ];

  const allPrices = await prisma.supplierPrice.findMany({
    where: {
      ingredientId: { in: ingredientIds },
    },
    include: {
      supplier: { select: { id: true, name: true, active: true } },
    },
  });

  const lines: RecipeCostLineDetail[] = [];
  const missing: { ingredientName: string; unit: string }[] = [];
  let sum = 0;

  for (const comp of recipe.components) {
    const ing = comp.ingredient;
    const qty = decimalToNumber(comp.quantity);
    const waste = decimalToNumber(comp.wastePercent);
    const qtyWithWaste = qty * (1 + waste / 100);

    const candidates = allPrices.filter(
      (p) =>
        p.ingredientId === ing.id &&
        p.priceUnit === comp.unit &&
        p.supplier.active &&
        isPriceActive(p, at),
    );

    let picked: (typeof allPrices)[0] | null = null;
    let source: RecipeCostLineDetail["source"] = "missing";

    if (ing.preferredSupplierId) {
      const pref = candidates.find(
        (p) => p.supplierId === ing.preferredSupplierId,
      );
      if (pref) {
        picked = pref;
        source = "preferred";
      }
    }

    if (!picked && candidates.length > 0) {
      picked = candidates.reduce((best, p) =>
        decimalToNumber(p.price) < decimalToNumber(best.price) ? p : best,
      );
      source = "cheapest";
    }

    const unitPrice = picked ? decimalToNumber(picked.price) : null;
    const lineCost =
      unitPrice != null
        ? Math.round(qtyWithWaste * unitPrice * 100) / 100
        : null;

    if (lineCost != null) sum += lineCost;
    else {
      missing.push({ ingredientName: ing.name, unit: comp.unit });
    }

    lines.push({
      componentId: comp.id,
      ingredientId: ing.id,
      ingredientName: ing.name,
      quantity: qty,
      unit: comp.unit,
      wastePercent: waste,
      qtyWithWaste,
      unitPrice,
      supplierId: picked?.supplierId ?? null,
      supplierName: picked?.supplier.name ?? null,
      lineCost,
      source,
    });
  }

  return {
    total: new Prisma.Decimal(sum.toFixed(2)),
    lines,
    missing,
  };
}

/** עלות ליחידת מכירה אחת (לפי כמות בסיס המנה) */
export function costPerSaleUnit(
  recipeTotal: Prisma.Decimal,
  baseRecipeQuantity: Prisma.Decimal,
): number | null {
  const base = decimalToNumber(baseRecipeQuantity);
  if (base <= 0) return null;
  return decimalToNumber(recipeTotal) / base;
}
