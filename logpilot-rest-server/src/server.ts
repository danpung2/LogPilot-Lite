import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import router from './routes/logs';

export function startRestServer(): void {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });

  const app = express();
  app.use(express.json());
  app.use('/logs', router);

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`🚀 LogPilot REST Server listening on port ${PORT}`);
  });
}

if (require.main === module) {
  startRestServer();
}
