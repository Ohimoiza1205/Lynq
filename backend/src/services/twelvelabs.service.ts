import axios from 'axios';
import { logger } from '../utils/logger';

interface TwelveLabsIndex {
  _id: string;
  name: string;
  engines: Array<{
    name: string;
    options: string[];
  }>;
  created_at: string;
}

interface TwelveLabsTask {
  _id: string;
  index_id: string;
  status: 'pending' | 'validating' | 'indexing' | 'ready' | 'failed';
  metadata: any;
  created_at: string;
  updated_at: string;
  video_id?: string;
  estimated_time?: string;
}

interface TwelveLabsSearchResult {
  data: Array<{
    video_id: string;
    confidence: number;
    start: number;
    end: number;
    metadata: any;
    modules: Array<{
      type: string;
      confidence: number;
    }>;
  }>;
  page_info: {
    limit_per_page: number;
    total_results: number;
    page_expired_at: string;
    next_page_token?: string;
  };
}

export class TwelveLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.twelvelabs.io/v1.3';
  private defaultIndexId: string;

  constructor() {
    this.apiKey = process.env.TWELVELABS_API_KEY!;
    this.defaultIndexId = process.env.TWELVELABS_INDEX_ID || '';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/indexes`, {
        headers: { 'x-api-key': this.apiKey }
      });
      return response.status === 200;
    } catch (error) {
      logger.error('Twelve Labs connection test failed', error);
      return false;
    }
  }

  async createIndex(name: string, engines: string[] = ['marengo2.6']): Promise<TwelveLabsIndex> {
    try {
      const response = await axios.post(`${this.baseUrl}/indexes`, {
        name,
        engines: engines.map(engine => ({
          name: engine,
          options: ['visual', 'conversation', 'text_in_video', 'logo']
        }))
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      logger.info('Twelve Labs index created', { indexId: response.data._id, name });
      return response.data;
    } catch (error) {
      logger.error('Twelve Labs create index error', error);
      throw new Error('Failed to create Twelve Labs index');
    }
  }

  async uploadVideo(videoUrl: string, metadata: any, indexId?: string): Promise<TwelveLabsTask> {
    try {
      const targetIndexId = indexId || this.defaultIndexId;
      if (!targetIndexId) {
        throw new Error('No index ID provided and no default index configured');
      }

      const response = await axios.post(`${this.baseUrl}/tasks`, {
        index_id: targetIndexId,
        url: videoUrl,
        metadata: {
          filename: metadata.filename || 'video.mp4',
          ...metadata
        }
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      logger.info('Twelve Labs video upload initiated', { 
        taskId: response.data._id, 
        indexId: targetIndexId 
      });
      return response.data;
    } catch (error) {
      logger.error('Twelve Labs upload error', error);
      throw new Error('Failed to upload video to Twelve Labs');
    }
  }

  async getTaskStatus(taskId: string): Promise<TwelveLabsTask> {
    try {
      const response = await axios.get(`${this.baseUrl}/tasks/${taskId}`, {
        headers: { 'x-api-key': this.apiKey }
      });

      return response.data;
    } catch (error) {
      logger.error('Twelve Labs task status error', { taskId, error });
      throw new Error('Failed to get task status from Twelve Labs');
    }
  }

  async searchVideos(query: string, options: any = {}, indexId?: string): Promise<TwelveLabsSearchResult> {
    try {
      const targetIndexId = indexId || this.defaultIndexId;
      
      const response = await axios.post(`${this.baseUrl}/search`, {
        index_id: targetIndexId,
        query,
        options: {
          operator: 'or',
          conversation: true,
          visual: true,
          text_in_video: true,
          threshold: 'medium',
          ...options
        }
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Twelve Labs search error', { query, error });
      throw new Error('Failed to search videos in Twelve Labs');
    }
  }

  async getVideoTranscript(videoId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/videos/${videoId}/transcription`, {
        headers: { 'x-api-key': this.apiKey }
      });

      return response.data;
    } catch (error) {
      logger.error('Twelve Labs transcript error', { videoId, error });
      throw new Error('Failed to get video transcript');
    }
  }

  async getVideoSegments(videoId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/videos/${videoId}/segments`, {
        headers: { 'x-api-key': this.apiKey }
      });

      return response.data;
    } catch (error) {
      logger.error('Twelve Labs segments error', { videoId, error });
      throw new Error('Failed to get video segments');
    }
  }
}