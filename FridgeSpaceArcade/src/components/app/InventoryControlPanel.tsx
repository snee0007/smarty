import { useMemo, useState } from 'react';
import { CalendarDays, PlusCircle, Sparkles, Trash2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { FridgeItem } from '@/types/fridge';
import { getDaysLeft } from '@/lib/fridgeStore';
import CollapsiblePanel from '@/components/app/CollapsiblePanel';

interface Props {
  items: FridgeItem[];
  onAdd: (name: string, expiry: string | null, type: string, quantity?: number) => void;
  onRemove: (id: string) => void;
  onOpenRecipes: () => void;
  onUpdateItem: (id: string, updates: { quantity?: number; expiry?: Date | null }) => void;
}

const InventoryControlPanel = ({ items, onAdd, onRemove, onOpenRecipes, onUpdateItem }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [type, setType] = useState('other');
  const [quantity, setQuantity] = useState(1);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (getDaysLeft(a.expiry) ?? 9999) - (getDaysLeft(b.expiry) ?? 9999)),
    [items]
  );

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), expiry || null, type, quantity);
    setName('');
    setExpiry('');
    setType('other');
    setQuantity(1);
    setModalOpen(false);
  };

  const renderExpiryLabel = (item: FridgeItem) => {
    const days = getDaysLeft(item.expiry);
    if (days === null) return 'No expiry';
    if (days <= 0) return 'Expired / today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const modal =
    modalOpen && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-5xl rounded-[32px] border border-[rgba(255,255,255,0.12)] bg-[radial-gradient(circle_at_top,_rgba(52,144,220,0.16),_rgba(7,10,22,0.97)_42%)] p-6 shadow-[0_0_90px_rgba(0,0,0,0.45)] md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="retro-title">ADD FOOD TO FRIDGE</div>
                  <p className="mt-3 text-sm leading-6 text-white/68">
                    Add ingredients manually
                  </p>
                </div>
                <button
                  className="rounded-full border border-white/10 p-2 text-white/60 transition hover:text-white"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close add ingredient popup"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                  Ingredient name
                  <input
                    className="retro-input mt-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. spinach"
                    maxLength={32}
                  />
                </label>

                <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                  Category
                  <select className="retro-select mt-2" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="other">Produce / Other</option>
                    <option value="milk">Milk / Dairy</option>
                    <option value="cheese">Cheese / Protein</option>
                    <option value="juice">Drink / Liquid</option>
                  </select>
                </label>

                <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                  Quantity
                  <input
                    className="retro-input mt-2"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    placeholder="Quantity"
                  />
                </label>

                <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={12} /> Expiry date (optional)
                  </span>
                  <input
                    className="retro-input mt-2"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    type="date"
                  />
                </label>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="retro-button min-w-[180px]" onClick={submit}>
                  <PlusCircle className="mr-2 inline-block" size={14} /> Add item
                </button>
                <button
                  className="retro-button min-w-[180px] !bg-[rgba(255,255,255,0.08)]"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="flex flex-col gap-3">
        <CollapsiblePanel title="INVENTORY CONTROLS" defaultOpen={true}>
          <div className="space-y-3">
            <button className="retro-button w-full text-base !py-4" onClick={onOpenRecipes}>
              <Sparkles className="mr-2 inline-block" size={16} /> Generate AI recipes
            </button>
            <button className="retro-button w-full !bg-[hsl(var(--mario-blue))]" onClick={() => setModalOpen(true)}>
              <PlusCircle className="mr-2 inline-block" size={14} /> Add food manually
            </button>
            <p className="text-[10px] leading-5 text-muted-foreground">
              Scan or add as many ingredients as you want. Use the inventory list below to edit quantity and expiry at any time.
            </p>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel title="FRIDGE INVENTORY" defaultOpen={true}>
          {sorted.length === 0 ? (
            <p className="text-[10px] leading-5 text-muted-foreground">Add ingredients or scan a photo to wake Smarty up.</p>
          ) : (
            <div className="max-h-[64vh] overflow-y-auto pr-1">
              <div className="grid gap-2">
                {sorted.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-white">{item.name}</div>
                        <div className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-white/45">
                          {renderExpiryLabel(item)}
                        </div>
                      </div>
                      <button
                        className="shrink-0 text-white/45 transition hover:text-red-300"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[9px] uppercase tracking-[0.15em] text-white/45">
                        Qty
                        <input
                          className="retro-input mt-1 !h-9 !px-2 !text-xs"
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => onUpdateItem(item.id, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                        />
                      </label>

                      <label className="text-[9px] uppercase tracking-[0.15em] text-white/45">
                        Expiry
                        <input
                          className="retro-input mt-1 !h-9 !px-2 !text-xs"
                          type="date"
                          value={item.expiry ? new Date(item.expiry).toISOString().slice(0, 10) : ''}
                          onChange={(e) => onUpdateItem(item.id, { expiry: e.target.value ? new Date(e.target.value) : null })}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CollapsiblePanel>
      </div>

      {modal}
    </>
  );
};

export default InventoryControlPanel;