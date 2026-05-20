import express from 'express';
import { validateContact, validateVisit } from '../middleware/validate.js';
import { createContact }  from '../controllers/contactController.js';
import { createVisit }    from '../controllers/visitController.js';
import { listFlags }      from '../controllers/featureFlagController.js';

const router = express.Router();

router.post('/contact', validateContact, createContact);
router.post('/visits',  validateVisit,   createVisit);
router.get('/feature-flags', listFlags);

export default router;
