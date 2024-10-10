import express from 'express';
import cors from 'cors';
import itineraryRoutes from './routes/itineraryRoutes';
import connectMongoDB from './config/mongo';
import prisma from './config/database';
import authRouter from './controllers/authRoutes';
import userRoutes from './routes/userRoutes';

const app = express();  

// Set up CORS options to allow specific origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
 'https://2d32-41-226-167-93.ngrok-free.app',  // Your Next.js frontend running locally
  'https://3c05-41-226-167-93.ngrok-free.app', 
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the origin
    } else {
      callback(new Error('Not allowed by CORS')); // Block the origin
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow credentials such as cookies or authorization headers
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/', authRouter);
app.use('/api/users', userRoutes);

// Connect to MongoDB
connectMongoDB();

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
