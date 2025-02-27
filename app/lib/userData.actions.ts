'use server';

import prisma from '../../prismaClient';

export async function createUserData(userId: number, firstName: string, lastName: string, levelId: number) {
  try {
    const userData = await prisma.users_data.create({
      data: {
        user_id: Number(userId),  // 🔥 Asegúrate de que sea número
        first_name: firstName,
        last_name: lastName,
        level_id: Number(levelId),  // 🔥 También levelId
      },
    });
    return userData;
  } catch (error) {
    console.error("❌ Error en Prisma:", error);
    throw new Error('Database Error: Failed to Create User Data.');
  }
}

export async function updateUserDataById(userId: number, firstName: string, lastName: string, levelId: number) {
  try {
    const userData = await prisma.users_data.update({
      where: { id: userId },
      data: {
        first_name: firstName,
        last_name: lastName,
        level_id: levelId,
      },
    });
    return userData;
  } catch (error) {
    throw new Error('Database Error: Failed to Update User Data.');
  }
}

export async function getUserDataById(userId: number) {
  try {
    const userData = await prisma.users_data.findUnique({
      where: { id: userId },
    });
    return userData;
  } catch (error) {
    throw new Error('Database Error: Failed to Get User Data.');
  }
}