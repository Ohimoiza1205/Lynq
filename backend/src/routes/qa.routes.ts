import { Router } from 'express';
import { QAController } from '../controllers/qa.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const qaController = new QAController();

router.post('/:videoId/qa', 
  authenticateToken,
  qaController.askQuestion.bind(qaController)
);

router.get('/:videoId/transcript',
  authenticateToken,
  qaController.getVideoTranscript.bind(qaController)
);

export { router as qaRoutes };