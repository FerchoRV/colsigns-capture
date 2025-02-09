import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '../../../lib/users.actions';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    console.log("Datos recibidos en API:", email, password);  // ✅ Verifica los datos recibidos

    if (!email || !password) {
      return NextResponse.json({ error: "Email y password requeridos" }, { status: 400 });
    }

    const user = await registerUser(email, password);
    console.log("Usuario registrado:", user);  // ✅ Confirma si Prisma está funcionando

    // 🔥 Convertimos los valores BigInt a Number antes de responder
    const userResponse = {
      ...user,
      id: Number(user.id), 
      role_id: Number(user.role_id),
    };

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error("Error en el servidor:", error);  // ✅ Muestra el error en la terminal
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
