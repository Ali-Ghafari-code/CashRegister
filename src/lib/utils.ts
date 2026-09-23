import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import jalaali from "jalaali-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFa(input: number | string): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function formatToman(amount: number, { withUnit = true } = {}): string {
  const formatted = new Intl.NumberFormat("fa-IR").format(Math.round(amount));
  return withUnit ? `${formatted} تومان` : formatted;
}

export function formatRial(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(Math.round(amount)) + " ریال";
}

export function jalaliToday(): string {
  const d = new Date();
  const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const months = [
    "فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور",
    "مهر","آبان","آذر","دی","بهمن","اسفند",
  ];
  return `${toFa(j.jd)} ${months[j.jm - 1]} ${toFa(j.jy)}`;
}

export function jalaliDate(dt: Date): string {
  const j = jalaali.toJalaali(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
  return `${toFa(j.jy)}/${toFa(String(j.jm).padStart(2, "0"))}/${toFa(
    String(j.jd).padStart(2, "0"),
  )}`;
}

export function jalaliDateTime(dt: Date): string {
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${jalaliDate(dt)} - ${toFa(hh)}:${toFa(mm)}`;
}

export function percent(value: number): string {
  return `${toFa(value.toFixed(1))}٪`;
}
