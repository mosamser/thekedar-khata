import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { WorkerRole, WorkerGender } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndian(dateInput: string | Date): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(dateInput: string | Date): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function getRoleBadge(role: string): { label: string; hindi: string; color: string } {
  switch (role) {
    case "MISTRI":
      return { label: "Mason", hindi: "मिस्त्री", color: "bg-blue-100 text-blue-900 border-blue-300 font-black" };
    case "VELDAR":
    case "HELPER":
      return { label: "Helper", hindi: "हेल्पर (Helper)", color: "bg-amber-100 text-amber-900 border-amber-300 font-bold" };
    case "REJA":
      return { label: "Female Labour", hindi: "रेजा 👩", color: "bg-pink-100 text-pink-900 border-pink-300 font-bold" };
    case "LABOUR":
      return { label: "Labour", hindi: "मजदूर", color: "bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold" };
    case "CARPENTER":
      return { label: "Carpenter", hindi: "बढ़ई", color: "bg-orange-100 text-orange-800 border-orange-300 font-semibold" };
    case "PAINTER":
      return { label: "Painter", hindi: "पेंटर", color: "bg-purple-100 text-purple-800 border-purple-300 font-semibold" };
    default:
      return { label: "Other", hindi: "अन्य", color: "bg-slate-100 text-slate-800 border-slate-300 font-semibold" };
  }
}

/**
 * STRICT INDIAN CONSTRUCTION HIERARCHY:
 * 1. मिस्त्री (Mistri) - Top
 * 2. हेल्पर (Helper)
 * 3. रेजा (Reja - Female Labour)
 * 4. मजदूर (General Labour / Other)
 */
export function getRoleHierarchyPriority(role: string, gender?: string): number {
  if (role === "MISTRI") return 1;
  if (role === "VELDAR" || role === "HELPER") return 2;
  if (role === "REJA" || (role === "LABOUR" && gender === "FEMALE")) return 3;
  if (role === "LABOUR") return 4;
  return 5;
}

export function cleanWorkerName(name: string): string {
  if (!name) return "";
  return name.replace(/\s*\((मिस्त्री|हेल्पर|बेलदार|मजदूर|रेजा|कारीगर|लेबर)[^)]*\)/gi, '').trim();
}

export function sortWorkersByHierarchy<T extends { role: string; gender?: WorkerGender; name?: string; workerName?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const pA = getRoleHierarchyPriority(a.role, a.gender);
    const pB = getRoleHierarchyPriority(b.role, b.gender);
    if (pA !== pB) return pA - pB;
    const nameA = a.name || a.workerName || "";
    const nameB = b.name || b.workerName || "";
    return nameA.localeCompare(nameB);
  });
}

export function getAttendanceBadge(status?: string): {
  short: string;
  hindi: string;
  weight: number;
  badgeClass: string;
} {
  switch (status) {
    case "PRESENT":
      return { short: "P", hindi: "उपस्थित", weight: 1.0, badgeClass: "bg-emerald-500 text-white font-bold" };
    case "HALF_DAY":
      return { short: "HD", hindi: "आधा दिन", weight: 0.5, badgeClass: "bg-amber-500 text-white font-bold" };
    case "ABSENT":
      return { short: "A", hindi: "गैरहाजिर", weight: 0.0, badgeClass: "bg-rose-500 text-white font-bold" };
    case "OVERTIME":
      return { short: "OT", hindi: "ओवरटाइम", weight: 1.25, badgeClass: "bg-indigo-600 text-white font-bold" };
    default:
      return { short: "-", hindi: "दर्ज नहीं", weight: 0.0, badgeClass: "bg-slate-200 text-slate-500 border border-slate-300" };
  }
}
