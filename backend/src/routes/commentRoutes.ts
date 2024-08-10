import express from 'express';
import * as commentController from '../controllers/commentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/post/:postId', commentController.getCommentsByPostId);
router.post('/', authenticateToken, commentController.createComment);
router.delete('/:id', authenticateToken, commentController.deleteComment);

export default router;