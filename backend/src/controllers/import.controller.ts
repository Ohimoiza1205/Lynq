import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { ImportJob } from '../models/ImportJob';
import { YouTubeService } from '../services/youtube.service';
import { GeminiService } from '../services/gemini.service';
import { CloudflareService } from '../services/cloudflare.service';
import { logger } from '../utils/logger';

export class ImportController {
  private youtubeService: YouTubeService;
  private geminiService: GeminiService;
  private cloudflareService: CloudflareService;

  constructor() {
    this.youtubeService = new YouTubeService();
    this.geminiService = new GeminiService();
    this.cloudflareService = new CloudflareService();
  }

  async createImportJob(req: Request, res: Response) {
    try {
      const { queries, filters, tags, maxResults = 10 } = req.body;
      const userId = (req as any).user?.sub || 'anonymous';

      if (!queries || !Array.isArray(queries) || queries.length === 0) {
        return res.status(400).json({ error: 'Queries must be a non-empty array' });
      }

      const job = new ImportJob({
        queries,
        filters,
        tags,
        status: 'pending',
        counts: { total: 0, processed: 0, successful: 0, failed: 0 }
      });

      await job.save();

      // Start processing job
      this.processImportJob(job._id.toString(), userId, maxResults);

      logger.info('Import job created', { jobId: job._id, queries, userId });

      res.status(201).json({
        jobId: job._id,
        status: job.status,
        message: 'Import job created and processing started'
      });
    } catch (error) {
      logger.error('Import job creation error', error);
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
        counts: job.counts,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      });
    } catch (error) {
      logger.error('Job status error', error);
      res.status(500).json({ error: 'Failed to get job status' });
    }
  }

  private async processImportJob(jobId: string, userId: string, maxResults: number) {
    try {
      const job = await ImportJob.findById(jobId);
      if (!job) return;

      job.status = 'running';
      await job.save();

      const allVideos = [];

      // Search for videos for each query
      for (const query of job.queries) {
        try {
          const searchResults = await this.youtubeService.searchVideos(query, maxResults, {
            type: 'video',
            videoDuration: 'medium',
            videoDefinition: 'high'
          });

          if (searchResults.items) {
            allVideos.push(...searchResults.items);
          }
        } catch (error) {
          logger.error('YouTube search error', { query, error });
        }
      }

      job.counts.total = allVideos.length;
      await job.save();

      // Process each video
      for (const youtubeVideo of allVideos) {
        try {
          await this.importYouTubeVideo(youtubeVideo, userId, job.tags);
          job.counts.successful++;
          job.counts.processed++;
        } catch (error) {
          logger.error('Video import error', { videoId: youtubeVideo.id.videoId, error });
          job.counts.failed++;
          job.counts.processed++;
        }
        await job.save();
      }

      job.status = 'completed';
      await job.save();

      logger.info('Import job completed', { 
        jobId, 
        total: job.counts.total, 
        successful: job.counts.successful,
        failed: job.counts.failed 
      });

    } catch (error) {
      logger.error('Import job processing error', { jobId, error });
      
      const job = await ImportJob.findById(jobId);
      if (job) {
        job.status = 'failed';
        await job.save();
      }
    }
  }

  private async importYouTubeVideo(youtubeVideo: any, userId: string, tags: string[]) {
    const videoDetails = await this.youtubeService.getVideoDetails([youtubeVideo.id.videoId]);
    const videoInfo = videoDetails.items[0];

    if (!videoInfo) {
      throw new Error('Video details not found');
    }

    // Extract metadata
    const title = videoInfo.snippet.title;
    const description = videoInfo.snippet.description;
    const thumbnailUrl = videoInfo.snippet.thumbnails.high?.url || 
                        videoInfo.snippet.thumbnails.medium?.url ||
                        videoInfo.snippet.thumbnails.default?.url;
    const duration = this.parseDuration(videoInfo.contentDetails.duration);
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideo.id.videoId}`;

    // Create video record
    const video = new Video({
      ownerId: userId,
      source: 'youtube',
      videoId: youtubeVideo.id.videoId,
      title: title.trim(),
      description: description?.trim() || '',
      track: 'healthcare',
      status: 'uploaded',
      durationSec: duration,
      tags: [...tags, 'youtube-import'],
      watchUrl: youtubeUrl
    });

    await video.save();

    // Download and store thumbnail
    if (thumbnailUrl) {
      try {
        const thumbnailPath = await this.downloadAndStoreThumbnail(
          thumbnailUrl, 
          video._id.toString()
        );
        video.watchUrl = thumbnailPath;
        await video.save();
      } catch (error) {
        logger.error('Thumbnail download error', { videoId: video._id, error });
      }
    }

    logger.info('YouTube video imported', { 
      videoId: video._id, 
      youtubeId: youtubeVideo.id.videoId,
      title 
    });

    return video;
  }

  private async downloadAndStoreThumbnail(thumbnailUrl: string, videoId: string): Promise<string> {
    try {
      // Download thumbnail
      const response = await fetch(thumbnailUrl);
      const buffer = await response.arrayBuffer();
      
      // Upload to Cloudflare R2
      const fileName = `thumbnails/${videoId}_thumbnail.jpg`;
      await this.cloudflareService.uploadFile(fileName, Buffer.from(buffer), 'image/jpeg');
      
      return await this.cloudflareService.generateSignedDownloadUrl(fileName);
    } catch (error) {
      logger.error('Thumbnail storage error', { thumbnailUrl, videoId, error });
      return thumbnailUrl; // Fallback to original URL
    }
  }

  private parseDuration(duration: string): number {
    // Parse ISO 8601 duration (PT1H2M3S) to seconds
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }
}