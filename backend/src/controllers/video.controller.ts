import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { Segment } from '../models/Segment';
import { Event } from '../models/Event';
import { CloudflareService } from '../services/cloudflare.service';
import { TwelveLabsService } from '../services/twelvelabs.service';
import { GeminiService } from '../services/gemini.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

export class VideoController {
  private cloudflareService: CloudflareService;
  private twelveLabsService: TwelveLabsService;
  private geminiService: GeminiService;

  constructor() {
    this.cloudflareService = new CloudflareService();
    this.twelveLabsService = new TwelveLabsService();
    this.geminiService = new GeminiService();
  }

  async createVideo(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, track = 'healthcare', source = 'upload' } = req.body;
      const userId = req.user?.sub || 'anonymous';

      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Video title is required' });
      }

      const video = new Video({
        ownerId: userId,
        source,
        title: title.trim(),
        description: description?.trim() || '',
        track,
        status: 'uploaded',
        tags: []
      });

      await video.save();

      const fileName = `videos/${video._id}.mp4`;
      const uploadUrl = await this.cloudflareService.generateSignedUploadUrl(fileName, 'video/mp4');

      logger.info('Video created', { videoId: video._id, title: video.title, userId });

      res.status(201).json({
        videoId: video._id,
        uploadUrl,
        status: video.status,
        title: video.title,
        track: video.track
      });
    } catch (error) {
      logger.error('Video creation error', error);
      res.status(500).json({ error: 'Failed to create video record' });
    }
  }

  async getVideo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const video = await Video.findById(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const segments = await Segment.find({ videoId: id }).sort({ startSec: 1 });
      const events = await Event.find({ videoId: id }).sort({ startSec: 1 });

      res.json({
        id: video._id,
        title: video.title,
        description: video.description,
        source: video.source,
        status: video.status,
        durationSec: video.durationSec,
        tags: video.tags,
        watchUrl: video.watchUrl,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        segments: segments.map(s => ({
          id: s._id,
          startSec: s.startSec,
          endSec: s.endSec,
          captions: s.captions,
          labels: s.labels,
          confidence: s.confidence
        })),
        events: events.map(e => ({
          id: e._id,
          type: e.type,
          startSec: e.startSec,
          endSec: e.endSec,
          score: e.score,
          notes: e.notes
        }))
      });
    } catch (error) {
      logger.error('Get video error', { videoId: req.params.id, error });
      res.status(500).json({ error: 'Failed to retrieve video' });
    }
  }

  async indexVideo(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const video = await Video.findById(id);

      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      if (video.status === 'indexing') {
        return res.status(400).json({ error: 'Video is already being indexed' });
      }

      if (video.status === 'ready') {
        return res.status(400).json({ error: 'Video is already indexed' });
      }

      video.status = 'indexing';
      await video.save();

      this.processVideoIndexing(video._id.toString());

      logger.info('Video indexing started', { videoId: video._id, title: video.title });

      res.json({
        videoId: video._id,
        status: video.status,
        message: 'Video indexing process initiated'
      });
    } catch (error) {
      logger.error('Video indexing initiation error', { videoId: req.params.id, error });
      res.status(500).json({ error: 'Failed to start video indexing' });
    }
  }

  async getVideoSegments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { query, topK = 10 } = req.query;

      let segments;
      
      if (query && typeof query === 'string') {
        segments = await this.searchSegments(id, query, parseInt(topK as string));
      } else {
        segments = await Segment.find({ videoId: id })
          .sort({ startSec: 1 })
          .limit(parseInt(topK as string));
      }

      res.json({
        videoId: id,
        segments: segments.map(s => ({
          id: s._id,
          startSec: s.startSec,
          endSec: s.endSec,
          captions: s.captions,
          labels: s.labels,
          confidence: s.confidence
        }))
      });
    } catch (error) {
      logger.error('Get video segments error', { videoId: req.params.id, error });
      res.status(500).json({ error: 'Failed to retrieve video segments' });
    }
  }

  async getVideoEvents(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { type } = req.query;

      let query: any = { videoId: id };
      if (type) {
        query.type = type;
      }

      const events = await Event.find(query).sort({ startSec: 1 });

      res.json({
        videoId: id,
        events: events.map(e => ({
          id: e._id,
          type: e.type,
          startSec: e.startSec,
          endSec: e.endSec,
          score: e.score,
          notes: e.notes
        }))
      });
    } catch (error) {
      logger.error('Get video events error', { videoId: req.params.id, error });
      res.status(500).json({ error: 'Failed to retrieve video events' });
    }
  }

  private async searchSegments(videoId: string, query: string, topK: number) {
    try {
      const video = await Video.findById(videoId);
      if (!video || !video.tlVideoId) {
        return await Segment.find({ videoId }).sort({ startSec: 1 }).limit(topK);
      }

      const searchResults = await this.twelveLabsService.searchVideos(query, { 
        threshold: 'medium',
        sort_option: 'score'
      });

      const matchingSegments = [];
      for (const result of searchResults.data.slice(0, topK)) {
        const segment = await Segment.findOne({
          videoId,
          startSec: { $lte: result.start },
          endSec: { $gte: result.end }
        });
        
        if (segment) {
          matchingSegments.push({
            ...segment.toObject(),
            searchScore: result.confidence
          });
        }
      }

      return matchingSegments;
    } catch (error) {
      logger.error('Segment search error', { videoId, query, error });
      return await Segment.find({ videoId }).sort({ startSec: 1 }).limit(topK);
    }
  }

  private async processVideoIndexing(videoId: string) {
    try {
      const video = await Video.findById(videoId);
      if (!video) {
        logger.error('Video not found during indexing', { videoId });
        return;
      }

      logger.info('Starting comprehensive video processing', { videoId, title: video.title });

      const fileName = `videos/${videoId}.mp4`;
      const videoUrl = await this.cloudflareService.generateSignedDownloadUrl(fileName);

      const task = await this.twelveLabsService.uploadVideo(videoUrl, {
        filename: `${video.title}.mp4`,
        title: video.title,
        description: video.description,
        track: video.track
      });

      video.tlVideoId = task._id;
      await video.save();

      logger.info('Video uploaded to Twelve Labs', { videoId, taskId: task._id });

      this.pollTaskStatus(videoId, task._id);

    } catch (error) {
      logger.error('Video processing failed', { videoId, error });
      await this.markVideoAsFailed(videoId, 'Processing initialization failed');
    }
  }

  private async pollTaskStatus(videoId: string, taskId: string) {
    const maxAttempts = 60;
    const pollInterval = 30000;
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const task = await this.twelveLabsService.getTaskStatus(taskId);
        
        logger.debug('Task status check', { videoId, taskId, status: task.status, attempt: attempts });

        if (task.status === 'ready') {
          await this.finalizeVideoProcessing(videoId, task);
          return;
        }

        if (task.status === 'failed') {
          await this.markVideoAsFailed(videoId, 'Twelve Labs processing failed');
          return;
        }

        if (attempts >= maxAttempts) {
          await this.markVideoAsFailed(videoId, 'Processing timeout exceeded');
          return;
        }

        if (['pending', 'validating', 'indexing'].includes(task.status)) {
          setTimeout(poll, pollInterval);
        }

      } catch (error) {
        logger.error('Task polling error', { videoId, taskId, attempts, error });
        
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          await this.markVideoAsFailed(videoId, 'Task polling failed repeatedly');
        }
      }
    };

    poll();
  }

  private async finalizeVideoProcessing(videoId: string, task: any) {
    try {
      const video = await Video.findById(videoId);
      if (!video) return;

      logger.info('Finalizing video processing', { videoId, tlVideoId: task.video_id });

      await this.extractSegmentsAndTranscript(videoId, task.video_id);
      await this.detectEvents(videoId);
      await this.generateVideoTags(videoId);

      video.status = 'ready';
      await video.save();

      logger.info('Video processing completed successfully', { videoId, title: video.title });

    } catch (error) {
      logger.error('Video finalization error', { videoId, error });
      await this.markVideoAsFailed(videoId, 'Finalization failed');
    }
  }

  private async extractSegmentsAndTranscript(videoId: string, tlVideoId: string) {
    try {
      const transcript = await this.twelveLabsService.getVideoTranscript(tlVideoId);
      const segments = await this.twelveLabsService.getVideoSegments(tlVideoId);

      for (const segmentData of transcript.data || []) {
        const segment = new Segment({
          videoId,
          startSec: segmentData.start,
          endSec: segmentData.end,
          captions: [segmentData.value],
          vector: [],
          labels: [],
          confidence: segmentData.confidence || 0.8
        });

        await segment.save();
      }

      logger.info('Segments extracted', { videoId, segmentCount: transcript.data?.length || 0 });

    } catch (error) {
      logger.error('Segment extraction error', { videoId, tlVideoId, error });
    }
  }

  private async detectEvents(videoId: string) {
    try {
      const segments = await Segment.find({ videoId }).sort({ startSec: 1 });
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        if (this.detectPhaseChange(segment, segments[i - 1])) {
          const event = new Event({
            videoId,
            type: 'phase',
            startSec: segment.startSec,
            endSec: segment.endSec,
            score: 0.8,
            notes: 'Procedure phase detected'
          });
          await event.save();
        }

        if (this.detectAnomaly(segment)) {
          const event = new Event({
            videoId,
            type: 'anomaly',
            startSec: segment.startSec,
            endSec: segment.endSec,
            score: 0.7,
            notes: 'Potential anomaly detected'
          });
          await event.save();
        }
      }

      logger.info('Event detection completed', { videoId });

    } catch (error) {
      logger.error('Event detection error', { videoId, error });
    }
  }

  private detectPhaseChange(current: any, previous: any): boolean {
    if (!previous) return true;
    
    const keywords = ['incision', 'suture', 'dissection', 'closure', 'preparation'];
    const currentText = current.captions.join(' ').toLowerCase();
    const previousText = previous.captions.join(' ').toLowerCase();
    
    for (const keyword of keywords) {
      if (currentText.includes(keyword) && !previousText.includes(keyword)) {
        return true;
      }
    }
    
    return false;
  }

  private detectAnomaly(segment: any): boolean {
    const anomalyKeywords = ['error', 'mistake', 'problem', 'bleeding', 'complication'];
    const text = segment.captions.join(' ').toLowerCase();
    
    return anomalyKeywords.some(keyword => text.includes(keyword));
  }

  private async generateVideoTags(videoId: string) {
    try {
      const video = await Video.findById(videoId);
      const segments = await Segment.find({ videoId }).limit(5);
      
      if (!video || segments.length === 0) return;

      const context = segments.map(s => s.captions.join(' ')).join(' ');
      const { tags } = await this.geminiService.generateTags(video.title, context);
      
      video.tags = [...new Set([...video.tags, ...tags])];
      await video.save();

      logger.info('Video tags generated', { videoId, tags });

    } catch (error) {
      logger.error('Tag generation error', { videoId, error });
    }
  }

  private async markVideoAsFailed(videoId: string, reason: string) {
    try {
      const video = await Video.findById(videoId);
      if (video) {
        video.status = 'failed';
        await video.save();
        logger.error('Video marked as failed', { videoId, reason });
      }
    } catch (error) {
      logger.error('Failed to mark video as failed', { videoId, error });
    }
  }
}