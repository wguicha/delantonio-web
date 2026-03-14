import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createMenuItem,
  updateMenuItem,
  toggleMenuItem,
} from '../controllers/menuController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);

// Protected routes (admin only)
router.post('/items', requireAuth, createMenuItem);
router.put('/items/:id', requireAuth, updateMenuItem);
router.patch('/items/:id/toggle', requireAuth, toggleMenuItem);

export default router;
