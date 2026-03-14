import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Timer, ClipboardCheck, X, ListChecks, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { RecipeSuggestion } from '@/types/app';

interface Props {
  open: boolean;
  loading: boolean;
  recipes: RecipeSuggestion[];
  onGenerate: () => void;
  onCook: (recipe: RecipeSuggestion) => void;
  onClose: () => void;
}

const RecipeCommandDeck = ({ open, loading, recipes, onGenerate, onCook, onClose }: Props) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setSelectedRecipeId(null);
  }, [open]);

  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === selectedRecipeId) ?? null,
    [recipes, selectedRecipeId]
  );

  if (!open) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-4 pb-8 pt-28">
      <div className="pointer-events-auto w-full max-w-5xl rounded-[32px] border border-[rgba(255,255,255,0.12)] bg-[radial-gradient(circle_at_top,_rgba(245,179,68,0.16),_rgba(7,10,22,0.96)_45%)] p-6 shadow-[0_0_90px_rgba(245,179,68,0.12)] backdrop-blur-xl animate-[recipeRise_500ms_ease] max-h-[80vh] overflow-hidden">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="retro-title">AI recipe command deck</div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Suggestions are ranked against your remaining macros so bad fits are pushed down or removed.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="retro-button !bg-[hsl(var(--mario-blue))]" onClick={onGenerate}>
              <Sparkles className="mr-2 inline-block" size={14} /> Refresh recipes
            </button>
            <button className="retro-button !bg-[rgba(255,255,255,0.08)]" onClick={onClose}>
              Back to fridge
            </button>
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
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                        {recipe.image}
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[hsl(var(--accent))] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-black">
                            {recipe.matchScore}% match
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.14em] text-white/50">
                            <Timer size={11} className="mr-1 inline-block" />
                            {recipe.cookTime} min
                          </span>
                        </div>
                        <h3 className="truncate text-lg font-semibold tracking-tight text-white">{recipe.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/65">{recipe.reason}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center">
                      <div className="mb-1 text-[hsl(var(--accent))]"><Flame size={12} className="mx-auto" /></div>
                      <div className="text-sm text-white">{recipe.nutrition.calories}</div>
                      <div className="text-[9px] uppercase tracking-[0.12em] text-white/45">kcal</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center">
                      <div className="mb-1 text-[hsl(var(--accent))]"><Beef size={12} className="mx-auto" /></div>
                      <div className="text-sm text-white">{recipe.nutrition.protein}</div>
                      <div className="text-[9px] uppercase tracking-[0.12em] text-white/45">protein</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center">
                      <div className="mb-1 text-[hsl(var(--accent))]"><Wheat size={12} className="mx-auto" /></div>
                      <div className="text-sm text-white">{recipe.nutrition.carbs}</div>
                      <div className="text-[9px] uppercase tracking-[0.12em] text-white/45">carbs</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center">
                      <div className="mb-1 text-[hsl(var(--accent))]"><Droplets size={12} className="mx-auto" /></div>
                      <div className="text-sm text-white">{recipe.nutrition.fat}</div>
                      <div className="text-[9px] uppercase tracking-[0.12em] text-white/45">fat</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {recipe.ingredientsUsed.slice(0, 4).map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-emerald-200"
                      >
                        {item}
                      </span>
                    ))}
                    {recipe.ingredientsUsed.length > 4 && (
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-white/55">
                        +{recipe.ingredientsUsed.length - 4} more
                      </span>
                    )}
                    {recipe.missingIngredients.length > 0 && (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-amber-200">
                        {recipe.missingIngredients.length} missing
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                    <button className="retro-button !px-4 !py-2 !text-[11px] !bg-[rgba(255,255,255,0.08)]" onClick={() => setSelectedRecipeId(recipe.id)}>
                      <ListChecks className="mr-2 inline-block" size={13} /> View
                    </button>
                    <button className="retro-button !px-4 !py-2 !text-[11px] !bg-[hsl(var(--mario-green))]" onClick={() => onCook(recipe)}>
                      <ClipboardCheck className="mr-2 inline-block" size={13} /> Cook + log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedRecipe && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[rgba(9,14,30,0.98)] p-6 shadow-[0_0_90px_rgba(0,0,0,0.5)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-3xl">
                    {selectedRecipe.image}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{selectedRecipe.name}</h3>
                    <p className="mt-1 text-sm text-white/65">
                      {selectedRecipe.cookTime} min cook · {selectedRecipe.prepTime} min prep
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-white/70">{selectedRecipe.description}</p>
              </div>
              <button className="rounded-full border border-white/10 p-2 text-white/60 hover:text-white" onClick={() => setSelectedRecipeId(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                <div className="mb-1 text-[hsl(var(--accent))]"><Flame size={12} className="mx-auto" /></div>
                <div className="text-lg text-white">{selectedRecipe.nutrition.calories}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/50">kcal</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                <div className="mb-1 text-[hsl(var(--accent))]"><Beef size={12} className="mx-auto" /></div>
                <div className="text-lg text-white">{selectedRecipe.nutrition.protein}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/50">protein</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                <div className="mb-1 text-[hsl(var(--accent))]"><Wheat size={12} className="mx-auto" /></div>
                <div className="text-lg text-white">{selectedRecipe.nutrition.carbs}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/50">carbs</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                <div className="mb-1 text-[hsl(var(--accent))]"><Droplets size={12} className="mx-auto" /></div>
                <div className="text-lg text-white">{selectedRecipe.nutrition.fat}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/50">fat</div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
              <div>
                <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/50">Ingredients</div>
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.ingredientsUsed.map((item) => (
                    <span key={item} className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-emerald-200">
                      {item}
                    </span>
                  ))}
                  {selectedRecipe.missingIngredients.map((item) => (
                    <span key={item} className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-amber-200">
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-white/65">{selectedRecipe.reason}</p>
              </div>

              <div>
                <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/50">Method</div>
                <ol className="space-y-3 text-sm leading-6 text-white/75">
                  {selectedRecipe.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                      <span className="text-[hsl(var(--accent))]">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="retro-button !bg-[hsl(var(--mario-green))]" onClick={() => onCook(selectedRecipe)}>
                <ClipboardCheck className="mr-2 inline-block" size={14} /> Cook + log
              </button>
              <button className="retro-button !bg-[rgba(255,255,255,0.08)]" onClick={() => setSelectedRecipeId(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes recipeRise { from { opacity: 0; transform: translateY(18px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
    </div>
  );
};

export default RecipeCommandDeck;