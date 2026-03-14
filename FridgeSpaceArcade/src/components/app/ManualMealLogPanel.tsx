import { useState } from 'react';
import { ClipboardPlus, Flame, Beef, Wheat, Droplets, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { MealLog } from '@/types/app';

interface Props {
  onLogMeal: (meal: Omit<MealLog, 'id' | 'eatenAt'>) => void;
}

const defaultForm = {
  recipeName: '',
  mealType: 'lunch' as MealLog['mealType'],
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
};

const ManualMealLogPanel = ({ onLogMeal }: Props) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const updateField = (field: keyof typeof defaultForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const reset = () => setForm(defaultForm);

  const submit = () => {
    if (!form.recipeName.trim()) return;

    onLogMeal({
      recipeName: form.recipeName.trim(),
      mealType: form.mealType,
      nutrition: {
        calories: Math.max(0, Number(form.calories) || 0),
        protein: Math.max(0, Number(form.protein) || 0),
        carbs: Math.max(0, Number(form.carbs) || 0),
        fat: Math.max(0, Number(form.fat) || 0),
      },
    });

    reset();
    setOpen(false);
  };

  const modal =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-4xl rounded-[32px] border border-[rgba(255,255,255,0.12)] bg-[radial-gradient(circle_at_top,_rgba(86,204,242,0.14),_rgba(7,10,22,0.97)_42%)] p-6 shadow-[0_0_90px_rgba(0,0,0,0.45)] md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="retro-title">LOG MEAL MANUALLY</div>
                  <p className="mt-3 text-sm leading-6 text-white/68">
                    Enter a meal name and its nutrition. It will be tracked exactly like a logged recipe.
                  </p>
                </div>
                <button
                  className="rounded-full border border-white/10 p-2 text-white/60 transition hover:text-white"
                  onClick={() => setOpen(false)}
                  aria-label="Close manual meal popup"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-white/50 md:col-span-2">
                  Meal name
                  <input
                    className="retro-input mt-2"
                    value={form.recipeName}
                    onChange={(e) => updateField('recipeName', e.target.value)}
                    placeholder="e.g. Chicken rice bowl"
                    maxLength={48}
                  />
                </label>

                <label className="text-[10px] uppercase tracking-[0.18em] text-white/50 md:col-span-2">
                  Meal type
                  <select
                    className="retro-select mt-2"
                    value={form.mealType}
                    onChange={(e) => updateField('mealType', e.target.value as MealLog['mealType'])}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </label>

                <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                  <span className="inline-flex items-center gap-2"><Flame size={12} /> Calories</span>
                  <input
                    className="retro-input mt-2"
                    type="number"
                    min={0}
                    value={form.calories}
                    onChange={(e) => updateField('calories', e.target.value)}
                    placeholder="0"
                  />
                </label>

                <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                  <span className="inline-flex items-center gap-2"><Beef size={12} /> Protein</span>
                  <input
                    className="retro-input mt-2"
                    type="number"
                    min={0}
                    value={form.protein}
                    onChange={(e) => updateField('protein', e.target.value)}
                    placeholder="0"
                  />
                </label>

                <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                  <span className="inline-flex items-center gap-2"><Wheat size={12} /> Carbs</span>
                  <input
                    className="retro-input mt-2"
                    type="number"
                    min={0}
                    value={form.carbs}
                    onChange={(e) => updateField('carbs', e.target.value)}
                    placeholder="0"
                  />
                </label>

                <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                  <span className="inline-flex items-center gap-2"><Droplets size={12} /> Fat</span>
                  <input
                    className="retro-input mt-2"
                    type="number"
                    min={0}
                    value={form.fat}
                    onChange={(e) => updateField('fat', e.target.value)}
                    placeholder="0"
                  />
                </label>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="retro-button min-w-[180px]" onClick={submit}>
                  <ClipboardPlus className="mr-2 inline-block" size={14} /> Log meal
                </button>
                <button
                  className="retro-button min-w-[180px] !bg-[rgba(255,255,255,0.08)]"
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
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
      <div className="space-y-3">
        <button className="retro-button w-full !bg-[hsl(var(--mario-blue))]" onClick={() => setOpen(true)}>
          <ClipboardPlus className="mr-2 inline-block" size={14} /> Log meal manually
        </button>
        <p className="text-[10px] leading-5 text-white/60">
          Add takeout, restaurant meals, or anything you already know the macros for.
        </p>
      </div>
      {modal}
    </>
  );
};

export default ManualMealLogPanel;
