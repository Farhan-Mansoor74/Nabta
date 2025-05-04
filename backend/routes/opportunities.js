// routes/opportunities.js - Opportunity and event routes
import express from 'express';
import {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  joinOpportunity,
  leaveOpportunity,
  getOpportunitiesByCategory,
  getOpportunitiesByLocation,
  completeOpportunity,
  getExclusiveEvents
} from '../controllers/opportunityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getOpportunities);
router.get('/exclusive', getExclusiveEvents);
router.get('/:id', getOpportunity);
router.get('/category/:category', getOpportunitiesByCategory);
router.get('/location/:location', getOpportunitiesByLocation);

// Protected routes - require login
router.post('/', protect, authorize('company', 'admin'), createOpportunity);
router.put('/:id', protect, authorize('company', 'admin'), updateOpportunity);
router.delete('/:id', protect, authorize('company', 'admin'), deleteOpportunity);

// Volunteer participation routes
router.post('/:id/join', protect, authorize('volunteer'), joinOpportunity);
router.post('/:id/leave', protect, authorize('volunteer'), leaveOpportunity);
router.post('/:id/complete', protect, authorize('company', 'admin'), completeOpportunity);

export default router;