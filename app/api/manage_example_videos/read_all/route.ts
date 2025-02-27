import { NextRequest, NextResponse } from 'next/server';
import { getSignNamesAll } from '../../../lib/signName.actions';

export async function GET(req: NextRequest) {
  try {
    const signNames = await getSignNamesAll();
    return NextResponse.json(signNames);
  } catch (error) {
    return NextResponse.error();
  }
}