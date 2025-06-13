import express from 'express'
import dotenv from 'dotenv'
import logsRoute from './routes/logs'

dotenv.config();

const app = express();
app.use(express.json());

app.use('/logs', logsRoute);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 LogPilot Rest Server listening on port ${PORT}`);
})
