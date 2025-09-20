import { Router } from 'express';
import { QAController } from '../controllers/qa.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireReviewer } from '../middleware/rbac.middleware';

const router = Router();
const qaController = new QAController();

router.post('/:id/qa', 
  authenticateToken,
  requireReviewer,
  qaController.askQuestion.bind(qaController)
);

router.get('/:id/transcript',
  authenticateToken,
  requireReviewer,
  qaController.getVideoTranscript.bind(qaController)
);

export { router as qaRoutes };