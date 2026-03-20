import { Router } from 'express';
import { getSchedule, updateSchedule } from '../controllers/scheduleController';
import { requireAuth } from '../middleware/auth';

const router = Router();

const adminAuth = process.env.NODE_ENV === 'development' ? [] : [requireAuth];

router.get('/', getSchedule);
router.put('/', ...adminAuth, updateSchedule);

export default router;
