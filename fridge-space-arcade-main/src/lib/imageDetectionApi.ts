export async function detectFridgeItems(photoDataUri: string): Promise<string[]> {
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
}