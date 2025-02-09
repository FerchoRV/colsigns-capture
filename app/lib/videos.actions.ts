'use server';

import prisma from '../../prismaClient';

export async function createVideo(userId: number, videoPath: string, levelId: number, signId: number) {
  try {
    const video = await prisma.videos.create({
      data: {
        user_id: userId,
        video_path: videoPath,
        level_id: levelId,
        sign_id: signId,
      },
    });
    return video;
  } catch (error) {
    throw new Error('Database Error: Failed to Create Video.');
  }
}

export async function getVideos() {
  try {
    const videos = await prisma.videos.findMany({
      include: {
        levels: true,
        sign_name: true,
        users: true,
      },
    });
    return videos;
  } catch (error) {
    throw new Error('Database Error: Failed to Fetch Videos.');
  }
}

export async function updateVideo(id: number, userId: number, videoPath: string, levelId: number, signId: number) {
  try {
    const video = await prisma.videos.update({
      where: { id },
      data: {
        user_id: userId,
        video_path: videoPath,
        level_id: levelId,
        sign_id: signId,
      },
    });
    return video;
  } catch (error) {
    throw new Error('Database Error: Failed to Update Video.');
  }
}

export async function deleteVideo(id: number) {
  try {
    await prisma.videos.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error('Database Error: Failed to Delete Video.');
  }
}