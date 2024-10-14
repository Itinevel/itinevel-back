import express from 'express';
import cors from 'cors';
import itineraryRoutes from '../src/routes/itineraryRoutes';
import connectMongoDB from '../src/config/mongo';
import prisma from '../src/config/database';
import authRouter from '../src/controllers/authRoutes';
import userRoutes from '../src/routes/userRoutes';

const app = express();  

// Set up CORS options to allow specific origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://itinevel-front.vercel.app', // Primary domain
  'https://itinevel-front-git-main-itinevels-projects.vercel.app', // Main branch domain
  
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

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello, world!",
});
});

export default app;