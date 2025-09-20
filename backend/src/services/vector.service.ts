 import { Segment } from '../models/Segment';
import { logger } from '../utils/logger';

export class VectorSearchService {
  async searchSegments(videoId: string, query: string, topK: number = 10): Promise<any[]> {
    try {
      const segments = await Segment.find({ videoId });
      
      const scoredSegments = segments.map(segment => {
        const text = segment.captions.join(' ').toLowerCase();
        const queryTerms = query.toLowerCase().split(' ');
        
        let score = 0;
        queryTerms.forEach(term => {
          if (text.includes(term)) {
            score += 1;
          }
        });
        
        return {
          segment,
          score,
          relevance: score / queryTerms.length
        };
      });

      const results = scoredSegments
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(item => item.segment);

      logger.info('Vector search completed', { videoId, query, resultCount: results.length });
      return results;
    } catch (error) {
      logger.error('Vector search error', { videoId, query, error });
      return [];
    }
  }

  async semanticSearch(indexId: string, query: string, options: any = {}): Promise<any[]> {
    try {
      const segments = await Segment.find({});
      
      const searchResults = segments.filter(segment => {
        const text = segment.captions.join(' ').toLowerCase();
        const searchTerms = query.toLowerCase().split(' ');
        return searchTerms.some(term => text.includes(term));
      });

      return searchResults.slice(0, options.limit || 10);
    } catch (error) {
      logger.error('Semantic search error', { query, error });
      return [];
    }
  }
}