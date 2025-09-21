import { Router } from 'express';
import { ImportController } from '../controllers/import.controller';

const router = Router();
const importController = new ImportController();

router.post('/youtube', importController.createImportJob.bind(importController));
router.get('/:jobId/status', importController.getJobStatus.bind(importController));

export { router as importRoutes };
