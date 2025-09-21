// backend/src/controllers/medical-import.controller.ts
import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { Segment } from '../models/Segment';
import { YouTubeService } from '../services/youtube.service';
import { TwelveLabsService } from '../services/twelvelabs.service';
import { GeminiService } from '../services/gemini.service';
import { logger } from '../utils/logger';

export class MedicalImportController {
  private youtubeService: YouTubeService;
  private twelveLabsService: TwelveLabsService;
  private geminiService: GeminiService;

  constructor() {
    this.youtubeService = new YouTubeService();
    this.twelveLabsService = new TwelveLabsService();
    this.geminiService = new GeminiService();
  }

  async importMedicalVideos(req: Request, res: Response) {
    try {
      const { 
        queries = [],
        specialties = ['surgery', 'cardiology', 'neurology'],
        maxResults = 10,
        minDuration = 300, // 5 minutes minimum
        maxDuration = 3600 // 1 hour maximum
      } = req.body;
      
      const userId = (req as any).user?.sub || 'anonymous';

      const medicalQueries = this.buildMedicalQueries(specialties, queries);
      const importedVideos = [];

      for (const query of medicalQueries) {
        try {
          logger.info('Searching for medical videos', { query });
          
          const searchResults = await this.youtubeService.searchVideos(query, maxResults, {
            type: 'video',
            videoDuration: 'medium',
            videoDefinition: 'high',
            order: 'relevance'
          });

          if (searchResults.items) {
            for (const youtubeVideo of searchResults.items) {
              try {
                const video = await this.importAndProcessVideo(youtubeVideo, userId, query);
                if (video) {
                  importedVideos.push(video);
                }
              } catch (error) {
                logger.error('Video import failed', { videoId: youtubeVideo.id.videoId, error });
              }
            }
          }
        } catch (error) {
          logger.error('Search query failed', { query, error });
        }
      }

      res.json({
        success: true,
        message: `Imported ${importedVideos.length} medical training videos`,
        videos: importedVideos.map(v => ({
          id: v._id,
          title: v.title,
          specialty: this.inferSpecialty(v.title, v.description || "" || ''),
          status: v.status,
          duration: v.durationSec
        }))
      });

    } catch (error) {
      logger.error('Medical video import failed', error);
      res.status(500).json({ error: 'Medical video import failed' });
    }
  }

  private buildMedicalQueries(specialties: string[], customQueries: string[]): string[] {
    const baseQueries = [
      'medical procedure training',
      'surgical technique demonstration',
      'clinical skills training',
      'medical education video',
      'healthcare training course'
    ];

    const specialtyQueries = specialties.map(specialty => [
      `${specialty} procedure training`,
      `${specialty} surgical technique`,
      `${specialty} clinical training`,
      `${specialty} medical education`
    ]).flat();

    return [...baseQueries, ...specialtyQueries, ...customQueries].slice(0, 20);
  }

