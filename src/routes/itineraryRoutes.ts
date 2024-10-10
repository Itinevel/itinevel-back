import { Router } from 'express';
import { PlanController } from '../controllers/PlanController'; // Update the path according to your project structure

const router = Router();
const planController = new PlanController();

// Route to create a new plan
router.post('/plans', (req, res) => planController.createPlan(req, res));
router.get('/plans/:planId', planController.getPlanWithItineraries);
router.put('/plans/:planId', planController.updatePlan);
router.get('/plans', (req, res) => {
    return planController.getPlans(req, res);  // Pass only `req` and `res`
});


// Define other routes here as needed, e.g., for getting, updating, or deleting plans
// router.get('/plans', (req, res) => planController.getAllPlans(req, res));
// router.get('/plans/:id', (req, res) => planController.getPlanById(req, res));
// router.put('/plans/:id', (req, res) => planController.updatePlan(req, res));
// router.delete('/plans/:id', (req, res) => planController.deletePlan(req, res));

export default router;
