import { Router } from 'express';
import { ImportController } from '../controllers/import.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireUploader } from '../middleware/rbac.middleware';

const router = Router();
const importController = new ImportController();

router.post('/youtube', 
  authenticateToken, 
  requireUploader, 
  importController.createImportJob.bind(importController)
);

router.get('/:jobId/status', 
  authenticateToken,
  importController.getJobStatus.bind(importController)
);

export { router as importRoutes };