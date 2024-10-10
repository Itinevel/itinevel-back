import { Request, Response } from 'express';
import prisma from '../config/database'; // Assuming you're using Prisma for database
import bcrypt from 'bcrypt';
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(id) },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const fetchUserPlans = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  try {
    const plans = await prisma.plan.findMany({
      where: { userId: parseInt(userId) },
    });

    if (!plans || plans.length === 0) {
      res.status(404).json({ message: 'No plans found for this user.' });
      return;
    }

    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { roles } = req.body;

  try {
    // Ensure roles are provided
    if (!roles) {
      return res.status(400).json({ error: 'Roles are required' });
    }

    // Find and update the user's roles in the database
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(userId) },  // Convert userId to number if necessary
      data: {
        roles: {
          set: roles, // Update roles with the new roles array
        },
      },
    });

    return res.status(200).json({
      message: 'User roles updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating roles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { oldPassword, password, name, surname, phone } = req.body;
  
    try {
      const user = await prisma.users.findUnique({ where: { id: Number(id) } });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Validate old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid old password' });
      }
  
      // Hash new password if provided
      let updatedPassword = user.password;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updatedPassword = await bcrypt.hash(password, salt);
      }
  
      // Update the user
      const updatedUser = await prisma.users.update({
        where: { id: Number(id) },
        data: {
          nom: name,
          prenom: surname,
          em_number: phone,
          password: updatedPassword,
        },
      });
  
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  };
