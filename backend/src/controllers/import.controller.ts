import { Request, Response } from 'express';
import { ImportJob } from '../models/ImportJob';
import { YouTubeService } from '../services/youtube.service';
import { GeminiService } from '../services/gemini.service';

export class ImportController {
  private youtubeService: YouTubeService;
  private geminiService: GeminiService;

  constructor() {
    this.youtubeService = new YouTubeService();
    this.geminiService = new GeminiService();
  }

  async createImportJob(req: Request, res: Response) {
    try {
      const { queries, filters, tags, maxResults = 50 } = req.body;

      if (!queries || !Array.isArray(queries)) {
        return res.status(400).json({ error: 'Queries must be an array' });
      }

      const job = new ImportJob({
        queries,
        filters,
        tags,
        status: 'pending'
      });

      await job.save();

      res.status(201).json({
        jobId: job._id,
        status: job.status,
        message: 'Import job created'
      });
    } catch (error) {
      console.error('Import job creation error:', error);
      res.status(500).json({ error: 'Failed to create import job' });
    }
  }

  async getJobStatus(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const job = await ImportJob.findById(jobId);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({
        jobId: job._id,
        status: job.status,
        counts: job.counts
      });
    } catch (error) {
      console.error('Job status error:', error);
      res.status(500).json({ error: 'Failed to get job status' });
    }
  }
}