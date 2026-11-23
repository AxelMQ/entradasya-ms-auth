import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database';

export const healthController = {
  live(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'UP'
    });
  },

  async ready(_req: Request, res: Response): Promise<void> {
    const isDbConnected = await checkDatabaseConnection();

    if (isDbConnected) {
      res.status(200).json({
        status: 'UP',
        database: 'connected'
      });
    } else {
      res.status(503).json({
        status: 'DOWN',
        database: 'disconnected'
      });
    }
  }
};
