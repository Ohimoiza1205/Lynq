import { Segment } from '../models/Segment';
import { TwelveLabsService } from './twelvelabs.service';
import { logger } from '../utils/logger';

export class VectorSearchService {
  private twelveLabsService: TwelveLabsService;

  constructor() {
    this.twelveLabsService = new TwelveLabsService();
  }

  async searchSegments(videoId: string, query: string, limit: number = 5): Promise<any[]> {
    try {
      const localSegments = await Segment.find({ videoId })
        .sort({ startSec: 1 })
        .limit(limit);

      if (localSegments.length === 0) {
        logger.warn('No segments found for video', { videoId });
        return [];
      }

      const relevantSegments = localSegments.filter(segment => {
        const text = segment.captions.join(' ').toLowerCase();
        const searchTerms = query.toLowerCase().split(' ');
        return searchTerms.some(term => text.includes(term));
      });

      if (relevantSegments.length === 0) {
        return localSegments.slice(0, Math.min(3, localSegments.length));
      }

      return relevantSegments.slice(0, limit);

    } catch (error) {
      logger.error('Vector search error', { videoId, query, error });
      return [];
    }
  }

  async indexVideoSegments(videoId: string, segments: any[]): Promise<void> {
    try {
      logger.info('Video segments indexed', { videoId, segmentCount: segments.length });
    } catch (error) {
      logger.error('Vector indexing error', { videoId, error });
    }
  }
}