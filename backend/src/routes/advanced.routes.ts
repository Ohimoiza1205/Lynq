import { Router } from 'express';
import { AdvancedQAController } from '../controllers/advanced-qa.controller';

const router = Router();
const advancedQAController = new AdvancedQAController();

router.post('/videos/:videoId/qa', advancedQAController.askQuestion.bind(advancedQAController));
router.post('/training/:videoId/quiz', advancedQAController.generateQuiz.bind(advancedQAController));
router.post('/training/:videoId/checklist', advancedQAController.generateChecklist.bind(advancedQAController));

export { router as advancedRoutes };
