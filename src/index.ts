import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import collectedDataRoutes from './routes/collectedData';

import connectToMongoDB from './config/config';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectToMongoDB();

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/collected-data', collectedDataRoutes);
app.use('/report', collectedDataRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
