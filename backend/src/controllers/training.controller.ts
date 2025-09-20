 import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { Quiz } from '../models/Quiz';
import { Segment } from '../models/Segment';
import { Event } from '../models/Event';
import { GeminiService } from '../services/gemini.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

interface QuizAttempt {
  quizId: string;
  userId: string;
  responses: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timestamp?: number;
  }>;
  score: number;
  completedAt: Date;
}

export class TrainingController {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  async generateQuiz(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { questionCount = 8, difficulty = 'medium', focusAreas } = req.body;

      const video = await Video.findById(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const existingQuiz = await Quiz.findOne({ videoId: id });
      if (existingQuiz) {
        return res.json({
          quizId: existingQuiz._id,
          message: 'Quiz already exists for this video',
          quiz: this.formatQuizResponse(existingQuiz)
        });
      }

      const segments = await Segment.find({ videoId: id }).sort({ startSec: 1 });
      const events = await Event.find({ videoId: id }).sort({ startSec: 1 });

      if (segments.length === 0) {
        return res.status(400).json({ error: 'Video must be indexed before generating quiz' });
      }

      const quizContent = await this.generateQuizContent(
        video, 
        segments, 
        events, 
        questionCount, 
        difficulty,
        focusAreas
      );

      const quiz = new Quiz({
        videoId: id,
        items: quizContent,
        generatedAt: new Date()
      });

      await quiz.save();

      logger.info('Quiz generated', { videoId: id, questionCount: quizContent.length });

      res.status(201).json({
        quizId: quiz._id,
        quiz: this.formatQuizResponse(quiz)
      });
    } catch (error) {
      logger.error('Quiz generation error', { videoId: req.params.id, error });
      res.status(500).json({ error: 'Failed to generate quiz' });
    }
  }

