import { useMemo, useState } from 'react';
import { PlusCircle, Sparkles, Trash2 } from 'lucide-react';
import { FridgeItem } from '@/types/fridge';
import { getDaysLeft } from '@/lib/fridgeStore';
import CollapsiblePanel from '@/components/app/CollapsiblePanel';

interface Props {
  items: FridgeItem[];
  onAdd: (name: string, expiry: string, type: string) => void;
  onRemove: (id: string) => void;
  onOpenRecipes: () => void;
  isFull: boolean;
}

const InventoryControlPanel = ({ items, onAdd, onRemove, onOpenRecipes, isFull }: Props) => {
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [type, setType] = useState('other');

  const sorted = useMemo(
    () => [...items].sort((a, b) => getDaysLeft(a.expiry) - getDaysLeft(b.expiry)).slice(0, 6),
    [items]
  );

  const submit = () => {
    if (!name.trim() || !expiry) return;
    onAdd(name.trim(), expiry, type);
    setName('');
    setExpiry('');
  };

  return (
    <div className="flex flex-col gap-3">
      <CollapsiblePanel title="INVENTORY LAUNCHER" defaultOpen={true}>
        <div className="space-y-3">
          <input className="retro-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. spinach" maxLength={24} />
          <input className="retro-input" value={expiry} onChange={(e) => setExpiry(e.target.value)} type="date" />
          <select className="retro-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="other">Produce / Other</option>
            <option value="milk">Milk / Dairy</option>
            <option value="cheese">Cheese / Protein</option>
            <option value="juice">Drink / Liquid</option>
          </select>
          <button className="retro-button w-full" onClick={submit} disabled={isFull}>
            <PlusCircle className="mr-2 inline-block" size={14} /> {isFull ? 'Fridge full' : 'Add to fridge'}
          </button>
          <button className="retro-button w-full !bg-[hsl(var(--mario-blue))]" onClick={onOpenRecipes}>
            <Sparkles className="mr-2 inline-block" size={14} /> AI recipes mode
          </button>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="EXPIRING SOON" defaultOpen={true}>
        {sorted.length === 0 ? (
          <p className="text-[10px] leading-5 text-muted-foreground">Add ingredients or scan a photo to wake Smarty up.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((item) => {
              const days = getDaysLeft(item.expiry);
              return (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-white">{item.name}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/50">{days <= 1 ? 'Use immediately' : `${days} day${days === 1 ? '' : 's'} left`}</div>
                    </div>
                    <button className="text-white/50 hover:text-red-300" onClick={() => onRemove(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CollapsiblePanel>
    </div>
  );
};

export default InventoryControlPanel;
