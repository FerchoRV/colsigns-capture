import { NextRequest, NextResponse } from 'next/server';
import { updateSignName } from '../../../lib/signName.actions';

export async function PUT(req: NextRequest) {
    const { id, name, videoExamplePath, typeId } = await req.json();
    try {
        const signName = await updateSignName(id, name, videoExamplePath, typeId);
        return NextResponse.json(signName);
    } catch (error) {
        console.error('Error updating sign name example:', error);
        return NextResponse.json({ error: 'Failed to update sign name example' }, { status: 500 });
    }
    }