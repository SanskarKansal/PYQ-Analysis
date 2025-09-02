import express from 'express';
import { ensureAuthenticated } from "../middlewares/authEnsure.js";
import { addQuestionsToSubject, getUserDetails } from "../controllers/userController.js"; // Import the controller

const router = express.Router();

// Define the route to get user details
router.get('/details', ensureAuthenticated, getUserDetails);
router.post('/add',ensureAuthenticated,addQuestionsToSubject);

export default router;
