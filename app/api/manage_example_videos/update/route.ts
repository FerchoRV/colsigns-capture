import { NextRequest, NextResponse } from 'next/server';
import { updateSignName } from '../../../lib/signName.actions';

export async function PUT(req: NextRequest) {
    const { id, name, videoExamplePath, typeId } = await req.json();
    try {
        const signName = await updateSignName(id, name, videoExamplePath, typeId);
        return NextResponse.json(signName);
    } catch (error) {
        return NextResponse.error();
    }
    }