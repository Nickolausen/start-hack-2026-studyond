import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { connectDB } from './db/connection.js';
import { chatRouter } from './routes/chat.js';
import { threadChatRouter } from './routes/threadChat.js';
import { tagsRouter } from './routes/tags.js';
import { studentsRouter } from './routes/students.js';
import { threadsRouter } from './routes/threads.js';
import { seedRouter } from './routes/seed.js';
import { projectsRouter } from './routes/projects.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json({ limit: '2mb' }));

// ---- Request logger ----
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.path}`);
  next();
});

// ---- Routes ----
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/chat', chatRouter);
app.use('/api/thread-chat', threadChatRouter);
app.use('/api/extract-tags', tagsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/students/:studentId/threads', threadsRouter);
app.use('/api/students/:studentId/projects', projectsRouter);
app.use('/api/seed', seedRouter);

// ---- Error handler ----
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ error: err.message });
});

// ---- Bootstrap ----
async function main() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Studyond API running on http://localhost:${PORT}`);
  });
}

main();
