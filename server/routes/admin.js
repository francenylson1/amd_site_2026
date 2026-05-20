import express from 'express';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { requireAuth }  from '../middleware/auth.js';
import { login }        from '../controllers/adminController.js';
import { listContacts } from '../controllers/contactController.js';
import { listVisits }   from '../controllers/visitController.js';

const router = express.Router();

router.post('/login',    loginLimiter, login);
router.get('/contacts',  requireAuth,  listContacts);
router.get('/visits',    requireAuth,  listVisits);

export default router;
