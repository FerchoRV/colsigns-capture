import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../prismaClient'; // Asegúrate de importar bien Prisma

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');

    console.log("ID recibido en API:", id);

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const userData = await prisma.users_data.findFirst({
      where: { user_id: BigInt(id) }, // Usa BigInt para comparar
    });

    console.log("Datos obtenidos de la base de datos:", userData);

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ✅ Convertir BigInt a string para evitar errores en JSON
    const formattedUserData = {
      id: userData.id.toString(),
      userId: userData.user_id.toString(),
      firstName: userData.first_name,
      lastName: userData.last_name,
      level: userData.level_id.toString(),
    };

    return NextResponse.json(formattedUserData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
