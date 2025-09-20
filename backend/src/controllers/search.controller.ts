import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { Segment } from '../models/Segment';
import { VectorSearchService } from '../services/vector.service';
import { TwelveLabsService } from '../services/twelvelabs.service';
import { logger } from '../utils/logger';

export class SearchController {
  private vectorSearchService: VectorSearchService;
  private twelveLabsService: TwelveLabsService;

  constructor() {
    this.vectorSearchService = new VectorSearchService();
    this.twelveLabsService = new TwelveLabsService();
  }

  async searchVideos(req: Request, res: Response) {
    try {
      const { 
        query, 
        limit = 10, 
        source, 
        tags, 
        status = 'ready',
        sortBy = 'relevance' 
      } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      let videoFilter: any = { status };
      
      if (source && source !== 'all') {
        videoFilter.source = source;
      }
      
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        videoFilter.tags = { $in: tagArray };
      }

      const searchConditions = {
        ...videoFilter,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      };

      let videos = await Video.find(searchConditions);

      if (sortBy === 'relevance') {
        videos = this.rankVideosByRelevance(videos, query);
      } else if (sortBy === 'date') {
        videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      videos = videos.slice(0, parseInt(limit as string));

      const results = [];
      for (const video of videos) {
        const relevantSegments = await this.vectorSearchService.searchSegments(
          video._id.toString(), 
          query, 
          3
        );

        results.push({
          video: {
            id: video._id,
            title: video.title,
            description: video.description,
            source: video.source,
            status: video.status,
            durationSec: video.durationSec,
            tags: video.tags,
            createdAt: video.createdAt
          },
          relevantSegments: relevantSegments.map(s => ({
            id: s._id,
            startSec: s.startSec,
            endSec: s.endSec,
            captions: s.captions.slice(0, 2),
            confidence: s.confidence
          })),
          matchCount: relevantSegments.length
        });
      }

      logger.info('Video search completed', { 
        query, 
        filters: videoFilter, 
        resultCount: results.length 
      });

      res.json({
        query,
        filters: { source, tags, status, sortBy },
        totalResults: results.length,
        results
      });
    } catch (error) {
      logger.error('Video search error', { query: req.query.query, error });
      res.status(500).json({ error: 'Video search failed' });
    }
  }

  async searchSegments(req: Request, res: Response) {
    try {
      const { 
        query, 
        topK = 10, 
        videoId, 
        minDuration, 
        maxDuration,
        confidenceThreshold = 0.5 
      } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      let searchFilter: any = {
        confidence: { $gte: parseFloat(confidenceThreshold as string) }
      };

      if (videoId) {
        searchFilter.videoId = videoId;
      }

      const segments = await Segment.find({
        ...searchFilter,
        $or: [
          { captions: { $regex: query, $options: 'i' } },
          { labels: { $in: [new RegExp(query, 'i')] } }
        ]
      }).limit(parseInt(topK as string));

      const enhancedResults = await Promise.all(
        segments.map(async (segment) => {
          const video = await Video.findById(segment.videoId);
          return {
            id: segment._id,
            videoId: segment.videoId,
            videoTitle: video?.title || 'Unknown',
            startSec: segment.startSec,
            endSec: segment.endSec,
            duration: segment.endSec - segment.startSec,
            captions: segment.captions,
            labels: segment.labels,
            confidence: segment.confidence
          };
        })
      );

      logger.info('Segment search completed', { 
        query, 
        filters: searchFilter, 
        resultCount: enhancedResults.length 
      });

      res.json({
        query,
        filters: { videoId, minDuration, maxDuration, confidenceThreshold },
        totalResults: enhancedResults.length,
        segments: enhancedResults
      });
    } catch (error) {
      logger.error('Segment search error', { query: req.query.query, error });
      res.status(500).json({ error: 'Segment search failed' });
    }
  }

  async globalSearch(req: Request, res: Response) {
    try {
      const { query, limit = 20 } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const [videoResults, segmentResults] = await Promise.all([
        this.searchVideosInternal(query, Math.floor(parseInt(limit as string) / 2)),
        this.searchSegmentsInternal(query, Math.floor(parseInt(limit as string) / 2))
      ]);

      res.json({
        query,
        totalResults: videoResults.length + segmentResults.length,
        videos: videoResults,
        segments: segmentResults
      });
    } catch (error) {
      logger.error('Global search error', { query: req.query.query, error });
      res.status(500).json({ error: 'Global search failed' });
    }
  }

  private rankVideosByRelevance(videos: any[], query: string): any[] {
    const queryTerms = query.toLowerCase().split(' ');
    
    return videos.map(video => {
      let score = 0;
      const title = video.title.toLowerCase();
      const description = (video.description || '').toLowerCase();
      const tags = video.tags.map((tag: string) => tag.toLowerCase());
      
      queryTerms.forEach(term => {
        if (title.includes(term)) score += 3;
        if (description.includes(term)) score += 2;
        if (tags.some((tag: string) => tag.includes(term))) score += 1;
      });
      
      return { ...video.toObject(), relevanceScore: score };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private async searchVideosInternal(query: string, limit: number) {
    const videos = await Video.find({
      status: 'ready',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }).limit(limit);

    return videos.map(v => ({
      id: v._id,
      title: v.title,
      source: v.source,
      durationSec: v.durationSec,
      tags: v.tags
    }));
  }

  private async searchSegmentsInternal(query: string, limit: number) {
    const segments = await Segment.find({
      $or: [
        { captions: { $regex: query, $options: 'i' } },
        { labels: { $in: [new RegExp(query, 'i')] } }
      ]
    }).limit(limit);

    return segments.map(s => ({
      id: s._id,
      videoId: s.videoId,
      startSec: s.startSec,
      endSec: s.endSec,
      captions: s.captions.slice(0, 1)
    }));
  }
}