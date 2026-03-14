import type { ReactNode } from 'react';
import { Sparkles, UtensilsCrossed, Timer, Flame, Beef, Wheat, Droplets, ClipboardCheck } from 'lucide-react';
import { RecipeSuggestion } from '@/types/app';

interface Props {
  open: boolean;
  loading: boolean;
  recipes: RecipeSuggestion[];
  onGenerate: () => void;
  onCook: (recipe: RecipeSuggestion) => void;
  onClose: () => void;
}

const MacroChip = ({ icon, value, label }: { icon: ReactNode; value: number; label: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-white/80">
    <div className="mb-1 flex items-center gap-2 text-[11px] text-[hsl(var(--accent))]">{icon}{label}</div>
    <div className="text-lg text-white">{value}</div>
  </div>
);

const RecipeCommandDeck = ({ open, loading, recipes, onGenerate, onCook, onClose }: Props) => {
  if (!open) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-4 pb-8 pt-28">
      <div className="pointer-events-auto w-full max-w-5xl rounded-[32px] border border-[rgba(255,255,255,0.12)] bg-[radial-gradient(circle_at_top,_rgba(245,179,68,0.16),_rgba(7,10,22,0.96)_45%)] p-6 shadow-[0_0_90px_rgba(245,179,68,0.12)] backdrop-blur-xl animate-[recipeRise_500ms_ease] max-h-[75vh] overflow-hidden">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="retro-title">AI recipe command deck</div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              The fridge has shifted into planning mode. Smarty is reading your shelves, matching your dietary profile, and proposing meals with macro estimates.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="retro-button !bg-[hsl(var(--mario-blue))]" onClick={onGenerate}>
              <Sparkles className="mr-2 inline-block" size={14} /> Refresh recipes
            </button>
            <button className="retro-button !bg-[rgba(255,255,255,0.08)]" onClick={onClose}>Back to fridge</button>
          </div>
        </div>

        {loading ? (
          <div className="grid h-[420px] place-items-center rounded-[24px] border border-dashed border-white/15 bg-white/5 text-center">
            <div>
              <Sparkles className="mx-auto mb-4 animate-pulse text-[hsl(var(--accent))]" size={34} />
              <div className="text-xl text-white">Scanning shelf possibilities…</div>
              <div className="mt-3 text-sm text-white/60">Rearranging ingredients into recipe constellations.</div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 overflow-y-auto pr-1 max-h-[56vh] md:grid-cols-2 xl:grid-cols-2">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black">
                        {recipe.matchScore}% match
                      </span>
                      {recipe.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-white/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-white">{recipe.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/70">{recipe.description}</p>
                  </div>
                  <UtensilsCrossed className="text-[hsl(var(--accent))]" />
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.15em] text-white/60">
                  <span className="inline-flex items-center gap-2"><Timer size={13} /> {recipe.cookTime} min</span>
                  <span>{recipe.difficulty}</span>
                  <span>{recipe.ingredientsUsed.length} ingredients ready</span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  <MacroChip icon={<Flame size={12} />} value={recipe.nutrition.calories} label="kcal" />
                  <MacroChip icon={<Beef size={12} />} value={recipe.nutrition.protein} label="protein" />
                  <MacroChip icon={<Wheat size={12} />} value={recipe.nutrition.carbs} label="carbs" />
                  <MacroChip icon={<Droplets size={12} />} value={recipe.nutrition.fat} label="fat" />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                  <div>
                    <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/50">Uses what you have</div>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredientsUsed.map((item) => (
                        <span key={item} className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-emerald-200">{item}</span>
                      ))}
                    </div>
                    {recipe.missingIngredients.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/50">Optional pickup</div>
                        <div className="flex flex-wrap gap-2">
                          {recipe.missingIngredients.map((item) => (
                            <span key={item} className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-amber-200">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/50">Cook mode preview</div>
                    <ol className="space-y-2 text-sm leading-6 text-white/70">
                      {recipe.steps.map((step, index) => (
                        <li key={step} className="flex gap-2"><span className="text-[hsl(var(--accent))]">{index + 1}.</span> {step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <p className="text-sm text-white/60">{recipe.reason}</p>
                  <button className="retro-button !bg-[hsl(var(--mario-green))]" onClick={() => onCook(recipe)}>
                    <ClipboardCheck className="mr-2 inline-block" size={14} /> Cook + log
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes recipeRise { from { opacity: 0; transform: translateY(18px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
    </div>
  );
};

export default RecipeCommandDeck;
