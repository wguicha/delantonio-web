import { Router } from 'express';
import {
  lookupCustomerByPhone,
  getCustomers,
  requestDataDeletion,
} from '../controllers/customerController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public: phone lookup for autocomplete (returns only name, no sensitive data)
router.get('/lookup', lookupCustomerByPhone);

// Public: GDPR right to erasure
router.post('/deletion-request', requestDataDeletion);

// Admin only
router.get('/', requireAuth, getCustomers);

export default router;
