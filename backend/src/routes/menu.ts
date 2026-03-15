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
// In dev, allow without auth for testing
const adminAuth = process.env.NODE_ENV === 'development' ? [] : [requireAuth];
router.get('/admin/categories', ...adminAuth, getAdminCategories);

// Protected routes (admin only)
// In dev, allow without auth for testing
router.post('/items', ...adminAuth, createMenuItem);
router.put('/items/:id', ...adminAuth, updateMenuItem);
router.patch('/items/:id/toggle', ...adminAuth, toggleMenuItem);

export default router;
