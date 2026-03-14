import { MealLog } from '@/types/app';

interface Props {
  meals: MealLog[];
}

const MealHistoryPanel = ({ meals }: Props) => {
  const recent = [...meals].sort((a, b) => b.eatenAt.localeCompare(a.eatenAt)).slice(0, 5);

  return (
    <>
      {recent.length === 0 ? (
        <div className="text-[10px] leading-5 text-white/60">Once you cook from recipe mode, the finished meals show up here.</div>
      ) : (
        <div className="space-y-2">
          {recent.map((meal) => (
            <div key={meal.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white/80">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-white">{meal.recipeName}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/50">{meal.mealType} · {new Date(meal.eatenAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right text-[11px]">
                  <div>{meal.nutrition.calories} kcal</div>
                  <div className="text-white/50">P {meal.nutrition.protein} / C {meal.nutrition.carbs} / F {meal.nutrition.fat}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MealHistoryPanel;
