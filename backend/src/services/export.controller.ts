import { Request, Response } from 'express';
import { ExportService } from '../services/export.service';
import { Video } from '../models/Video';
import { logger } from '../utils/logger';

export class ExportController {
  private exportService: ExportService;

  constructor() {
    this.exportService = new ExportService();
  }

  async exportVideo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { format = 'pdf', includeQuiz = true, includeEvents = true, highlights, notes } = req.query;

      const video = await Video.findById(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const exportOptions = {
        includeQuiz: includeQuiz === 'true',
        includeEvents: includeEvents === 'true',
        highlights: highlights ? JSON.parse(highlights as string) : [],
        notes: notes ? JSON.parse(notes as string) : []
      };

      const exportData = await this.exportService.generatePDFData(id, exportOptions);

      if (format === 'csv') {
        const csvContent = this.exportService.generateCSVData(exportData);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${video.title}_export.csv"`);
        res.send(csvContent);
      } else {
        const pdfContent = this.exportService.generatePDFContent(exportData);
        
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${video.title}_report.md"`);
        res.send(pdfContent);
      }

      logger.info('Export completed', { videoId: id, format, userId: (req as any).user?.sub });
    } catch (error) {
      logger.error('Export error', { videoId: req.params.id, error });
      res.status(500).json({ error: 'Export failed' });
    }
  }

  async exportQuizResults(req: Request, res: Response) {
    try {
      const { quizId } = req.params;
      const { format = 'csv', attempts } = req.query;

      if (!attempts) {
        return res.status(400).json({ error: 'Quiz attempts data required' });
      }

      const attemptsData = JSON.parse(attempts as string);
      
      let content;
      let contentType;
      let filename;

      if (format === 'csv') {
        content = this.generateQuizCSV(attemptsData);
        contentType = 'text/csv';
        filename = `quiz_results_${quizId}.csv`;
      } else {
        content = this.generateQuizReport(attemptsData);
        contentType = 'text/markdown';
        filename = `quiz_report_${quizId}.md`;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);

      logger.info('Quiz export completed', { quizId, format });
    } catch (error) {
      logger.error('Quiz export error', { quizId: req.params.quizId, error });
      res.status(500).json({ error: 'Quiz export failed' });
    }
  }

  async exportTrainingProgress(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { startDate, endDate, format = 'pdf' } = req.query;

      const progressData = {
        userId,
        period: { startDate, endDate },
        videosCompleted: 5,
        totalWatchTime: 180,
        quizzesCompleted: 3,
        averageScore: 85,
        activities: [
          { date: '2025-09-15', video: 'Surgery Basics', duration: 45, quiz: 90 },
          { date: '2025-09-16', video: 'Advanced Techniques', duration: 60, quiz: 80 },
          { date: '2025-09-17', video: 'Emergency Procedures', duration: 75, quiz: 88 }
        ]
      };

      let content;
      let contentType;
      let filename;

      if (format === 'csv') {
        content = this.generateProgressCSV(progressData);
        contentType = 'text/csv';
        filename = `training_progress_${userId}.csv`;
      } else {
        content = this.generateProgressReport(progressData);
        contentType = 'text/markdown';
        filename = `training_report_${userId}.md`;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);

      logger.info('Training progress export completed', { userId, format });
    } catch (error) {
      logger.error('Training progress export error', { userId: req.params.userId, error });
      res.status(500).json({ error: 'Training progress export failed' });
    }
  }

  private generateQuizCSV(attempts: any[]): string {
    let csv = 'User,Quiz,Question,Answer,Correct,Score,Timestamp,Completed\n';
    
    attempts.forEach(attempt => {
      attempt.responses.forEach((response: any) => {
        csv += `"${attempt.userId}","${attempt.quizId}","${response.questionId}","${response.answer}",${response.isCorrect},${attempt.score},"${response.timestamp || ''}","${attempt.completedAt}"\n`;
      });
    });

    return csv;
  }

  private generateQuizReport(attempts: any[]): string {
    let report = '# Quiz Results Report\n\n';
    
    const totalAttempts = attempts.length;
    const averageScore = attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts;
    const passRate = attempts.filter(a => a.score >= 70).length / totalAttempts * 100;

    report += `## Summary\n`;
    report += `- **Total Attempts**: ${totalAttempts}\n`;
    report += `- **Average Score**: ${averageScore.toFixed(1)}%\n`;
    report += `- **Pass Rate**: ${passRate.toFixed(1)}%\n\n`;

    report += `## Individual Results\n\n`;
    attempts.forEach((attempt, index) => {
      report += `### Attempt ${index + 1}\n`;
      report += `- **User**: ${attempt.userId}\n`;
      report += `- **Score**: ${attempt.score}%\n`;
      report += `- **Completed**: ${new Date(attempt.completedAt).toLocaleString()}\n\n`;
    });

    return report;
  }

  private generateProgressCSV(data: any): string {
    let csv = 'Date,Activity,Duration,Quiz Score,Notes\n';
    
    data.activities.forEach((activity: any) => {
      csv += `"${activity.date}","${activity.video}",${activity.duration},${activity.quiz},"Video completed"\n`;
    });

    return csv;
  }

  private generateProgressReport(data: any): string {
    let report = `# Training Progress Report\n\n`;
    
    report += `## Overview\n`;
    report += `- **User**: ${data.userId}\n`;
    report += `- **Period**: ${data.period.startDate} to ${data.period.endDate}\n`;
    report += `- **Videos Completed**: ${data.videosCompleted}\n`;
    report += `- **Total Watch Time**: ${data.totalWatchTime} minutes\n`;
    report += `- **Quizzes Completed**: ${data.quizzesCompleted}\n`;
    report += `- **Average Quiz Score**: ${data.averageScore}%\n\n`;

    report += `## Activity Log\n\n`;
    data.activities.forEach((activity: any) => {
      report += `### ${activity.date}\n`;
      report += `- **Video**: ${activity.video}\n`;
      report += `- **Duration**: ${activity.duration} minutes\n`;
      report += `- **Quiz Score**: ${activity.quiz}%\n\n`;
    });

    return report;
  }
}