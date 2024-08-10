import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    isAuthor: boolean;
  };
}

export const getCommentsByPostId = async (req: Request, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: Number(req.params.postId) },
      include: { user: { select: { username: true } } }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { content, postId } = req.body;
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: Number(postId),
        userId: req.user!.id
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error creating comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.comment.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting comment' });
  }
};