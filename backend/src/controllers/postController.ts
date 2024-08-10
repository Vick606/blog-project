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

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: { author: { select: { username: true } } }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
      include: { author: { select: { username: true } }, comments: true }
    });
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching post' });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, published } = req.body;
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        authorId: req.user!.id
      }
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error creating post' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, published } = req.body;
    const post = await prisma.post.update({
      where: { id: Number(req.params.id) },
      data: { title, content, published }
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error updating post' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.post.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting post' });
  }
};