  private async importAndProcessVideo(youtubeVideo: any, userId: string, searchQuery: string) {
    const videoDetails = await this.youtubeService.getVideoDetails([youtubeVideo.id.videoId]);
    const videoInfo = videoDetails.items[0];

    if (!videoInfo) return null;

    // Filter for medical content
    if (!this.isMedicalContent(videoInfo.snippet.title, videoInfo.snippet.description)) {
      return null;
    }

    const title = videoInfo.snippet.title;
    const description = videoInfo.snippet.description || '';
    const duration = this.parseDuration(videoInfo.contentDetails.duration);
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideo.id.videoId}`;
    const thumbnailUrl = videoInfo.snippet.thumbnails.high?.url;

    // Skip very short or very long videos
    if (duration < 300 || duration > 3600) {
      return null;
    }

    const specialty = this.inferSpecialty(title, description);
    const difficulty = this.inferDifficulty(title, description);

    const video = new Video({
      ownerId: userId,
      source: 'youtube',
      videoId: youtubeVideo.id.videoId,
      title: title.trim(),
      description: description.trim(),
      track: 'healthcare',
      status: 'uploaded',
      durationSec: duration,
      tags: [specialty, difficulty, 'medical-training', searchQuery.replace(/\s+/g, '-')],
      watchUrl: youtubeUrl,
      thumbnailUrl
    });

    await video.save();

    // Start async processing
    this.processVideoWithAI(video._id.toString(), youtubeUrl);

    logger.info('Medical video imported', { 
      videoId: video._id, 
      title: title.substring(0, 50),
      specialty,
      difficulty,
      duration 
    });

    return video;
  }

  private isMedicalContent(title: string, description: string): boolean {
    const text = `${title} ${description}`.toLowerCase();
    
    const medicalKeywords = [
      'surgery', 'surgical', 'procedure', 'operation',
      'medical', 'clinical', 'healthcare', 'treatment',
      'patient', 'diagnosis', 'therapy', 'medicine',
      'anatomy', 'physiology', 'pathology', 'training',
      'education', 'course', 'tutorial', 'demonstration'
    ];

    const nonMedicalKeywords = [
      'music', 'game', 'entertainment', 'comedy',
      'sports', 'cooking', 'travel', 'vlog'
    ];

    const hasMedical = medicalKeywords.some(keyword => text.includes(keyword));
    const hasNonMedical = nonMedicalKeywords.some(keyword => text.includes(keyword));

    return hasMedical && !hasNonMedical;
  }

  private inferSpecialty(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    const specialties = {
      'cardiothoracic-surgery': ['cardiac', 'heart', 'thoracic', 'cardiovascular'],
      'neurosurgery': ['neuro', 'brain', 'spine', 'neurological'],
      'orthopedic-surgery': ['orthopedic', 'bone', 'joint', 'fracture'],
      'general-surgery': ['laparoscopic', 'appendectomy', 'hernia', 'gallbladder'],
      'emergency-medicine': ['emergency', 'trauma', 'critical', 'resuscitation'],
      'internal-medicine': ['internal', 'diagnosis', 'physical exam'],
      'pediatrics': ['pediatric', 'children', 'infant', 'neonatal']
    };

    for (const [specialty, keywords] of Object.entries(specialties)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return specialty;
      }
    }

    return 'general-medicine';
  }

  private inferDifficulty(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('advanced') || text.includes('complex') || text.includes('expert')) {
      return 'advanced';
    } else if (text.includes('basic') || text.includes('introduction') || text.includes('beginner')) {
      return 'beginner';
    }
    
    return 'intermediate';
  }

  private async processVideoWithAI(videoId: string, youtubeUrl: string) {
    try {
      const video = await Video.findById(videoId);
      if (!video) return;

      video.status = 'indexing';
      await video.save();

      // Send to Twelve Labs for processing
      const task = await this.twelveLabsService.uploadVideo(youtubeUrl, {
        filename: `${video.title}.mp4`,
        title: video.title,
        description: video.description
      });

      video.tlVideoId = task._id;
      await video.save();

      // Poll for completion and extract segments
      this.pollAndProcess(videoId, task._id);

    } catch (error) {
      logger.error('AI processing failed', { videoId, error });
      await Video.findByIdAndUpdate(videoId, { status: 'failed' });
    }
  }

  private async pollAndProcess(videoId: string, taskId: string) {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const task = await this.twelveLabsService.getTaskStatus(taskId);

        if (task.status === 'ready') {
          await this.extractTranscriptAndSegments(videoId, task._id);
          await Video.findByIdAndUpdate(videoId, { status: 'ready' });
          return;
        }

        if (task.status === 'failed' || attempts >= maxAttempts) {
          await Video.findByIdAndUpdate(videoId, { status: 'failed' });
          return;
        }

        if (['pending', 'validating', 'indexing'].includes(task.status)) {
          setTimeout(poll, 30000);
        }

      } catch (error) {
        logger.error('Polling error', { videoId, taskId, error });
        if (attempts < maxAttempts) {
          setTimeout(poll, 30000);
        }
      }
    };

    poll();
  }

  private async extractTranscriptAndSegments(videoId: string, tlVideoId: string) {
    try {
      const transcript = await this.twelveLabsService.getVideoTranscript(tlVideoId);
      
      if (transcript.data) {
        for (const segmentData of transcript.data) {
          const segment = new Segment({
            videoId,
            startSec: segmentData.start,
            endSec: segmentData.end,
            captions: [segmentData.value],
            vector: [], // Will be populated by Atlas Vector Search
            labels: await this.generateSegmentLabels(segmentData.value),
            confidence: segmentData.confidence || 0.8
          });

          await segment.save();
        }
      }

      logger.info('Transcript extracted and segments created', { 
        videoId, 
        segmentCount: transcript.data?.length || 0 
      });

    } catch (error) {
      logger.error('Transcript extraction failed', { videoId, tlVideoId, error });
    }
  }

  private async generateSegmentLabels(text: string): Promise<string[]> {
    try {
      const response = await this.geminiService.generateTags(text, '');
      return response.tags;
    } catch (error) {
      return ['medical-procedure'];
    }
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }
}