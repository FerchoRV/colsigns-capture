import { NextRequest, NextResponse } from 'next/server';
import { getSignNameById } from '../../../lib/signName.actions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    const signName = await getSignNameById(Number(id));
    return NextResponse.json(signName);
  } catch (error) {
    console.error('Error getting sign name example for ID:', error);
    return NextResponse.json({ error : 'Failed to get sign name example'} , {status: 500});
  }
}