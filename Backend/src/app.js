import express from 'express';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';

const app = express();


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/users', userRoutes);

export default app;


