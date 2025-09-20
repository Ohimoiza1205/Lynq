 import { Router } from 'express';
import { TrainingController } from '../controllers/training.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireUploader, requireReviewer } from '../middleware/rbac.middleware';

const router = Router();
const trainingController = new TrainingController();

router.post('/:id/quiz',
  authenticateToken,
  requireUploader,
  trainingController.generateQuiz.bind(trainingController)
);

router.get('/:id/quiz',
  authenticateToken,
  requireReviewer,
  trainingController.getQuiz.bind(trainingController)
);

router.post('/quiz/:quizId/attempt',
  authenticateToken,
  requireReviewer,
  trainingController.submitQuizAttempt.bind(trainingController)
);

router.get('/:id/training-plan',
  authenticateToken,
  requireReviewer,
  trainingController.getTrainingPlan.bind(trainingController)
);

export { router as trainingRoutes };