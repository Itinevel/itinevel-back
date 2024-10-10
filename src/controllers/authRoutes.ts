import { Router, Request, Response, NextFunction } from 'express'; 
import prisma from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid'; // Import UUID for confirmation token
import { sendConfirmationEmail, sendPasswordResetEmail } from '../services/emailService'; // Assuming you have an email service
import { Role } from '@prisma/client'; // Import the Role enum from Prisma


interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    roles: Role[];
  };
}

dotenv.config();

const router = Router();


router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if the user exists
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }

    // Generate a password reset token and its expiry (1 hour)
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    // Save the reset token and expiry in the database
    await prisma.users.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset password email with the token
    await sendPasswordResetEmail(email, resetToken);

    return res.status(200).json({ message: 'Password reset link sent. Check your email.' });
  } catch (error) {
    console.error('Error generating password reset token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Password Reset Route
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    // Find the user by the reset token and ensure it's not expired
    const user = await prisma.users.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(), // Ensure the token hasn't expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token and expiry
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({ message: 'Password reset successful!' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Middleware to authenticate and verify JWT token
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header
  if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);

    // Attach the decoded token data to req.user
    req.user = decoded as { userId: number; roles: Role[] };

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorizeRole = (roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Check if user and roles are defined
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ error: 'Access denied, user not authenticated' });
    }

    const userRoles = req.user.roles as Role[];

    // Check if any of the user's roles match the required roles
    if (!roles.some(role => userRoles.includes(role))) {
      return res.status(403).json({ error: 'Access denied, insufficient permissions' });
    }

    next();
  };
};

// Registration Route
router.post('/register', async (req, res) => {
  try {
    const { email, password, nom, prenom, cin, phone, roles } = req.body;

    // Ensure required fields are provided
    if (!email || !password || !nom) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate confirmation token
    const confirmationToken = uuidv4();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24 hours

    // Always add USER role by default, and map any roles to the Role enum
    let userRoles: Role[] = [Role.USER];

    // If 'seller' is included in the request, add SELLER role
    if (roles && roles.includes('seller')) {
      userRoles.push(Role.SELLER);
    }

    // Create the user with email confirmation token and roles
    const newUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom: prenom || null,
        cin: cin || null,
        em_number: phone || null,
        confirmationToken,
        tokenExpiry,
        emailConfirmed: false,
        roles: userRoles, // Use the Role enum for roles
      },
    });

    // Send confirmation email
    await sendConfirmationEmail(email, confirmationToken);

    return res.status(201).json({
      message: 'User created successfully. Please check your email to confirm your account.',
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ensure email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if the user's email is confirmed
    if (!user.emailConfirmed) {
      return res.status(403).json({ error: 'Please confirm your email before logging in.' });
    }

    // Compare the provided password with the stored hashed password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return user object to be used by NextAuth
    return res.status(200).json({
      id: user.id,
      email: user.email,
      roles: user.roles,  // Add roles if you need them in the frontend
      nom: user.nom,      // Include additional user info if needed
      prenom: user.prenom
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



// Confirm Email Route
router.get('/confirm-email', async (req, res) => {
  try {
    const token = req.query.token as string; // Explicitly cast to string

    // Ensure the token exists and is a string
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing token' });
    }

    // Find the user with the confirmation token
    const user = await prisma.users.findFirst({
      where: {
        confirmationToken: token,
        tokenExpiry: { gte: new Date() }, // Ensure the token is not expired
      },
    });

    if (!user) {
      // Log the failure for debugging
      console.log(`Invalid or expired token: ${token}`);
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Confirm the email but do not delete the token and expiry yet
    await prisma.users.update({
      where: { id: user.id },
      data: {
        emailConfirmed: true,
      },
    });

    // Send success response
    res.status(200).json({ message: 'Email confirmed successfully!' });

    // After the response is sent, delete the token and expiry from the database
    setTimeout(async () => {
      await prisma.users.update({
        where: { id: user.id },
        data: {
          confirmationToken: null,
          tokenExpiry: null,
        },
      });
    }, 1000); // Add a slight delay before deleting the token
  } catch (error) {
    console.error('Error during email confirmation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  // A protected route for any authenticated user
router.get('/protected', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({ message: `Hello, user with ID: ${req.user?.userId}` });
});

// A protected route for sellers only
router.get('/seller-dashboard', authenticateToken, authorizeRole([Role.SELLER]), (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({ message: 'Welcome to the seller dashboard!' });
});


});



export default router;
