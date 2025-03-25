import { NextRequest, NextResponse } from 'next/server';
import { deleteSignName } from '../../../lib/signName.actions';

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  try {
    const signName = await deleteSignName(id);
    return NextResponse.json(signName);
  } catch (error) {
    console.error('Error deleting sign name example:', error);
    return NextResponse.json({ error: 'Failed to delete sign name example' }, { status: 500 });
  }
}