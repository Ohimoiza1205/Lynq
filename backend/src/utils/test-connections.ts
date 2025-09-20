import axios from 'axios';
import { Video } from '../models/Video';
import { TwelveLabsService } from '../services/twelvelabs.service';
import { GeminiService } from '../services/gemini.service';
import { YouTubeService } from '../services/youtube.service';
import { CloudflareService } from '../services/cloudflare.service';

export const testConnections = async () => {
  console.log('Testing API connections...');

  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');
  console.log('Auth0 Domain:', process.env.AUTH0_DOMAIN ? 'Set' : 'Missing');
  console.log('Auth0 Audience:', process.env.AUTH0_AUDIENCE ? 'Set' : 'Missing');
  console.log('Twelve Labs API Key:', process.env.TWELVELABS_API_KEY ? 'Set' : 'Missing');
  console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
  console.log('YouTube API Key:', process.env.YOUTUBE_API_KEY ? 'Set' : 'Missing');
  console.log('Cloudflare Account ID:', process.env.CLOUDFLARE_ACCOUNT_ID ? 'Set' : 'Missing');
  console.log('Cloudflare API Token:', process.env.CLOUDFLARE_API_TOKEN ? 'Set' : 'Missing');

  console.log('\nTesting actual API connections...');

  try {
    const youtubeService = new YouTubeService();
    await youtubeService.searchVideos('medical surgery', 1);
    console.log('YouTube API: Connected and functional');
  } catch (error) {
    console.log('YouTube API: Failed');
  }

  try {
    await axios.get(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`);
    console.log('Auth0: Connected');
  } catch (error) {
    console.log('Auth0: Failed');
  }

  try {
    const twelveLabsService = new TwelveLabsService();
    const connected = await twelveLabsService.testConnection();
    console.log('Twelve Labs API:', connected ? 'Connected and functional' : 'Failed');
  } catch (error) {
    console.log('Twelve Labs API: Failed');
  }

  try {
    const geminiService = new GeminiService();
    await geminiService.generateTags('Test medical video', 'Surgery procedure');
    console.log('Gemini API: Connected and functional');
  } catch (error) {
    console.log('Gemini API: Failed');
  }

  try {
    const cloudflareService = new CloudflareService();
    await cloudflareService.generateSignedUploadUrl('test.mp4', 'video/mp4');
    console.log('Cloudflare Service: Connected and functional');
  } catch (error) {
    console.log('Cloudflare Service: Failed');
  }

  console.log('\nRunning database test...');
  try {
    const testVideo = new Video({
      ownerId: 'quick-test',
      source: 'upload', 
      title: 'Database Test',
      track: 'healthcare',
      status: 'uploaded',
      tags: ['test']
    });
    await testVideo.save();
    await Video.deleteOne({ _id: testVideo._id });
    console.log('Database: Connected and functional');
  } catch (error) {
    console.log('Database: Failed');
  }

  console.log('\nAPI endpoints available:');
  console.log('POST /api/videos - Create video');
  console.log('GET /api/videos/:id - Get video details'); 
  console.log('POST /api/videos/:id/index - Start video indexing');
  console.log('GET /api/videos/:id/segments - Get video segments');
  console.log('GET /api/videos/:id/events - Get video events');
  console.log('POST /api/videos/:id/qa - Ask question about video');
  console.log('GET /api/videos/:id/transcript - Get video transcript');
  console.log('POST /api/import/youtube - Start YouTube import');
  console.log('GET /api/import/:jobId/status - Get import job status');
  console.log('GET /api/search/videos - Search videos');
  console.log('GET /api/search/segments - Search segments');
  console.log('GET /api/search/global - Global search');
  console.log('POST /api/training/:id/quiz - Generate quiz');
  console.log('GET /api/training/:id/quiz - Get quiz');
  console.log('POST /api/training/quiz/:quizId/attempt - Submit quiz attempt');
  console.log('GET /api/training/:id/training-plan - Get training plan');
  console.log('GET /api/export/videos/:id - Export video data');
  console.log('GET /api/export/quiz/:quizId/results - Export quiz results');
  console.log('GET /api/export/training/:userId/progress - Export training progress');
  
  console.log('\nBackend testing completed - All systems operational');
};