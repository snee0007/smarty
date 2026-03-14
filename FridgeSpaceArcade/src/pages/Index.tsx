import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';
import FridgeScene, { MAX_ITEMS } from '@/components/FridgeScene';
import ScanFridgePanel from '@/components/ScanFridgePanel';
import InventoryControlPanel from '@/components/app/InventoryControlPanel';
import NutritionDashboard from '@/components/app/NutritionDashboard';
import PreferencesSheet from '@/components/app/PreferencesSheet';
import MealHistoryPanel from '@/components/app/MealHistoryPanel';
import ManualMealLogPanel from '@/components/app/ManualMealLogPanel';
import CollapsiblePanel from '@/components/app/CollapsiblePanel';
import RecipeCommandDeck from '@/components/app/RecipeCommandDeck';
import { FridgeItem } from '@/types/fridge';
import { getDaysLeft, loadItems, saveItems } from '@/lib/fridgeStore';
import { fileToDataUri } from '@/lib/fileToDataUri';
import { detectFridgeItems } from '@/lib/imageDetectionApi';
import { defaultPreferences, loadPreferences, savePreferences } from '@/lib/preferencesStore';
import { loadMeals, saveMeals } from '@/lib/mealStore';
import { generateAIRecipes } from '@/lib/airecipeenginer';
import { MealLog, RecipeSuggestion, UserPreferences } from '@/types/app';

const SIDEBAR_LEFT_WIDTH = 320;
const SIDEBAR_RIGHT_WIDTH = 360;

