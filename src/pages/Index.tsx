import { useState, useCallback, useEffect } from 'react';
import FridgeScene, { MAX_ITEMS, SHELVES, SLOTS_PER_SHELF } from '@/components/FridgeScene';
import AddItemPanel from '@/components/AddItemPanel';
import Scoreboard from '@/components/Scoreboard';
import { FridgeItem } from '@/types/fridge';
import { loadItems, saveItems } from '@/lib/fridgeStore';

const Index = () => {
  const [items, setItems] = useState<FridgeItem[]>(() => {
    const saved = loadItems();
    return saved as FridgeItem[];
  });
  const [doorOpen, setDoorOpen] = useState(false);
  const [shouldOpenDoor, setShouldOpenDoor] = useState(false);

  useEffect(() => {
    saveItems(items.map(({ ...rest }) => rest));
  }, [items]);

  const findFreeSlot = (): { shelfIndex: number; slotIndex: number } | null => {
    for (let s = 0; s < SHELVES; s++) {
      for (let sl = 0; sl < SLOTS_PER_SHELF; sl++) {
        if (!items.some(i => i.shelfIndex === s && i.slotIndex === sl)) {
          return { shelfIndex: s, slotIndex: sl };
        }
      }
    }
    return null;
  };

  const handleAdd = useCallback((name: string, expiry: string, type: string) => {
    const slot = findFreeSlot();
    if (!slot) return;

    if (!doorOpen) {
      setShouldOpenDoor(true);
    }

    const newItem: FridgeItem = {
      id: crypto.randomUUID(),
      name,
      expiry: new Date(expiry),
      type: type as FridgeItem['type'],
      shelfIndex: slot.shelfIndex,
      slotIndex: slot.slotIndex,
    };

    setItems(prev => [...prev, newItem]);
  }, [doorOpen, items]);

  const handleRemove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const handleDoorState = useCallback((open: boolean) => {
    setDoorOpen(open);
    if (open) setShouldOpenDoor(false);
  }, []);

  return (
    <>
      <FridgeScene
        items={items}
        onRemoveItem={handleRemove}
        onDoorStateChange={handleDoorState}
        doorShouldOpen={shouldOpenDoor}
      />
      <AddItemPanel onAdd={handleAdd} isFull={items.length >= MAX_ITEMS} />
      <Scoreboard items={items} />
      <div className="fixed bottom-4 right-4 z-50 retro-panel">
        <div className="text-[7px] font-pixel text-muted-foreground">
          CLICK DOOR TO OPEN • CLICK ITEM TO REMOVE
        </div>
      </div>
    </>
  );
};

export default Index;
