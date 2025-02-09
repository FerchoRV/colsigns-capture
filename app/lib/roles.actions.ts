'use server';

import prisma from '../../prismaClient';

export async function createRole(name: string) {
  try {
    const role = await prisma.roles.create({
      data: {
        name,
      },
    });
    return role;
  } catch (error) {
    throw new Error('Database Error: Failed to Create Role.');
  }
}

export async function getRoles() {
  try {
    const roles = await prisma.roles.findMany();
    return roles;
  } catch (error) {
    throw new Error('Database Error: Failed to Fetch Roles.');
  }
}