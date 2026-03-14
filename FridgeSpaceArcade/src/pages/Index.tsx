import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrainCircuit, ChefHat, Sparkles } from 'lucide-react';
import FridgeScene, { MAX_ITEMS, SHELVES, SLOTS_PER_SHELF } from '@/components/FridgeScene';
import ScanFridgePanel from '@/components/ScanFridgePanel';
import InventoryControlPanel from '@/components/app/InventoryControlPanel';
import NutritionDashboard from '@/components/app/NutritionDashboard';
import PreferencesSheet from '@/components/app/PreferencesSheet';
import MealHistoryPanel from '@/components/app/MealHistoryPanel';
import CollapsiblePanel from '@/components/app/CollapsiblePanel';
import RecipeCommandDeck from '@/components/app/RecipeCommandDeck';
import { FridgeItem } from '@/types/fridge';
import { loadItems, saveItems } from '@/lib/fridgeStore';
import { fileToDataUri } from '@/lib/fileToDataUri';
import { detectFridgeItems } from '@/lib/imageDetectionApi';
import { defaultPreferences, loadPreferences, savePreferences } from '@/lib/preferencesStore';
import { loadMeals, saveMeals } from '@/lib/mealStore';
import { generateRecipes } from '@/lib/recipeEngine';
import { MealLog, RecipeSuggestion, UserPreferences } from '@/types/app';

const SIDEBAR_LEFT_WIDTH = 320;
const SIDEBAR_RIGHT_WIDTH = 360;

const DEFAULT_EXPIRY_DAYS = 7;

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

const getDefaultExpiryDate = () => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + DEFAULT_EXPIRY_DAYS);
  return expiry;
};

