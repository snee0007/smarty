import { NextRequest, NextResponse } from 'next/server';
import { identifyFridgeContents } from '@/ai/flows/identify-fridge-contents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const photoDataUri = body?.photoDataUri;

    if (!photoDataUri || typeof photoDataUri !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid image data.' },
        { status: 400 }
      );
    }

    const result = await identifyFridgeContents({ photoDataUri });

    return NextResponse.json(
      { success: true, data: result.items ?? [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/identify-items failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to identify items.',
      },
      { status: 500 }
    );
  }
}