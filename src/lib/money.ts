import { Prisma } from "@prisma/client";

/** מחרוזת מהטופס → Decimal ל-Pisma */
export function toDecimal(value: string | undefined, fallback = "0"): Prisma.Decimal {
  const raw = (value ?? fallback).trim().replace(",", ".");
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n)) {
    return new Prisma.Decimal(fallback);
  }
  return new Prisma.Decimal(n.toFixed(4));
}

export function toDecimalMoney(value: string | undefined): Prisma.Decimal {
  const raw = (value ?? "0").trim().replace(",", ".");
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n)) {
    return new Prisma.Decimal("0");
  }
  return new Prisma.Decimal(n.toFixed(2));
}

export function decimalToNumber(d: Prisma.Decimal): number {
  return d.toNumber();
}
