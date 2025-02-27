import { NextRequest, NextResponse } from 'next/server';
import { updateUserDataById } from '../../../lib/userData.actions';

export async function PUT(req: NextRequest) {
    const { id, name, email, password, roleId } = await req.json();
    try {
        const userData = await updateUserDataById(id, name, email, roleId);
        return NextResponse.json(userData);
    } catch (error) {
        return NextResponse.error();
    }
    }