import { useState, useCallback, useEffect } from 'react';
import FridgeScene, { MAX_ITEMS, SHELVES, SLOTS_PER_SHELF } from '@/components/FridgeScene';
import AddItemPanel from '@/components/AddItemPanel';
import Scoreboard from '@/components/Scoreboard';
import ScanFridgePanel from '@/components/ScanFridgePanel';
import { FridgeItem } from '@/types/fridge';
import { loadItems, saveItems } from '@/lib/fridgeStore';
import { fileToDataUri } from '@/lib/fileToDataUri';
import { detectFridgeItems } from '@/lib/imageDetectionApi';

const DEFAULT_EXPIRY_DAYS = 7;

const normalizeDetectedName = (name: string) =>
  name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());

const guessItemType = (name: string): FridgeItem['type'] => {
  const lower = name.toLowerCase();

  if (/(milk|yogurt|cream|butter)/.test(lower)) return 'milk';
  if (/(cheese)/.test(lower)) return 'cheese';
  if (/(juice|soda|drink|cola|bottle|water)/.test(lower)) return 'juice';
  return 'other';
};

const getDefaultExpiryDate = () => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + DEFAULT_EXPIRY_DAYS);
  return expiry;
};

const Index = () => {
  const [items, setItems] = useState<FridgeItem[]>(() => {
    const saved = loadItems();
    return saved as FridgeItem[];
  });
  const [doorOpen, setDoorOpen] = useState(false);
  const [shouldOpenDoor, setShouldOpenDoor] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    saveItems(items.map(({ ...rest }) => rest));
  }, [items]);

  const findFreeSlot = useCallback(
    (currentItems: FridgeItem[]): { shelfIndex: number; slotIndex: number } | null => {
      for (let shelfIndex = 0; shelfIndex < SHELVES; shelfIndex++) {
        for (let slotIndex = 0; slotIndex < SLOTS_PER_SHELF; slotIndex++) {
          const occupied = currentItems.some(
            (item) => item.shelfIndex === shelfIndex && item.slotIndex === slotIndex
          );

          if (!occupied) {
            return { shelfIndex, slotIndex };
          }
        }
      }

      return null;
    },
    []
  );

  const handleAdd = useCallback(
    (name: string, expiry: string, type: string) => {
      setItems((prev) => {
        const slot = findFreeSlot(prev);
        if (!slot) return prev;

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

        return [...prev, newItem];
      });
    },
    [doorOpen, findFreeSlot]
  );

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleDoorState = useCallback((open: boolean) => {
    setDoorOpen(open);
    if (open) {
      setShouldOpenDoor(false);
    }
  }, []);

  const handleDetectedItems = useCallback(
    (detectedNames: string[]) => {
      const cleanedNames = Array.from(
        new Set(
          detectedNames
            .map(normalizeDetectedName)
            .filter((name) => name.length > 0)
        )
      );

      if (cleanedNames.length === 0) {
        window.alert('The AI did not detect any items from that photo. Try a clearer image.');
        return;
      }

      const nextItems = [...items];
      let addedCount = 0;
      let skippedCount = 0;

      for (const detectedName of cleanedNames) {
        const duplicateExists = nextItems.some(
          (item) => item.name.toLowerCase() === detectedName.toLowerCase()
        );

        if (duplicateExists) {
          skippedCount += 1;
          continue;
        }

        const slot = findFreeSlot(nextItems);
        if (!slot) {
          skippedCount += 1;
          continue;
        }

        nextItems.push({
          id: crypto.randomUUID(),
          name: detectedName,
          expiry: getDefaultExpiryDate(),
          type: guessItemType(detectedName),
          shelfIndex: slot.shelfIndex,
          slotIndex: slot.slotIndex,
        });

        addedCount += 1;
      }

      if (addedCount > 0) {
        setItems(nextItems);

        if (!doorOpen) {
          setShouldOpenDoor(true);
        }

        if (skippedCount > 0) {
          window.alert(`Added ${addedCount} item(s). Skipped ${skippedCount} duplicate or overflow item(s).`);
        } else {
          window.alert(`Added ${addedCount} item(s) from the scanned fridge photo.`);
        }

        return;
      }

      window.alert('Nothing new was added from that scan.');
    },
    [items, doorOpen, findFreeSlot]
  );

  const handleFileScan = useCallback(
    async (file: File) => {
      try {
        setIsScanning(true);
        const photoDataUri = await fileToDataUri(file);
        const detectedItems = await detectFridgeItems(photoDataUri);
        handleDetectedItems(detectedItems);
      } catch (error) {
        console.error(error);
        window.alert(error instanceof Error ? error.message : 'Failed to scan fridge image.');
      } finally {
        setIsScanning(false);
      }
    },
    [handleDetectedItems]
  );

  return (
    <>
      <FridgeScene
        items={items}
        onRemoveItem={handleRemove}
        onDoorStateChange={handleDoorState}
        doorShouldOpen={shouldOpenDoor}
      />

      <ScanFridgePanel
        isScanning={isScanning}
        onFileSelect={handleFileScan}
      />

      <AddItemPanel onAdd={handleAdd} isFull={items.length >= MAX_ITEMS} />
      <Scoreboard items={items} />

      <div className="fixed bottom-4 right-4 z-50 retro-panel max-w-[220px]">
        <div className="text-[7px] font-pixel text-muted-foreground leading-3">
          DRAG TO ROTATE VIEW • CLICK DOOR TO OPEN • CLICK ITEM TO REMOVE • SCAN A PHOTO TO AUTO-FILL THE FRIDGE
        </div>
      </div>
    </>
  );
};

export default Index;