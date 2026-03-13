export interface FridgeItem {
  id: string;
  name: string;
  expiry: Date;
  type: 'milk' | 'cheese' | 'juice' | 'other';
  shelfIndex: number;
  slotIndex: number;
}

export interface FridgeSlot {
  shelfIndex: number;
  slotIndex: number;
  occupied: boolean;
}
