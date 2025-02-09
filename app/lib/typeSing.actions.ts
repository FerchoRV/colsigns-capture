'use server';

import prisma from '../../prismaClient';

export async function createLevel(name: string) {
  try {
    const level = await prisma.levels.create({
      data: {
        name,
      },
    });
    return level;
  } catch (error) {
    throw new Error('Database Error: Failed to Create Level.');
  }
}

export async function getLevels() {
  try {
    const levels = await prisma.levels.findMany();
    return levels;
  } catch (error) {
    throw new Error('Database Error: Failed to Fetch Levels.');
  }
}