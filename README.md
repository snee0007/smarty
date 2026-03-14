# Smarty

Smarty is a smart-kitchen prototype that combines three ideas in one experience:

- fridge inventory management
- AI-style recipe generation from available ingredients
- daily calorie and macro tracking

## What is implemented in this version

### Fridge inventory
- 3D fridge scene with interactive door
- manual ingredient entry
- photo scan flow with fallback local ingredient detection
- local persistence for fridge items
- expiry-focused inventory panel

### AI recipe mode
- fridge can shift into an **AI Recipe Command Deck**
- recipes are generated from the current fridge contents
- recipe suggestions take into account dietary preferences, disliked ingredients, calorie goals, and cook-time preference
- each recipe shows estimated calories, protein, carbs, fat, cook time, and cooking steps

### Nutrition and meal logging
- left-side nutrition dashboard with progress toward calorie and macro targets
- cook-and-log flow from recipe cards
- recent meal history panel
- local persistence for meal logs

### Preferences menu
- slide-out menu for:
  - daily calorie target
  - protein / carb / fat targets
  - diet style
  - restrictions
  - disliked ingredients
  - cooking time preference
  - goal mode

## Project structure

```text
smarty/
├── ImageAI/
├── fridge-space-arcade-main/
│   ├── src/
│   │   ├── components/
│   │   │   ├── app/
│   │   │   └── ui/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── types/
│   └── package.json
├── .gitignore
└── README.md
```

## Main app to run

The primary implemented product experience in this package is in:

```bash
fridge-space-arcade-main/
```

Run it with:

```bash
cd fridge-space-arcade-main
npm install
npm run dev
```

## Notes

- this version uses **local recipe logic** rather than a live Gemini backend
- preferences, meals, and fridge items are stored in `localStorage`
- the scan flow gracefully falls back to a local mock detector when no backend endpoint is available

## Recommended next upgrade

The best next step is to replace the local recipe engine with a real backend pipeline:

1. inventory + preferences -> API route
2. Gemini structured JSON response
3. Zod validation
4. deterministic nutrition calculation
5. Supabase persistence