const Index = () => {
  const [items, setItems] = useState<FridgeItem[]>(() => loadItems() as FridgeItem[]);
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());
  const [meals, setMeals] = useState<MealLog[]>(() => loadMeals());
  const [doorOpen, setDoorOpen] = useState(false);
  const [shouldOpenDoor, setShouldOpenDoor] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [recipesOpen, setRecipesOpen] = useState(false);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);

  useEffect(() => {
    saveItems(items.map(({ ...rest }) => rest));
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
      const d = Math.ceil((new Date(item.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return d <= 2;
    });
    if (highUrgency) return 'Use-it-now mode';
    if (lowCount) return 'Refill friendly';
    return 'Well stocked';
  }, [items]);

  const findFreeSlot = useCallback(
    (currentItems: FridgeItem[]): { shelfIndex: number; slotIndex: number } | null => {
      for (let shelfIndex = 0; shelfIndex < SHELVES; shelfIndex++) {
        for (let slotIndex = 0; slotIndex < SLOTS_PER_SHELF; slotIndex++) {
          const occupied = currentItems.some(
            (item) => item.shelfIndex === shelfIndex && item.slotIndex === slotIndex
          );
          if (!occupied) return { shelfIndex, slotIndex };
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
        if (!doorOpen) setShouldOpenDoor(true);
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
    if (open) setShouldOpenDoor(false);
  }, []);

  const handleDetectedItems = useCallback(
    (detectedNames: string[]) => {
      const cleanedNames = Array.from(new Set(detectedNames.map(normalizeDetectedName).filter(Boolean)));
      if (cleanedNames.length === 0) {
        window.alert('The AI did not detect any items from that photo. Try a clearer image.');
        return;
      }
      const nextItems = [...items];
      let addedCount = 0;
      let skippedCount = 0;
      for (const detectedName of cleanedNames) {
        const duplicateExists = nextItems.some((item) => item.name.toLowerCase() === detectedName.toLowerCase());
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
        if (!doorOpen) setShouldOpenDoor(true);
        window.alert(
          skippedCount > 0
            ? `Added ${addedCount} item(s). Skipped ${skippedCount} duplicate or overflow item(s).`
            : `Added ${addedCount} item(s) from the scanned fridge photo.`
        );
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

  const runRecipeEngine = useCallback(async () => {
    setRecipesOpen(true);
    setRecipesLoading(true);
    if (!doorOpen) setShouldOpenDoor(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setRecipes(generateRecipes(items, preferences));
    setRecipesLoading(false);
  }, [items, preferences, doorOpen]);

  const handleCookRecipe = useCallback((recipe: RecipeSuggestion) => {
    const mealType: MealLog['mealType'] = recipe.tags.includes('breakfast') ? 'breakfast' : recipe.tags.includes('snack') ? 'snack' : 'dinner';
    setMeals((prev) => [
      {
        id: crypto.randomUUID(),
        recipeId: recipe.id,
        recipeName: recipe.name,
        mealType,
        eatenAt: new Date().toISOString(),
        nutrition: recipe.nutrition,
      },
      ...prev,
    ]);
    window.alert(`${recipe.name} logged to today's nutrition dashboard.`);
    setRecipesOpen(false);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(35,56,120,0.22),_transparent_36%),linear-gradient(180deg,#050816,#0a1022_56%,#04060d)]">
      <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.03)_100%)]" />

      <FridgeScene
        items={items}
        onRemoveItem={handleRemove}
        onDoorStateChange={handleDoorState}
        doorShouldOpen={shouldOpenDoor}
      />

      {/* Center content: header sits between sidebars on xl to prevent overlap */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-4 xl:ml-[320px] xl:mr-[360px]">
        <div className="pointer-events-auto mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-[rgba(6,10,24,0.76)] px-5 py-4 shadow-[0_0_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[hsl(var(--accent))]">
              <BrainCircuit size={14} /> Smarty kitchen OS
            </div>
            {/* <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">AI-powered fridge inventory, recipes, and nutrition in one loop.</h3> */}
            {/* <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
              Scan ingredients, organize shelves, convert the fridge into a command deck for AI meal ideas, and instantly log meals back into today&apos;s macro dashboard.
            </p> */}
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-emerald-200">{pantryPulse}</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/70">{items.length} / {MAX_ITEMS} slots used</div>
            <PreferencesSheet preferences={preferences ?? defaultPreferences} onSave={setPreferences} />
          </div>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-0 top-28 z-10 px-4 xl:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-[720px] flex-wrap gap-3 rounded-[24px] border border-white/10 bg-[rgba(6,10,24,0.85)] px-4 py-4 backdrop-blur-xl">
          <button className="retro-button flex-1 min-w-[180px]" onClick={() => runRecipeEngine()}>
            <Sparkles className="mr-2 inline-block" size={14} /> AI Recipes
          </button>
          <button className="retro-button flex-1 min-w-[180px] !bg-[hsl(var(--mario-blue))]" onClick={() => setRecipesOpen(false)}>
            <ChefHat className="mr-2 inline-block" size={14} /> Inventory Mode
          </button>
        </div>
      </div>

      {/* Left sidebar: collapsible panels, no overlap with header */}
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
        <CollapsiblePanel title="RECENT MEAL LOG" defaultOpen={true}>
          <MealHistoryPanel meals={meals} />
        </CollapsiblePanel>
      </aside>

      {/* Right sidebar: collapsible panels */}
      <aside
        className="fixed right-0 top-0 z-30 hidden h-screen w-[360px] flex-col gap-3 overflow-y-auto border-l border-white/10 bg-[rgba(6,10,24,0.6)] py-4 pl-2 pr-4 backdrop-blur-sm xl:flex"
        style={{ width: SIDEBAR_RIGHT_WIDTH }}
      >
        <InventoryControlPanel items={items} onAdd={handleAdd} onRemove={handleRemove} onOpenRecipes={runRecipeEngine} isFull={items.length >= MAX_ITEMS} />
      </aside>

      {/* Mobile: compact Scan + Add so core actions stay available when sidebars are hidden */}
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
              <div className="mt-2 text-lg text-white">{meals.filter((meal) => meal.eatenAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}</div>
            </div>
          </div>
        </div>
      </div>

      <RecipeCommandDeck open={recipesOpen} loading={recipesLoading} recipes={recipes} onGenerate={runRecipeEngine} onCook={handleCookRecipe} onClose={() => setRecipesOpen(false)} />
    </div>
  );
};

export default Index;
