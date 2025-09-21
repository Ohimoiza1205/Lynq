import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { Segment } from '../models/Segment';
import { GeminiService } from '../services/gemini.service';
import { VectorSearchService } from '../services/vector.service';

export class AdvancedQAController {
  private geminiService: GeminiService;
  private vectorSearchService: VectorSearchService;

  constructor() {
    this.geminiService = new GeminiService();
    this.vectorSearchService = new VectorSearchService();
  }

  async askQuestion(req: Request, res: Response) {
    try {
      const { videoId } = req.params;
      const { question } = req.body;

      const segments = await Segment.find({ videoId }).sort({ startSec: 1 });
      const relevantSegments = segments.filter(seg => 
        seg.captions.some(caption => 
          caption.toLowerCase().includes(question.toLowerCase().split(' ')[0])
        )
      ).slice(0, 3);

      const context = relevantSegments.map(seg => 
        `[${Math.floor(seg.startSec/60)}:${String(Math.floor(seg.startSec%60)).padStart(2,'0')}] ${seg.captions.join(' ')}`
      ).join('\n\n');

      const answer = await this.geminiService.answerQuestion(context, question);

      res.json({
        videoId,
        question,
        answer,
        sources: relevantSegments.map(seg => ({
          startTime: seg.startSec,
          endTime: seg.endSec,
          timestamp: `${Math.floor(seg.startSec/60)}:${String(Math.floor(seg.startSec%60)).padStart(2,'0')}`,
          text: seg.captions.join(' ').substring(0, 100) + '...'
        })),
        confidence: 0.85
      });
    } catch (error) {
      res.status(500).json({ error: 'Q&A processing failed' });
    }
  }

  async generateQuiz(req: Request, res: Response) {
    try {
      const { videoId } = req.params;
      const { questionCount = 5 } = req.body;

      const video = await Video.findById(videoId);
      const segments = await Segment.find({ videoId }).limit(10);

      const content = segments.map(s => s.captions.join(' ')).join(' ');
      
      const prompt = `Generate ${questionCount} medical quiz questions based on this content: ${content}. 
      Format as JSON array with: question, options (array), correctAnswer, explanation, timestamp.
      Focus on medical procedures, techniques, and key learning points.`;

      const response = await this.geminiService.generateQuizQuestions(prompt);
      
      const questions = JSON.parse(response);

      res.json({
        videoId,
        questions: questions.map((q: any, idx: number) => ({
          id: `q${idx}`,
          type: 'mcq',
          ...q,
          timestamp: segments[idx % segments.length]?.startSec || 0
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Quiz generation failed' });
    }
  }

  async generateChecklist(req: Request, res: Response) {
    try {
      const { videoId } = req.params;

      const video = await Video.findById(videoId);
      const segments = await Segment.find({ videoId }).sort({ startSec: 1 });

      const items = segments.map((seg, idx) => ({
        id: `item${idx}`,
        title: `Step ${idx + 1}: ${seg.captions[0].substring(0, 50)}...`,
        description: seg.captions.join(' '),
        timestamp: seg.startSec,
        completed: false,
        required: idx < 3 // First 3 steps are required
      }));

      res.json({
        videoId,
        items
      });
    } catch (error) {
      res.status(500).json({ error: 'Checklist generation failed' });
    }
  }
}
