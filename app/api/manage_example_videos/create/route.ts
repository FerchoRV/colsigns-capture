import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createSignName } from '../../../lib/signName.actions';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const videoFile = formData.get('videoExamplePath') as File;
  const typeId = formData.get('typeId') as string;

  if (!name || !videoFile || !typeId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const videoBuffer = await videoFile.arrayBuffer();
  const videoDir = path.join(process.cwd(), 'public', 'example-videos');
  const videoPath = path.join(videoDir, `${name}.mp4`);

  try {
    // Crear la carpeta si no existe
    await fs.mkdir(videoDir, { recursive: true });

    // Guardar el archivo de video
    await fs.writeFile(videoPath, Buffer.from(videoBuffer));
    const videoExamplePath = `public/example-videos/${name}.mp4`;

    // Crear el registro en la base de datos
    const signName = await createSignName(name, videoExamplePath, parseInt(typeId));

    // Convertir BigInt a Number antes de devolver la respuesta
    const response = {
      ...signName,
      id: Number(signName.id),
      type_id: Number(signName.type_id),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error saving video:', error);
    return NextResponse.json({ error: 'Failed to save video' }, { status: 500 });
  }
}
