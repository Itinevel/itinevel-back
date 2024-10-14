import { Router, Request, Response } from 'express';

const testRouter = Router();

// Define the test route
testRouter.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Success - 200 OK' });
});

export default testRouter;
