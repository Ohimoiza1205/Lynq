import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireUploader, requireReviewer } from '../middleware/rbac.middleware';
import { validateVideo } from '../middleware/validation.middleware';

const router = Router();
const videoController = new VideoController();

router.post('/', 
  authenticateToken,
  requireUploader,
  validateVideo,
  videoController.createVideo.bind(videoController)
);

router.get('/:id',
  authenticateToken,
  requireReviewer,
  videoController.getVideo.bind(videoController)
);

router.post('/:id/index',
  authenticateToken,
  requireUploader,
  videoController.indexVideo.bind(videoController)
);

router.get('/:id/segments',
  authenticateToken,
  requireReviewer,
  videoController.getVideoSegments.bind(videoController)
);

router.get('/:id/events',
  authenticateToken,
  requireReviewer,
  videoController.getVideoEvents.bind(videoController)
);

export { router as videoRoutes };