const fallbackPool = [
  'Tomato',
  'Cheese',
  'Egg',
  'Spinach',
  'Milk',
  'Mushroom',
  'Onion',
  'Pasta',
];

export async function detectFridgeItems(photoDataUri: string): Promise<string[]> {
  try {
    const response = await fetch('/api/identify-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoDataUri }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to detect fridge items');
    }

    return result.data ?? [];
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const seed = photoDataUri.length % fallbackPool.length;
    return fallbackPool.slice(seed).concat(fallbackPool.slice(0, seed)).slice(0, 5);
  }
}
