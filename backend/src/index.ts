import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import wardrobeRouter from './routes/wardrobe';
import uploadRouter from './routes/upload';
import recommendRouter from './routes/recommend';
import recordsRouter from './routes/records';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/wardrobe', wardrobeRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/records', recordsRouter);

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/outfit-assistant';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  start().catch(console.error);
}

export default app;
