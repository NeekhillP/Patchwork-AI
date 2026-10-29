import express from 'express';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();


app.use(cors({ origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/users', userRoutes);

export default app;


