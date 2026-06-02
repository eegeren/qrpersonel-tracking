import { createHash } from "crypto";

export function normalizeNationalId(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidNationalId(value: string) {
  return /^\d{11}$/.test(value);
}

export function hashNationalId(value: string) {
  const pepper = process.env.NATIONAL_ID_PEPPER ?? process.env.JWT_SECRET ?? "";
  return createHash("sha256").update(`${pepper}:${value}`).digest("hex");
}

export function maskNationalId(value: string) {
  return `${value.slice(0, 3)}******${value.slice(-2)}`;
}

export function nationalIdLast4(value: string) {
  return value.slice(-4);
}
