import { NextRequest, NextResponse } from 'next/server';
//import { promises as fs } from 'fs';
import {createUserData} from '../../../lib/userData.actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, firstName, lastName, levelId } = body;

    if (!userId || !firstName || !lastName || !levelId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await createUserData(userId, firstName, lastName, levelId);
    return NextResponse.json({ message: 'User data created successfully.' });
  } catch (error) {
    console.error('❌ Error en API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
