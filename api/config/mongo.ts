import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://salim:DlS2iHUlANBqujtT@itinerary-project-mongo.v1n64.mongodb.net/itineraryprojectdb?retryWrites=true&w=majority&appName=Itinerary-project-mongo-cluster';

const connectMongoDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectMongoDB;