  async getQuiz(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const quiz = await Quiz.findOne({ videoId: id });
      if (!quiz) {
        return res.status(404).json({ error: 'No quiz found for this video' });
      }

      const video = await Video.findById(id);

      res.json({
        quizId: quiz._id,
        videoId: id,
        videoTitle: video?.title || 'Unknown',
        quiz: this.formatQuizResponse(quiz)
      });
    } catch (error) {
      logger.error('Get quiz error', { videoId: req.params.id, error });
      res.status(500).json({ error: 'Failed to retrieve quiz' });
    }
  }

  async submitQuizAttempt(req: AuthenticatedRequest, res: Response) {
    try {
      const { quizId } = req.params;
      const { responses } = req.body;
      const userId = req.user?.sub || 'anonymous';

      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      const gradedResponses = this.gradeQuizResponses(quiz.items, responses);
      const score = this.calculateScore(gradedResponses);

      const attempt: QuizAttempt = {
        quizId,
        userId,
        responses: gradedResponses,
        score,
        completedAt: new Date()
      };

      const reviewLinks = this.generateReviewLinks(gradedResponses, quiz.items);

      logger.info('Quiz attempt submitted', { quizId, userId, score });

      res.json({
        attemptId: `attempt_${Date.now()}`,
        score,
        totalQuestions: quiz.items.length,
        correctAnswers: gradedResponses.filter(r => r.isCorrect).length,
        responses: gradedResponses,
        reviewLinks,
        feedback: this.generateFeedback(score, quiz.items.length)
      });
    } catch (error) {
      logger.error('Quiz submission error', { quizId: req.params.quizId, error });
      res.status(500).json({ error: 'Failed to submit quiz attempt' });
    }
  }

  async getTrainingPlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { durationMinutes = 30, focusAreas, difficulty = 'medium' } = req.query;

      const video = await Video.findById(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const segments = await Segment.find({ videoId: id }).sort({ startSec: 1 });
      const events = await Event.find({ videoId: id }).sort({ startSec: 1 });

      const trainingPlan = await this.generateTrainingPlan(
        video,
        segments,
        events,
        parseInt(durationMinutes as string),
        focusAreas as string[],
        difficulty as string
      );

      res.json({
        videoId: id,
        videoTitle: video.title,
        estimatedDuration: durationMinutes,
        plan: trainingPlan
      });
    } catch (error) {
      logger.error('Training plan error', { videoId: req.params.id, error });
      res.status(500).json({ error: 'Failed to generate training plan' });
    }
  }

  private async generateQuizContent(
    video: any, 
    segments: any[], 
    events: any[], 
    questionCount: number,
    difficulty: string,
    focusAreas?: string[]
  ) {
    const context = segments.slice(0, 10).map(s => 
      `[${this.formatTimestamp(s.startSec)}] ${s.captions.join(' ')}`
    ).join('\n');

    const eventContext = events.map(e =>
      `[${this.formatTimestamp(e.startSec)}] ${e.type}: ${e.notes}`
    ).join('\n');

    const prompt = `Create ${questionCount} ${difficulty} quiz questions for this medical video:
    
    Title: ${video.title}
    Description: ${video.description || ''}
    ${focusAreas ? `Focus Areas: ${focusAreas.join(', ')}` : ''}
    
    Video Content:
    ${context}
    
    Key Events:
    ${eventContext}
    
    Generate a mix of:
    - Multiple choice questions (60%)
    - Short answer questions (25%) 
    - Identification questions (15%)
    
    Each question must include:
    - Timestamp reference where the answer can be found
    - Correct answer
    - Brief explanation
    
    Format as JSON array with: id, type, question, options (for MCQ), correctAnswer, timestamp, explanation`;

    try {
      const response = await this.geminiService.generateQuizQuestions(prompt);
      return this.parseQuizResponse(response, segments);
    } catch (error) {
      logger.error('Quiz content generation error', error);
      return this.generateFallbackQuiz(segments, questionCount);
    }
  }

  private parseQuizResponse(response: string, segments: any[]) {
    try {
      const questions = JSON.parse(response);
      return questions.map((q: any, index: number) => ({
        id: q.id || `q_${index + 1}`,
        type: q.type || 'mcq',
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        timestamp: q.timestamp || segments[index % segments.length]?.startSec || 0,
        explanation: q.explanation || ''
      }));
    } catch (error) {
      logger.error('Quiz parsing error', error);
      return this.generateFallbackQuiz(segments, 5);
    }
  }

  private generateFallbackQuiz(segments: any[], count: number) {
    return segments.slice(0, count).map((segment, index) => ({
      id: `fallback_q_${index + 1}`,
      type: 'mcq',
      question: `What happens at ${this.formatTimestamp(segment.startSec)}?`,
      options: [
        segment.captions[0] || 'Procedure begins',
        'Different action occurs',
        'Video ends',
        'Nothing significant'
      ],
      correctAnswer: segment.captions[0] || 'Procedure begins',
      timestamp: segment.startSec,
      explanation: 'Based on the video content at this timestamp.'
    }));
  }

  private async generateTrainingPlan(
    video: any,
    segments: any[],
    events: any[],
    durationMinutes: number,
    focusAreas: string[],
    difficulty: string
  ) {
    const sessionCount = Math.max(1, Math.floor(durationMinutes / 10));
    
    return Array.from({ length: sessionCount }, (_, index) => ({
      sessionNumber: index + 1,
      title: `Session ${index + 1}: ${this.getSessionTitle(events, index)}`,
      duration: Math.floor(durationMinutes / sessionCount),
      activities: [
        {
          type: 'watch',
          title: 'Video Review',
          timestamp: segments[index * Math.floor(segments.length / sessionCount)]?.startSec || 0,
          duration: 5
        },
        {
          type: 'quiz',
          title: 'Knowledge Check',
          questionCount: 3,
          duration: 3
        },
        {
          type: 'reflection',
          title: 'Key Points Review',
          duration: 2
        }
      ]
    }));
  }

  private getSessionTitle(events: any[], index: number): string {
    const titles = ['Introduction', 'Procedure Steps', 'Critical Points', 'Completion', 'Review'];
    return titles[index % titles.length];
  }

  private formatQuizResponse(quiz: any) {
    return {
      id: quiz._id,
      questionCount: quiz.items.length,
      generatedAt: quiz.generatedAt,
      questions: quiz.items.map((item: any) => ({
        id: item.id,
        type: item.type,
        question: item.question,
        options: item.options,
        timestamp: item.timestamp,
        hasExplanation: !!item.explanation
      }))
    };
  }

  private gradeQuizResponses(quizItems: any[], responses: any[]) {
    return responses.map(response => {
      const question = quizItems.find(q => q.id === response.questionId);
      const isCorrect = question && 
        response.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      
      return {
        questionId: response.questionId,
        answer: response.answer,
        isCorrect,
        correctAnswer: question?.correctAnswer,
        explanation: question?.explanation,
        timestamp: question?.timestamp
      };
    });
  }

  private calculateScore(responses: any[]): number {
    const correct = responses.filter(r => r.isCorrect).length;
    return Math.round((correct / responses.length) * 100);
  }

  private generateReviewLinks(responses: any[], quizItems: any[]) {
    return responses
      .filter(r => !r.isCorrect)
      .map(r => {
        const question = quizItems.find(q => q.id === r.questionId);
        return {
          questionId: r.questionId,
          timestamp: question?.timestamp || 0,
          topic: question?.question.substring(0, 50) + '...'
        };
      });
  }

  private generateFeedback(score: number, totalQuestions: number): string {
    if (score >= 90) return 'Excellent work! You have mastered this content.';
    if (score >= 75) return 'Good job! Review the missed questions for improvement.';
    if (score >= 60) return 'Fair performance. Consider reviewing the video content.';
    return 'Additional study recommended. Review the video and key concepts.';
  }

  private formatTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}