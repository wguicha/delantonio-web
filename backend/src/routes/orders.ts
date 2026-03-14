import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus, streamOrders } from '../controllers/orderController';
import { requireAuth, requireAuthSSE } from '../middleware/auth';
import { orderRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public: place an order
router.post('/', orderRateLimiter, createOrder);

// Admin only
router.get('/events', requireAuthSSE, streamOrders);
router.get('/', requireAuth, getOrders);
router.patch('/:id/status', requireAuth, updateOrderStatus);

export default router;