const makeId = () => {
  if (globalThis.crypto && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const normalizeDetectedName = (name: string) =>
  name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());

const guessItemType = (name: string): FridgeItem['type'] => {
  const lower = name.toLowerCase();

  if (/(milk|yogurt|cream|butter)/.test(lower)) return 'milk';
  if (/(cheese|egg|chicken|fish|beef|bacon)/.test(lower)) return 'cheese';
  if (/(juice|soda|drink|cola|bottle|water)/.test(lower)) return 'juice';
  return 'other';
};

const visibleSceneItems = (items: FridgeItem[]) => items.slice(0, MAX_ITEMS);

const Index = () => {
  const [items, setItems] = useState<FridgeItem[]>(() => loadItems());
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());
  const [meals, setMeals] = useState<MealLog[]>(() => loadMeals());
  const [doorOpen, setDoorOpen] = useState(false);
  const [shouldOpenDoor, setShouldOpenDoor] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [recipesOpen, setRecipesOpen] = useState(false);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    saveMeals(meals);
  }, [meals]);

  const pantryPulse = useMemo(() => {
    const lowCount = items.length <= 3;
    const highUrgency = items.some((item) => {
      const d = getDaysLeft(item.expiry);
      return d !== null && d <= 2;
    });
    if (highUrgency) return 'Use-it-now mode';
    if (lowCount) return 'Refill friendly';
    return 'Well stocked';
  }, [items]);

  const nextVisibleSlot = useCallback((currentItems: FridgeItem[]) => {
    const visibleCount = currentItems.length;
    return {
      shelfIndex: Math.floor((visibleCount % MAX_ITEMS) / 3),
      slotIndex: visibleCount % 3,
    };
  }, []);

  const handleAdd = useCallback(
    (name: string, expiry: string | null, type: string, quantity = 1) => {
      setItems((prev) => {
        if (!doorOpen) setShouldOpenDoor(true);
        const slot = nextVisibleSlot(prev);
        const newItem: FridgeItem = {
          id: makeId(),
          name,
          expiry: expiry ? new Date(expiry) : null,
          quantity: Math.max(1, quantity),
          type: type as FridgeItem['type'],
          shelfIndex: slot.shelfIndex,
          slotIndex: slot.slotIndex,
        };
        return [...prev, newItem];
      });
    },
    [doorOpen, nextVisibleSlot]
  );

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleUpdateItem = useCallback((id: string, updates: { quantity?: number; expiry?: Date | null }) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: updates.quantity ?? item.quantity,
              expiry: updates.expiry !== undefined ? updates.expiry : item.expiry,
            }
          : item
      )
    );
  }, []);

  const handleDoorState = useCallback((open: boolean) => {
    setDoorOpen(open);
    if (open) setShouldOpenDoor(false);
  }, []);

  const handleDetectedItems = useCallback(
    (detectedNames: string[]) => {
      const cleanedNames = Array.from(new Set(detectedNames.map(normalizeDetectedName).filter(Boolean)));
      if (cleanedNames.length === 0) {
        window.alert('The AI did not detect any items from that photo. Try a clearer image.');
        return;
      }

      setItems((prev) => {
        const nextItems = [...prev];
        let addedCount = 0;
        let skippedCount = 0;

        for (const detectedName of cleanedNames) {
          const duplicateExists = nextItems.some((item) => item.name.toLowerCase() === detectedName.toLowerCase());
          if (duplicateExists) {
            skippedCount += 1;
            continue;
          }

          const slot = nextVisibleSlot(nextItems);
          nextItems.push({
            id: makeId(),
            name: detectedName,
            expiry: null,
            quantity: 1,
            type: guessItemType(detectedName),
            shelfIndex: slot.shelfIndex,
            slotIndex: slot.slotIndex,
          });
          addedCount += 1;
        }

        if (addedCount > 0) {
          if (!doorOpen) setShouldOpenDoor(true);
          window.alert(
            skippedCount > 0
              ? `Added ${addedCount} item(s). Skipped ${skippedCount} duplicate item(s).`
              : `Added ${addedCount} item(s) from the scanned fridge photo.`
          );
          return nextItems;
        }

        window.alert('Nothing new was added from that scan.');
        return prev;
      });
    },
    [doorOpen, nextVisibleSlot]
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

  const runRecipeEngine = useCallback(async () => {
    setRecipesOpen(true);
    setRecipesLoading(true);
    if (!doorOpen) setShouldOpenDoor(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    // setRecipes(generateAIRecipes(items, preferences, meals));
    const aiRecipes = await generateAIRecipes(items, preferences, meals);
  setRecipes(aiRecipes);
    setRecipesLoading(false);
  }, [items, preferences, meals, doorOpen]);

  const handleLogMeal = useCallback((meal: Omit<MealLog, 'id' | 'eatenAt'>) => {
    setMeals((prev) => [
      {
        id: makeId(),
        eatenAt: new Date().toISOString(),
        ...meal,
      },
      ...prev,
    ]);
    window.alert(`${meal.recipeName} logged to today's nutrition dashboard.`);
  }, []);

  const handleCookRecipe = useCallback((recipe: RecipeSuggestion) => {
    const mealType: MealLog['mealType'] = recipe.tags.includes('breakfast')
      ? 'breakfast'
      : recipe.tags.includes('snack')
        ? 'snack'
        : 'dinner';

    handleLogMeal({
      recipeId: recipe.id,
      recipeName: recipe.name,
      mealType,
      nutrition: recipe.nutrition,
    });
    setRecipesOpen(false);
  }, [handleLogMeal]);

  const sceneItems = useMemo(() => visibleSceneItems(items), [items]);
  const overflowCount = Math.max(0, items.length - MAX_ITEMS);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(35,56,120,0.22),_transparent_36%),linear-gradient(180deg,#050816,#0a1022_56%,#04060d)]">
      <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.03)_100%)]" />

      <FridgeScene
        items={sceneItems}
        onRemoveItem={handleRemove}
        onDoorStateChange={handleDoorState}
        doorShouldOpen={shouldOpenDoor}
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-4 xl:ml-[320px] xl:mr-[360px]">
        <div className="pointer-events-auto mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-[rgba(6,10,24,0.76)] px-5 py-4 shadow-[0_0_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[hsl(var(--accent))]">
              <BrainCircuit size={14} /> Smarty kitchen OS
            </div>
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
            <button className="retro-button !py-3 !text-[11px]" onClick={runRecipeEngine}>
              <Sparkles className="mr-2 inline-block" size={14} /> AI recipes
            </button>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-emerald-200">
              {pantryPulse}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/70">
              {items.length} total items
            </div>
            <PreferencesSheet preferences={preferences ?? defaultPreferences} onSave={setPreferences} />
          </div>
        </div>
      </header>

