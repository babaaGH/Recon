// API routes for managing target logos
import { NextRequest, NextResponse } from 'next/server';
import { getAllLogos, createLogo } from '@/lib/db';

// GET all logos
export async function GET() {
  try {
    const logos = await getAllLogos();
    return NextResponse.json(logos);
  } catch (error) {
    console.error('Error fetching logos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logos' },
      { status: 500 }
    );
  }
}

// POST create new logo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.company_name || body.company_name.trim() === '') {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const logoId = await createLogo({
      company_name: body.company_name,
      industry: body.industry,
      tech_stack: body.tech_stack,
      stalking_status: body.stalking_status || 'Targeting',
      notes: body.notes
    });

    return NextResponse.json(
      { id: logoId, message: 'Logo added to stalker list' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating logo:', error);

    // Handle unique constraint violation
    if (error.message && error.message.includes('UNIQUE')) {
      return NextResponse.json(
        { error: 'This company is already on your stalker list' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create logo' },
      { status: 500 }
    );
  }
}
