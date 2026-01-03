// API routes for individual logo operations
import { NextRequest, NextResponse } from 'next/server';
import { getLogoById, updateLogo, deleteLogo } from '@/lib/db';

// GET single logo by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logoId = parseInt(id);

    if (isNaN(logoId)) {
      return NextResponse.json(
        { error: 'Invalid logo ID' },
        { status: 400 }
      );
    }

    const logo = await getLogoById(logoId);

    if (!logo) {
      return NextResponse.json(
        { error: 'Logo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(logo);
  } catch (error) {
    console.error('Error fetching logo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logo' },
      { status: 500 }
    );
  }
}

// PUT update logo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logoId = parseInt(id);

    if (isNaN(logoId)) {
      return NextResponse.json(
        { error: 'Invalid logo ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const success = await updateLogo(logoId, body);

    if (!success) {
      return NextResponse.json(
        { error: 'Logo not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Logo updated successfully' });
  } catch (error) {
    console.error('Error updating logo:', error);
    return NextResponse.json(
      { error: 'Failed to update logo' },
      { status: 500 }
    );
  }
}

// DELETE logo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logoId = parseInt(id);

    if (isNaN(logoId)) {
      return NextResponse.json(
        { error: 'Invalid logo ID' },
        { status: 400 }
      );
    }

    const success = await deleteLogo(logoId);

    if (!success) {
      return NextResponse.json(
        { error: 'Logo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    return NextResponse.json(
      { error: 'Failed to delete logo' },
      { status: 500 }
    );
  }
}