{/* {overflowCount > 0 && (
  <div className="pointer-events-none absolute right-4 top-4 z-20">
    <div className="rounded-full border border-white/10 bg-[rgba(8,12,28,0.68)] px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-white/60 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.25)]">
      {MAX_ITEMS} in fridge · +{overflowCount} in list
    </div>
  </div>
)} */}

      <aside
        className="fixed left-0 top-0 z-30 hidden h-screen w-[320px] flex-col gap-3 overflow-y-auto border-r border-white/10 bg-[rgba(6,10,24,0.6)] py-4 pl-4 pr-2 backdrop-blur-sm xl:flex"
        style={{ width: SIDEBAR_LEFT_WIDTH }}
      >
        <CollapsiblePanel title="SCAN FRIDGE" defaultOpen={true}>
          <ScanFridgePanel isScanning={isScanning} onFileSelect={handleFileScan} />
        </CollapsiblePanel>
        <CollapsiblePanel title="TODAY'S NUTRITION" defaultOpen={true}>
          <NutritionDashboard meals={meals} preferences={preferences} />
        </CollapsiblePanel>
        <CollapsiblePanel title="MEAL LOGGING" defaultOpen={true}>
          <div className="space-y-4">
            <ManualMealLogPanel onLogMeal={handleLogMeal} />
            <div className="border-t border-white/10 pt-4">
              <MealHistoryPanel meals={meals} />
            </div>
          </div>
        </CollapsiblePanel>
      </aside>

      <aside
        className="fixed right-0 top-0 z-30 hidden h-screen w-[360px] flex-col gap-3 overflow-y-auto border-l border-white/10 bg-[rgba(6,10,24,0.6)] py-4 pl-2 pr-4 backdrop-blur-sm xl:flex"
        style={{ width: SIDEBAR_RIGHT_WIDTH }}
      >
        <InventoryControlPanel
          items={items}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onOpenRecipes={runRecipeEngine}
          onUpdateItem={handleUpdateItem}
        />
      </aside>

      <div className="fixed left-4 top-52 z-30 flex flex-col gap-2 xl:hidden">
        <div className="retro-panel w-48 bg-[rgba(14,18,35,0.92)] backdrop-blur-md">
          <div className="retro-title mb-2 text-[8px]">SCAN</div>
          <ScanFridgePanel isScanning={isScanning} onFileSelect={handleFileScan} />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 mx-auto max-w-[900px] px-4 xl:hidden">
        <div className="pointer-events-auto rounded-[24px] border border-white/10 bg-[rgba(6,10,24,0.82)] p-4 backdrop-blur-xl">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">Inventory</div>
              <div className="mt-2 text-lg text-white">{items.length} items</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">Goal</div>
              <div className="mt-2 text-lg text-white capitalize">{preferences.goal}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">Meals today</div>
              <div className="mt-2 text-lg text-white">
                {meals.filter((meal) => meal.eatenAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 border-t border-white/10 pt-3 sm:grid-cols-2">
            <ManualMealLogPanel onLogMeal={handleLogMeal} />
            <button className="retro-button w-full" onClick={runRecipeEngine}>
              <Sparkles className="mr-2 inline-block" size={14} /> Generate AIM recipes
            </button>
          </div>
        </div>
      </div>

      <RecipeCommandDeck
        open={recipesOpen}
        loading={recipesLoading}
        recipes={recipes}
        onGenerate={runRecipeEngine}
        onCook={handleCookRecipe}
        onClose={() => setRecipesOpen(false)}
      />
    </div>
  );
};

export default Index;