 import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireReviewer, requireAdmin } from '../middleware/rbac.middleware';

const router = Router();
const exportController = new ExportController();

router.get('/videos/:id',
  authenticateToken,
  requireReviewer,
  exportController.exportVideo.bind(exportController)
);

router.get('/quiz/:quizId/results',
  authenticateToken,
  requireReviewer,
  exportController.exportQuizResults.bind(exportController)
);

router.get('/training/:userId/progress',
  authenticateToken,
  requireAdmin,
  exportController.exportTrainingProgress.bind(exportController)
);

export { router as exportRoutes };