import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeadsCsv,
  getLeadStats,
} from '../controllers/lead.controller.js';
import {
  validateCreateLead,
  validateUpdateLead,
} from '../validators/lead.validator.js';

const leadRouter = Router();

leadRouter.use(authMiddleware);

leadRouter.post('/', validateCreateLead, createLead);
leadRouter.get('/', getAllLeads);
leadRouter.get('/export', exportLeadsCsv);
leadRouter.get('/stats', getLeadStats);
leadRouter.get('/:id', getLeadById);
leadRouter.put('/:id', validateUpdateLead, updateLead);
leadRouter.delete('/:id', roleMiddleware(['admin']), deleteLead);

export { leadRouter };
