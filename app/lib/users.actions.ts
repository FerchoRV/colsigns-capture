'use server';

import prisma from '../../prismaClient';
import bcrypt from 'bcryptjs';

export async function registerUser(email: string, password: string, roleId: number = 2) {
  console.log("Intentando registrar usuario:", email);  // ✅ Verifica si la función se ejecuta

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Contraseña hasheada:", hashedPassword);  // ✅ Confirma el hashing

  try {
    const user = await prisma.users.create({
      data: {
        username: email,
        password: hashedPassword,
        role_id: roleId || 2,
      },
    });

    console.log("Usuario guardado en la BD:", user);  // ✅ Confirma que Prisma funciona
    return {
      ...user,
      id: Number(user.id), 
      role_id: Number(user.role_id),
    }; // 🔥 Convertimos los valores BigInt a Number antes de devolverlos
  } catch (error) {
    console.error("Error en Prisma:", error);  // ✅ Imprime el error en la base de datos
    throw new Error('Database Error: Failed to Register User.');
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { username: email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const userData = {
        id: user.id.toString(),  // ✅ Asegurar que se guarde como string
        username: user.username,
        role_id: user.role_id.toString(),
      };

      // Guardar sesión en localStorage (en vez de sessionStorage)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));  // ✅ Ahora se guarda correctamente
      }

      return userData;
    } else {
      throw new Error('Invalid credentials.');
    }
  } catch (error) {
    throw new Error('Database Error: Failed to Login User.');
  }
}
