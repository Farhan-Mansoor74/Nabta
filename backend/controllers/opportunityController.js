// controllers/opportunityController.js - Controller for opportunities and events
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all opportunities (default: volunteering type)
// @route   GET /api/opportunities
// @access  Public
export const getOpportunities = async (req, res, next) => {
  try {
    const { type = 'volunteering', ...rest } = req.query;
    const filter = { type, ...rest };
    
    const opportunities = await Opportunity.find(filter)
      .sort({ date: 1 })
      .populate('sponsoredBy', 'name logo');
    
    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all exclusive events (requires points)
// @route   GET /api/opportunities/exclusive
// @access  Public
export const getExclusiveEvents = async (req, res, next) => {
  try {
    const events = await Opportunity.find({ 
      type: 'exclusive_event',
      pointsRequired: { $gt: 0 }
    })
    .sort({ date: 1 })
    .populate('sponsoredBy', 'name logo');
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single opportunity or event
// @route   GET /api/opportunities/:id
// @access  Public
export const getOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('sponsoredBy', 'name description logo website')
      .populate('participants', 'name');
    
    if (!opportunity) {
      return next(new ErrorResponse(`Opportunity not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: opportunity
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new opportunity or event
// @route   POST /api/opportunities
// @access  Private (Company, Admin)
export const createOpportunity = async (req, res, next) => {
  try {
    // If created by company, set sponsoredBy
    if (req.userRole === 'company') {
      req.body.sponsoredBy = req.user.id;
    }
    
    const opportunity = await Opportunity.create(req.body);
    
    // If it's a company, update its sponsored opportunities
    if (req.userRole === 'company') {
      await Company.findByIdAndUpdate(req.user.id, {
        $push: { sponsoredOpportunities: opportunity._id }
      });
    }
    
    res.status(201).json({
      success: true,
      data: opportunity
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update opportunity or event
// @route   PUT /api/opportunities/:id
// @access  Private (Company owner, Admin)
export const updateOpportunity = async (req, res, next) => {
  try {
    let opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return next(new ErrorResponse(`Opportunity not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is opportunity owner or admin
    if (req.userRole === 'company' && opportunity.sponsoredBy.toString() !== req.user.id && req.userRole !== 'admin') {
      return next(new ErrorResponse(`Not authorized to update this opportunity`, 403));
    }
    
    opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: opportunity
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete opportunity or event
// @route   DELETE /api/opportunities/:id
// @access  Private (Company owner, Admin)
export const deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return next(new ErrorResponse(`Opportunity not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is opportunity owner or admin
    if (req.userRole === 'company' && opportunity.sponsoredBy.toString() !== req.user.id && req.userRole !== 'admin') {
      return next(new ErrorResponse(`Not authorized to delete this opportunity`, 403));
    }
    
    // Remove opportunity from company's sponsored opportunities
    if (opportunity.sponsoredBy) {
      await Company.findByIdAndUpdate(opportunity.sponsoredBy, {
        $pull: { sponsoredOpportunities: opportunity._id }
      });
    }
    
    // Remove opportunity from all users' completed/attended opportunities
    await User.updateMany(
      { attendedOpportunities: opportunity._id },
      { $pull: { attendedOpportunities: opportunity._id } }
    );
    
    await opportunity.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Join an opportunity or event
// @route   POST /api/opportunities/:id/join
// @access  Private (Volunteers only)
export const joinOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return next(new ErrorResponse(`Opportunity not found with id of ${req.params.id}`, 404));
    }
    
    // Check if opportunity is already full
    if (opportunity.currentParticipants >= opportunity.maxParticipants) {
      return next(new ErrorResponse(`This opportunity is already full`, 400));
    }
    
    // Check if user is already registered
    if (opportunity.participants.includes(req.user.id)) {
      return next(new ErrorResponse(`You are already registered for this opportunity`, 400));
    }
    
    // For exclusive events, check if user has enough points
    if (opportunity.type === 'exclusive_event' && opportunity.pointsRequired > 0) {
      const user = await User.findById(req.user.id);
      if (user.points < opportunity.pointsRequired) {
        return next(new ErrorResponse(`You need ${opportunity.pointsRequired} points to join this event, but you only have ${user.points}`, 400));
      }
      
      // Deduct points for exclusive event
      user.points -= opportunity.pointsRequired;
      await user.save();
    }
    
    // Add user to participants and increment count
    opportunity.participants.push(req.user.id);
    opportunity.currentParticipants += 1;
    await opportunity.save();
    
    // Add opportunity to user's attended opportunities
    await User.findByIdAndUpdate(req.user.id, {
      $push: { attendedOpportunities: opportunity._id }
    });
    
    res.status(200).json({
      success: true,
      data: opportunity
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Leave an opportunity or event
// @route   POST /api/opportunities/:id/leave
// @access  Private (Volunteers only)
export const leaveOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return next(new ErrorResponse(`Opportunity not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is registered
    if (!opportunity.participants.includes(req.user.id)) {
      return next(new ErrorResponse(`You are not registered for this opportunity`, 400));
    }
    
    // Check if opportunity is in the past
    if (new Date(opportunity.date) < new Date()) {
      return next(new ErrorResponse(`Cannot leave an opportunity that has already occurred`, 400));
    }
    
    // Remove user from participants and decrement count
    opportunity.participants = opportunity.participants.filter(id => id.toString() !== req.user.id);
    opportunity.currentParticipants -= 1;
    await opportunity.save();
    
    // Remove opportunity from user's attended opportunities
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { attendedOpportunities: opportunity._id }
    });
    
    // Refund points if it was an exclusive event
    if (opportunity.type === 'exclusive_event' && opportunity.pointsRequired > 0) {
      const user = await User.findById(req.user.id);
      user.points += opportunity.pointsRequired;
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      data: opportunity
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark opportunity as completed and award points
// @route   POST /api/opportunities/:id/complete
// @access  Private (Company owner, Admin)
export const completeOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return next(new ErrorResponse(`Opportunity not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is opportunity owner or admin
    if (req.userRole === 'company' && opportunity.sponsoredBy.toString() !== req.user.id && req.userRole !== 'admin') {
      return next(new ErrorResponse(`Not authorized to complete this opportunity`, 403));
    }
    
    // Only allow completion if not already completed
    if (opportunity.status === 'completed') {
      return next(new ErrorResponse(`This opportunity has already been marked as completed`, 400));
    }
    
    // Update status to completed
    opportunity.status = 'completed';
    await opportunity.save();
    
    // Verify attendance and award points to participants
    const { attendees } = req.body;
    
    // If attendees list is provided, use it; otherwise, use all participants
    const participantsToAward = attendees || opportunity.participants;
    
    // Award points to each participant
    for (const participantId of participantsToAward) {
      const user = await User.findById(participantId);
      
      if (user) {
        // Only for volunteering opportunities (not exclusive events)
        if (opportunity.type === 'volunteering') {
          user.points += opportunity.points;
          
          // Add to completed opportunities if not already there
          if (!user.completedOpportunities.includes(opportunity._id)) {
            user.completedOpportunities.push(opportunity._id);
          }
          
          await user.save();
        }
      }
    }
    
    // Update company impact metrics if it's sponsored by a company
    if (opportunity.sponsoredBy) {
      const company = await Company.findById(opportunity.sponsoredBy);
      
      if (company) {
        // Update impact metrics based on opportunity data
        await company.updateImpactMetrics({
          volunteersEngaged: participantsToAward.length,
          hoursContributed: opportunity.duration * participantsToAward.length,
          carbonOffset: opportunity.sustainabilityImpact?.carbonReduction || 0
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: opportunity
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get opportunities by category
// @route   GET /api/opportunities/category/:category
// @access  Public
export const getOpportunitiesByCategory = async (req, res, next) => {
  try {
    const opportunities = await Opportunity.findByCategory(req.params.category)
      .sort({ date: 1 })
      .populate('sponsoredBy', 'name logo');
    
    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get opportunities by location
// @route   GET /api/opportunities/location/:location
// @access  Public
export const getOpportunitiesByLocation = async (req, res, next) => {
  try {
    const opportunities = await Opportunity.findByLocation(req.params.location)
      .sort({ date: 1 })
      .populate('sponsoredBy', 'name logo');
    
    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities
    });
  } catch (err) {
    next(err);
  }
};