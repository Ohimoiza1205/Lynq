import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';
import { validateVideo } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireUploader, requireReviewer } from '../middleware/rbac.middleware';

const router = Router();
const videoController = new VideoController();

// Test endpoints - no auth required
router.post('/video',
  validateVideo,
  videoController.createVideo.bind(videoController)
);

router.get('/video/:id',
  videoController.getVideo.bind(videoController)
);

router.get('/search/videos',
  (req, res) => {
    res.json({ 
      message: 'Search endpoint working', 
      query: req.query.query,
      results: [],
      total: 0
    });
  }
);

router.get('/debug-token', 
  authenticateToken,
  (req: any, res: any) => {
    res.json({
      message: 'Token decoded successfully',
      user: req.user,
      userRole: req.user?.role,
      tokenValid: true
    });
  }
);

router.post('/import/youtube',
  (req, res) => {
    res.json({ 
      message: 'YouTube import endpoint working', 
      url: req.body.url,
      jobId: 'test-job-' + Date.now(),
      status: 'queued'
    });
  }
);

// Auth endpoints using real Auth0
router.post('/auth-video',
  authenticateToken,
  requireUploader,
  validateVideo,
  videoController.createVideo.bind(videoController)
);

// Test authenticated endpoints with mocked auth (for testing RBAC)
router.post('/mock-auth-video',
  (req: any, res: any, next: any) => {
    req.user = {
      sub: 'auth0|test-user-123',
      email: 'test@lynq.video',
      role: 'uploader',
      iss: 'https://dev-adjhwqm2ghoh48cl.us.auth0.com/',
      aud: 'https://api.lynq.video'
    };
    next();
  },
  requireUploader,
  validateVideo,
  videoController.createVideo.bind(videoController)
);

router.get('/mock-auth-video/:id',
  (req: any, res: any, next: any) => {
    req.user = {
      sub: 'auth0|test-user-123',
      role: 'reviewer'
    };
    next();
  },
  requireReviewer,
  videoController.getVideo.bind(videoController)
);

router.post('/mock-auth-video/:id/index',
  (req: any, res: any, next: any) => {
    req.user = {
      sub: 'auth0|test-user-123',
      role: 'uploader'
    };
    next();
  },
  requireUploader,
  videoController.indexVideo.bind(videoController)
);

router.get('/mock-auth-video/:id/segments',
  (req: any, res: any, next: any) => {
    req.user = {
      sub: 'auth0|test-user-123',
      role: 'reviewer'
    };
    next();
  },
  requireReviewer,
  videoController.getVideoSegments.bind(videoController)
);

export { router as testRoutes };