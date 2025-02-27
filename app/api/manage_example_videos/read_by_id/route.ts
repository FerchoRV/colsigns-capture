import { NextRequest, NextResponse } from 'next/server';
import { getSignNameById } from '../../../lib/signName.actions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    const signName = await getSignNameById(Number(id));
    return NextResponse.json(signName);
  } catch (error) {
    return NextResponse.error();
  }
}