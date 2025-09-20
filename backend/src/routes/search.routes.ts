import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireReviewer } from '../middleware/rbac.middleware';

const router = Router();
const searchController = new SearchController();

router.get('/videos',
  authenticateToken,
  requireReviewer,
  searchController.searchVideos.bind(searchController)
);

router.get('/segments',
  authenticateToken,
  requireReviewer,
  searchController.searchSegments.bind(searchController)
);

router.get('/global',
  authenticateToken,
  requireReviewer,
  searchController.globalSearch.bind(searchController)
);

export { router as searchRoutes };