import mongoose from 'mongoose';

const connectToMongoDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URL as string;
        if (!mongoUri) {
            throw new Error('MONGO_URI environment variable is not defined');
        }
        await mongoose.connect(mongoUri, {


        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
};

export default connectToMongoDB;
