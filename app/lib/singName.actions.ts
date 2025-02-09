'use server';

import prisma from '../../prismaClient';

export async function createSignName(name: string, videoExamplePath: string, typeId: number) {
  try {
    const signName = await prisma.sign_name.create({
      data: {
        name,
        video_example_path: videoExamplePath,
        type_id: typeId,
      },
    });
    return signName;
  } catch (error) {
    throw new Error('Database Error: Failed to Create Sign Name.');
  }
}

export async function getSignNames() {
  try {
    const signNames = await prisma.sign_name.findMany({
      include: {
        type_sign: true,
        videos: true,
      },
    });
    return signNames;
  } catch (error) {
    throw new Error('Database Error: Failed to Fetch Sign Names.');
  }
}

export async function updateSignName(id: number, name: string, videoExamplePath: string, typeId: number) {
  try {
    const signName = await prisma.sign_name.update({
      where: { id },
      data: {
        name,
        video_example_path: videoExamplePath,
        type_id: typeId,
      },
    });
    return signName;
  } catch (error) {
    throw new Error('Database Error: Failed to Update Sign Name.');
  }
}

export async function deleteSignName(id: number) {
  try {
    await prisma.sign_name.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error('Database Error: Failed to Delete Sign Name.');
  }
}