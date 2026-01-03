// API endpoint for SEC EDGAR filings
import { NextRequest, NextResponse } from 'next/server';
import { getSECData } from '@/lib/sec-edgar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.company || body.company.trim() === '') {
      return NextResponse.json(
        { error: 'Company name or ticker is required' },
        { status: 400 }
      );
    }

    // Support forceRefresh parameter to bypass cache
    const forceRefresh = body.forceRefresh === true;
    const secData = await getSECData(body.company, forceRefresh);

    if (!secData) {
      return NextResponse.json(
        { error: 'Company not found in SEC database or no filings available' },
        { status: 404 }
      );
    }

    return NextResponse.json(secData);
  } catch (error) {
    console.error('Error fetching SEC filings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEC filings' },
      { status: 500 }
    );
  }
}
