import express from 'express';
import cors from 'cors';

import cookieParser from 'cookie-parser';

import {config} from 'dotenv';
config(); 
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'
import errorMiddleware from './middleware/error.middle.js';
import courseRoutes from  './routes/course.route.js'

const app = express();
app.use(express.json());
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    Credential: true
}));
app.use(express.urlencoded({ extended: true}));

app.use(cookieParser());

app.use(morgan('dev'));

app.use('/ping',function(req,res){
    res.send('/pong');
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.all('*', (req,res) => {
    res.status(400).send('oops!! 404 page not found');
});

app.use(errorMiddleware);

 
export default app;   