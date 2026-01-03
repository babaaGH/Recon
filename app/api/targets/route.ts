// API endpoint for fetching high-value LinkedIn targets
import { NextRequest, NextResponse } from 'next/server';
import { searchLinkedInTargets } from '@/lib/serper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.company || body.company.trim() === '') {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const targets = await searchLinkedInTargets(body.company);

    return NextResponse.json({ targets });
  } catch (error) {
    console.error('Error fetching LinkedIn targets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch targets' },
      { status: 500 }
    );
  }
}
