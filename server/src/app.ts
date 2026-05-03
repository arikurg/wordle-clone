import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { gameRouter } from './routes/game';

export function createApp(): Express {
  const app = express();

  // Allowed origins:
  //   - localhost (so dev still works)
  //   - the production Vercel URL (set via CLIENT_URL env var)
  //   - any *.vercel.app preview deployment of this project
  const allowedOrigins = [
    'http://localhost:5173',
    process.env.CLIENT_URL,
  ].filter(Boolean) as string[];

  const vercelPreviewPattern = /^https:\/\/wordle-clone-.*\.vercel\.app$/;

  // Middleware
  app.use(
    cors({
      origin(origin, cb) {
        // Allow no-origin requests (curl, server-to-server) — CORS only
        // restricts browsers, and we want curl to keep working.
        if (!origin) return cb(null, true);

        if (allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
          return cb(null, true);
        }

        cb(new Error(`CORS: origin ${origin} not allowed`));
      },
    }),
  );

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  app.use('/api/game', gameRouter);

  return app;
}
