import { Progress } from '@/components/ui/progress';
import { MealLog, UserPreferences } from '@/types/app';

interface Props {
  meals: MealLog[];
  preferences: UserPreferences;
}

const NutritionDashboard = ({ meals, preferences }: Props) => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaysMeals = meals.filter((meal) => meal.eatenAt.slice(0, 10) === todayKey);
  const totals = todaysMeals.reduce(
    (acc, meal) => {
      acc.calories += meal.nutrition.calories;
      acc.protein += meal.nutrition.protein;
      acc.carbs += meal.nutrition.carbs;
      acc.fat += meal.nutrition.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const rows = [
    { label: 'Calories', value: totals.calories, target: preferences.dailyCalories },
    { label: 'Protein', value: totals.protein, target: preferences.proteinTarget },
    { label: 'Carbs', value: totals.carbs, target: preferences.carbTarget },
    { label: 'Fat', value: totals.fat, target: preferences.fatTarget },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const progress = Math.min(100, Math.round((row.value / Math.max(row.target, 1)) * 100));
        return (
          <div key={row.label}>
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-white/70">
              <span>{row.label}</span>
              <span>{row.value} / {row.target}</span>
            </div>
            <Progress value={progress} className="h-3 bg-white/10" />
          </div>
        );
      })}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[10px] leading-5 text-white/65">
        {todaysMeals.length === 0
          ? 'No meals logged today yet. Generate a recipe and close the loop by logging it.'
          : `${todaysMeals.length} meal${todaysMeals.length === 1 ? '' : 's'} logged today. Smarty is adjusting your macro runway in real time.`}
      </div>
    </div>
  );
};

export default NutritionDashboard;
