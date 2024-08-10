import express from 'express';
import * as postController from '../controllers/postController';
import { authenticateToken, authorizeAuthor } from '../middleware/auth';

const router = express.Router();

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.post('/', authenticateToken, authorizeAuthor, postController.createPost);
router.put('/:id', authenticateToken, authorizeAuthor, postController.updatePost);
router.delete('/:id', authenticateToken, authorizeAuthor, postController.deletePost);

export default router;