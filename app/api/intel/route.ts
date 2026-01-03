// AI Intelligence Search API
import { NextRequest, NextResponse } from 'next/server';
import { searchCompanyIntel } from '@/lib/ai-intel';

// POST - Search for company intelligence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.company_name || body.company_name.trim() === '') {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const intel = await searchCompanyIntel(body.company_name);

    if (!intel) {
      return NextResponse.json(
        { error: 'No intelligence found for this company' },
        { status: 404 }
      );
    }

    return NextResponse.json(intel);
  } catch (error) {
    console.error('Error searching company intel:', error);
    return NextResponse.json(
      { error: 'Failed to search company intelligence' },
      { status: 500 }
    );
  }
}
