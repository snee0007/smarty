import { FridgeItem } from '@/types/fridge';

const STORAGE_KEY = 'mario-fridge-items';

export function loadItems(): FridgeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const items = JSON.parse(raw);
    return items.map((i: any) => ({
      ...i,
      expiry: i.expiry ? new Date(i.expiry) : null,
      quantity: typeof i.quantity === 'number' && Number.isFinite(i.quantity) ? Math.max(1, Math.round(i.quantity)) : 1,
    }));
  } catch {
    return [];
  }
}

export function saveItems(items: FridgeItem[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      items.map((i) => ({
        ...i,
        expiry: i.expiry ? i.expiry.toISOString() : null,
      }))
    )
  );
}

export function getDaysLeft(expiry: Date | null): number | null {
  if (!expiry) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const exp = new Date(expiry);
  exp.setHours(0, 0, 0, 0);

  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}