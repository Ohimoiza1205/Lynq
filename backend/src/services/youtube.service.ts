 import axios from 'axios';

export class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY!;
  }

  async searchVideos(query: string, maxResults: number = 10, filters?: any) {
    try {
      const params = {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
        key: this.apiKey,
        ...filters
      };

      const response = await axios.get(`${this.baseUrl}/search`, { params });
      return response.data;
    } catch (error) {
      console.error('YouTube search error:', error);
      throw error;
    }
  }

  async getVideoDetails(videoIds: string[]) {
    try {
      const params = {
        part: 'snippet,contentDetails',
        id: videoIds.join(','),
        key: this.apiKey
      };

      const response = await axios.get(`${this.baseUrl}/videos`, { params });
      return response.data;
    } catch (error) {
      console.error('YouTube video details error:', error);
      throw error;
    }
  }

  async getCaptions(videoId: string) {
    try {
      const params = {
        part: 'snippet',
        videoId,
        key: this.apiKey
      };

      const response = await axios.get(`${this.baseUrl}/captions`, { params });
      return response.data;
    } catch (error) {
      console.error('YouTube captions error:', error);
      return { items: [] };
    }
  }
}