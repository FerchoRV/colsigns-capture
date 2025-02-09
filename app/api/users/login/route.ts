import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '../../../lib/users.actions';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    console.log("Datos recibidos en API:", email, password);  // ✅ Agrega esto

    const user = await loginUser(email, password);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error en login:", error);  // ✅ Para verificar errores

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 401 });
    }
  }
}