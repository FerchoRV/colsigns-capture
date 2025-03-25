import { NextRequest, NextResponse } from 'next/server';
import { updateUserDataById } from '../../../lib/userData.actions';

export async function PUT(req: NextRequest) {
    const { id, name, email, roleId } = await req.json();
    try {
        const userData = await updateUserDataById(id, name, email, roleId);
        return NextResponse.json(userData);
    } catch (error) {
        console.error('Error actualizando los datos del usuario:', error); // Usa la variable error
        return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
    }
}