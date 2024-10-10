import express from 'express';
import { getUserById, updateUser,updateUserRole,fetchUserPlans } from '../controllers/UserController';

const router = express.Router();

// Route to get user by ID
router.get('/:id', getUserById);

// Route to update user
router.put('/:id', updateUser);
router.get('/:userId/plans', fetchUserPlans);

router.post('/:userId/updateRole', updateUserRole);
export default router;
