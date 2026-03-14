import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController';
import { requireAuth } from '../middleware/auth';
import { orderRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public: place an order
router.post('/', orderRateLimiter, createOrder);

// Admin only
router.get('/', requireAuth, getOrders);
router.patch('/:id/status', requireAuth, updateOrderStatus);

export default router;
