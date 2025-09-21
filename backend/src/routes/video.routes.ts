import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireUploader, requireReviewer } from '../middleware/rbac.middleware';
import { validateVideo } from '../middleware/validation.middleware';

const router = Router();
const videoController = new VideoController();

// Get all videos
router.get('/', 
  authenticateToken,
  requireReviewer,
  videoController.getAllVideos.bind(videoController)
);

// Create video
router.post('/', 
  authenticateToken,
  requireUploader,
  validateVideo,
  videoController.createVideo.bind(videoController)
);

// Import from URL
router.post('/import-url',
  authenticateToken,
  requireUploader,
  videoController.uploadFromUrl.bind(videoController)
);

// Get single video
router.get('/:id',
  authenticateToken,
  requireReviewer,
  videoController.getVideo.bind(videoController)
);

// Start indexing
router.post('/:id/index',
  authenticateToken,
  requireUploader,
  videoController.indexVideo.bind(videoController)
);

// Get segments
router.get('/:id/segments',
  authenticateToken,
  requireReviewer,
  videoController.getVideoSegments.bind(videoController)
);

// Get events
router.get('/:id/events',
  authenticateToken,
  requireReviewer,
  videoController.getVideoEvents.bind(videoController)
);

export { router as videoRoutes };