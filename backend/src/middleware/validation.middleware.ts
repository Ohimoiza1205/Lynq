import { Request, Response, NextFunction } from 'express';

export const validateImportJob = (req: Request, res: Response, next: NextFunction) => {
  const { queries, tags, maxResults } = req.body;

  if (!queries || !Array.isArray(queries) || queries.length === 0) {
    return res.status(400).json({ error: 'Queries must be a non-empty array' });
  }

  if (!tags || !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Tags must be an array' });
  }

  if (maxResults && (typeof maxResults !== 'number' || maxResults < 1 || maxResults > 100)) {
    return res.status(400).json({ error: 'Max results must be between 1 and 100' });
  }

  next();
};

export const validateVideo = (req: Request, res: Response, next: NextFunction) => {
  const { title, track } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (track && track !== 'healthcare') {
    return res.status(400).json({ error: 'Invalid track' });
  }

  next();
};

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  next();
};