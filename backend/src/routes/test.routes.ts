import { Router } from 'express';
import { Video } from '../models/Video';
import { Segment } from '../models/Segment';

const router = Router();

router.post('/create-sample-videos', async (req, res) => {
  try {
    const sampleVideos = [
      {
        title: "Advanced Cardiac Surgery - Mitral Valve Repair",
        description: "Comprehensive surgical procedure demonstrating minimally invasive mitral valve repair techniques",
        youtubeId: "sample1"
      },
      {
        title: "Laparoscopic Appendectomy Procedure", 
        description: "Step-by-step laparoscopic appendectomy with detailed surgical technique demonstration",
        youtubeId: "sample2"
      }
    ];

    const createdVideos = [];
    for (const videoData of sampleVideos) {
      const video = new Video({
        ownerId: 'test-user',
        source: 'youtube',
        videoId: videoData.youtubeId,
        title: videoData.title,
        description: videoData.description,
        track: 'healthcare',
        status: 'ready',
        durationSec: 450,
        tags: ['medical', 'surgery', 'training'],
        watchUrl: `https://www.youtube.com/watch?v=${videoData.youtubeId}`,
        thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
      });

      await video.save();

      const segments = [
        { start: 0, end: 30, text: 'Introduction and patient preparation for the surgical procedure' },
        { start: 30, end: 120, text: 'Initial incision and tissue dissection using laparoscopic techniques' },
        { start: 120, end: 240, text: 'Identification of anatomical landmarks and target structures' },
        { start: 240, end: 360, text: 'Primary surgical intervention and tissue manipulation' },
        { start: 360, end: 450, text: 'Hemostasis and wound closure procedures' }
      ];

      for (const seg of segments) {
        const segment = new Segment({
          videoId: video._id,
          startSec: seg.start,
          endSec: seg.end,
          captions: [seg.text],
          vector: [],
          labels: ['surgical-procedure'],
          confidence: 0.85
        });
        await segment.save();
      }

      createdVideos.push({
        id: video._id,
        title: video.title,
        status: video.status
      });
    }

    res.json({
      success: true,
      message: `Created ${createdVideos.length} sample videos`,
      videos: createdVideos
    });

  } catch (error) {
    console.error('Sample video creation failed:', error);
    res.status(500).json({ error: 'Failed to create sample videos' });
  }
});

export { router as testRoutes };

router.get('/videos', async (req, res) => {
  try {
    const Video = require('../models/Video').Video;
    const videos = await Video.find().sort({ createdAt: -1 }).limit(10);
    res.json(videos.map((video: any) => ({
      id: video._id,
      title: video.title,
      description: video.description,
      status: video.status,
      duration: video.durationSec || 0,
      url: video.watchUrl,
      createdAt: video.createdAt,
      metadata: {
        procedure: video.title.includes('Cardiac') ? 'Cardiac Surgery' : 'Laparoscopic Surgery',
        specialty: video.title.includes('Cardiac') ? 'Cardiothoracic Surgery' : 'General Surgery',
        difficulty: video.title.includes('Advanced') ? 'advanced' : 'intermediate',
        tags: video.tags
      }
    })));
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to get videos' });
  }
});

router.delete('/clear-videos', async (req, res) => {
  try {
    const Video = require('../models/Video').Video;
    const Segment = require('../models/Segment').Segment;
    
    // Delete all test videos and their segments
    await Video.deleteMany({ source: 'youtube', ownerId: 'test-user' });
    await Segment.deleteMany({});
    
    res.json({ success: true, message: 'Test videos cleared' });
  } catch (error) {
    console.error('Clear videos error:', error);
    res.status(500).json({ error: 'Failed to clear videos' });
  }
});
router.delete('/clear-videos', async (req, res) => {
  try {
    const Video = require('../models/Video').Video;
    const Segment = require('../models/Segment').Segment;
    
    await Video.deleteMany({ ownerId: 'test-user' });
    await Segment.deleteMany({});
    
    res.json({ success: true, message: 'Test videos cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear videos' });
  }
});
