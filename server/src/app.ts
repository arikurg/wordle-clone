import express, { Express, Request, Response } from 'express';
import cors from 'cors';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors());           // allow cross-origin requests
  app.use(express.json());   // parse JSON request bodies

  // Health check — useful for confirming the server is alive
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  return app;
}
