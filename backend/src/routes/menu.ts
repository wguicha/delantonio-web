import { Router } from 'express';
import {
  getAdminCategories,
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

// Admin: returns ALL categories/items including inactive
router.get('/admin/categories', requireAuth, getAdminCategories);

// Protected routes (admin only)
router.post('/items', requireAuth, createMenuItem);
router.put('/items/:id', requireAuth, updateMenuItem);
router.patch('/items/:id/toggle', requireAuth, toggleMenuItem);

export default router;
