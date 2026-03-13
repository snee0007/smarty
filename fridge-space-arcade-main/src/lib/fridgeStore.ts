import { FridgeItem } from '@/types/fridge';

const STORAGE_KEY = 'mario-fridge-items';

export function loadItems(): Omit<FridgeItem, 'mesh'>[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    return items.map((i: any) => ({ ...i, expiry: new Date(i.expiry) }));
  } catch {
    return [];
  }
}

export function saveItems(items: Omit<FridgeItem, 'mesh'>[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(
    items.map(i => ({ ...i, expiry: i.expiry.toISOString() }))
  ));
}

export function getDaysLeft(expiry: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiry);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
