import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { Segment } from '../models/Segment';
import { GeminiService } from '../services/gemini.service';
import { VectorSearchService } from '../services/vector.service';
import { logger } from '../utils/logger';

export class QAController {
  private geminiService: GeminiService;
  private vectorSearchService: VectorSearchService;

  constructor() {
    this.geminiService = new GeminiService();
    this.vectorSearchService = new VectorSearchService();
  }

  async askQuestion(req: Request, res: Response) {
    try {
      const { videoId } = req.params;
      const { question, contextLimit = 5 } = req.body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required' });
      }

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const relevantSegments = await this.vectorSearchService.searchSegments(
        videoId, 
        question, 
        parseInt(contextLimit as string)
      );

      if (relevantSegments.length === 0) {
        return res.json({
          videoId,
          question,
          answer: "I couldn't find relevant information in this video to answer your question.",
          confidence: 0,
          sources: []
        });
      }

      const context = this.buildContext(relevantSegments);
      const answer = await this.geminiService.answerQuestion(context, question);
      const sources = this.extractTimestamps(relevantSegments);

      logger.info('Q&A completed', { videoId, question, sourcesCount: sources.length });

      res.json({
        videoId,
        question,
        answer,
        confidence: this.calculateConfidence(relevantSegments),
        sources,
        contextSegments: relevantSegments.length
      });
    } catch (error) {
      logger.error('Q&A error', { videoId: req.params.videoId, error });
      res.status(500).json({ error: 'Failed to process question' });
    }
  }

  async getVideoTranscript(req: Request, res: Response) {
    try {
      const { videoId } = req.params;
      const { format = 'segments', includeTimestamps = true } = req.query;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const segments = await Segment.find({ videoId }).sort({ startSec: 1 });

      let transcript;
      if (format === 'full') {
        transcript = segments.map(s => s.captions.join(' ')).join(' ');
      } else {
        transcript = segments.map(s => ({
          startSec: s.startSec,
          endSec: s.endSec,
          text: s.captions.join(' '),
          ...(includeTimestamps && { 
            timestamp: this.formatTimestamp(s.startSec),
            duration: s.endSec - s.startSec 
          })
        }));
      }

      res.json({
        videoId,
        videoTitle: video.title,
        format,
        totalSegments: segments.length,
        totalDuration: video.durationSec,
        transcript
      });
    } catch (error) {
      logger.error('Get transcript error', { videoId: req.params.videoId, error });
      res.status(500).json({ error: 'Failed to retrieve transcript' });
    }
  }

  private buildContext(segments: any[]): string {
    return segments.map(segment => {
      const timestamp = this.formatTimestamp(segment.startSec);
      const text = segment.captions.join(' ');
      return `[${timestamp}] ${text}`;
    }).join('\n\n');
  }

  private extractTimestamps(segments: any[]): Array<{ timestamp: string, startSec: number, endSec: number, text: string }> {
    return segments.map(segment => ({
      timestamp: `${this.formatTimestamp(segment.startSec)}-${this.formatTimestamp(segment.endSec)}`,
      startSec: segment.startSec,
      endSec: segment.endSec,
      text: segment.captions.join(' ').substring(0, 100) + '...'
    }));
  }

  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private calculateConfidence(segments: any[]): number {
    if (segments.length === 0) return 0;
    const avgConfidence = segments.reduce((sum, seg) => sum + (seg.confidence || 0.5), 0) / segments.length;
    return Math.round(avgConfidence * 100) / 100;
  }
}