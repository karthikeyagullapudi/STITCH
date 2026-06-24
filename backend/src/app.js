import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth.routes';
import cookieParser from 'cookie-parser';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/auth', authRouter);
export default app;
