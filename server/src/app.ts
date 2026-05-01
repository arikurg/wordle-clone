import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { gameRouter } from './routes/game';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors());           // allow cross-origin requests
  app.use(express.json());   // parse JSON request bodies

  // Health check — useful for confirming the server is alive
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  app.use('/api/game', gameRouter);

  return app;
}
