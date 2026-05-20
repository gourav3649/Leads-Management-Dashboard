import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { leadRouter } from './lead.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/leads', leadRouter);

export { router };
