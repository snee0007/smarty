import { useEffect, useState } from 'react';
import { Menu, Save } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserPreferences } from '@/types/app';

interface Props {
  preferences: UserPreferences;
  onSave: (prefs: UserPreferences) => void;
}

const RESTRICTIONS = ['gluten-free', 'dairy-free', 'nut-free', 'low-sugar'];

const PreferencesSheet = ({ preferences, onSave }: Props) => {
  const [draft, setDraft] = useState<UserPreferences>(preferences);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  const toggleRestriction = (value: string) => {
    setDraft((current) => ({
      ...current,
      restrictions: current.restrictions.includes(value)
        ? current.restrictions.filter((entry) => entry !== value)
        : [...current.restrictions, value],
    }));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="retro-button !bg-[hsl(var(--mario-blue))] flex items-center gap-2">
          <Menu size={14} /> Menu
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="border-[hsl(var(--border))] bg-[rgba(8,11,24,0.96)] text-foreground w-[360px] sm:w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="retro-title text-left">Nutrition command center</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2 block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Daily calories</span>
              <input className="retro-input" type="number" value={draft.dailyCalories} onChange={(e) => setDraft({ ...draft, dailyCalories: Number(e.target.value) || 0 })} />
            </label>
            <label className="space-y-2 block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Max cook time</span>
              <input className="retro-input" type="number" value={draft.maxCookTime} onChange={(e) => setDraft({ ...draft, maxCookTime: Number(e.target.value) || 0 })} />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="space-y-2 block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Protein</span>
              <input className="retro-input" type="number" value={draft.proteinTarget} onChange={(e) => setDraft({ ...draft, proteinTarget: Number(e.target.value) || 0 })} />
            </label>
            <label className="space-y-2 block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Carbs</span>
              <input className="retro-input" type="number" value={draft.carbTarget} onChange={(e) => setDraft({ ...draft, carbTarget: Number(e.target.value) || 0 })} />
            </label>
            <label className="space-y-2 block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Fat</span>
              <input className="retro-input" type="number" value={draft.fatTarget} onChange={(e) => setDraft({ ...draft, fatTarget: Number(e.target.value) || 0 })} />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Diet style</span>
            <select className="retro-select" value={draft.dietType} onChange={(e) => setDraft({ ...draft, dietType: e.target.value as UserPreferences['dietType'] })}>
              <option value="anything">Anything</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="high-protein">High protein</option>
              <option value="keto">Keto</option>
              <option value="mediterranean">Mediterranean</option>
            </select>
          </label>

          <label className="space-y-2 block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Goal</span>
            <select className="retro-select" value={draft.goal} onChange={(e) => setDraft({ ...draft, goal: e.target.value as UserPreferences['goal'] })}>
              <option value="maintain">Maintain</option>
              <option value="lose">Lose</option>
              <option value="gain">Gain muscle</option>
            </select>
          </label>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Restrictions</div>
            <div className="grid grid-cols-2 gap-2">
              {RESTRICTIONS.map((restriction) => (
                <button
                  key={restriction}
                  type="button"
                  onClick={() => toggleRestriction(restriction)}
                  className={`border px-3 py-2 text-left text-[10px] uppercase tracking-[0.15em] ${draft.restrictions.includes(restriction) ? 'bg-[hsl(var(--accent))] text-black' : 'bg-white/5'}`}
                >
                  {restriction}
                </button>
              ))}
            </div>
          </div>

          <label className="space-y-2 block">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Disliked ingredients</span>
            <textarea
              className="retro-input min-h-24"
              value={draft.dislikedIngredients.join(', ')}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  dislikedIngredients: e.target.value.split(',').map((v) => v.trim()).filter(Boolean),
                })
              }
              placeholder="mushroom, celery"
            />
          </label>

          <button
            className="retro-button w-full !bg-[hsl(var(--mario-green))] flex items-center justify-center gap-2"
            onClick={() => {
              onSave(draft);
              setOpen(false);
            }}
          >
            <Save size={14} /> Save preferences
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PreferencesSheet;
