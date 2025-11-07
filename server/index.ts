import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRouter from './routes/email';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', emailRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Email server is running' });
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
