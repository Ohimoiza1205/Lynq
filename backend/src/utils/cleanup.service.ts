import { ImportJob } from '../models/ImportJob';
import { Video } from '../models/Video';
import { TrainingRecord } from '../models/TrainingRecord';
import { logger } from './logger';

export class CleanupService {
  static async cleanupOldJobs(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await ImportJob.deleteMany({
        status: { $in: ['completed', 'failed'] },
        updatedAt: { $lt: thirtyDaysAgo }
      });

      logger.info('Cleanup: Old import jobs removed', { count: result.deletedCount });
    } catch (error) {
      logger.error('Cleanup: Failed to remove old jobs', error);
    }
  }

  static async cleanupFailedVideos(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const result = await Video.deleteMany({
        status: 'failed',
        updatedAt: { $lt: sevenDaysAgo }
      });

      logger.info('Cleanup: Failed videos removed', { count: result.deletedCount });
    } catch (error) {
      logger.error('Cleanup: Failed to remove failed videos', error);
    }
  }

  static async updateTrainingProgress(): Promise<void> {
    try {
      const inactiveRecords = await TrainingRecord.updateMany(
        {
          status: 'in_progress',
          lastAccessedAt: { $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
        },
        {
          status: 'started'
        }
      );

      logger.info('Cleanup: Inactive training records reset', { count: inactiveRecords.modifiedCount });
    } catch (error) {
      logger.error('Cleanup: Failed to update training progress', error);
    }
  }

  static async runDailyCleanup(): Promise<void> {
    logger.info('Starting daily cleanup tasks');
    
    await Promise.all([
      this.cleanupOldJobs(),
      this.cleanupFailedVideos(),
      this.updateTrainingProgress()
    ]);

    logger.info('Daily cleanup tasks completed');
  }
}