// models/Opportunity.js - Volunteering opportunity/event model
import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide opportunity title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide description']
  },
  location: {
    type: String,
    required: [true, 'Please specify location']
  },
  category: {
    type: String,
    required: [true, 'Please specify category'],
    enum: ['environmental', 'social', 'educational', 'humanitarian', 'other']
  },
  type: {
    type: String,
    required: [true, 'Please specify type'],
    enum: ['volunteering', 'exclusive_event'],
    default: 'volunteering'
  },
  pointsRequired: {
    type: Number,
    default: 0, // 0 for regular volunteering, positive number for exclusive events
  },
  date: {
    type: Date,
    required: [true, 'Please specify date']
  },
  duration: {
    type: Number, // in hours
    required: [true, 'Please specify duration']
  },
  points: {
    type: Number,
    required: [true, 'Please specify points value'],
    min: [1, 'Points must be at least 1']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Please specify maximum participants']
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'canceled'],
    default: 'upcoming'
  },
  skills: [String],
  requirements: [String],
  images: [String],
  sponsoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  sustainabilityImpact: {
    carbonReduction: Number, // in kg
    waterSaved: Number, // in liters
    wasteReduced: Number, // in kg
    treesPlanted: Number,
    description: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for remaining spots
opportunitySchema.virtual('remainingSpots').get(function() {
  return this.maxParticipants - this.currentParticipants;
});

// Virtual for opportunity status based on date
opportunitySchema.virtual('calculatedStatus').get(function() {
  const now = new Date();
  if (this.date > now) return 'upcoming';
  if (this.date <= now && this.date.getTime() + this.duration * 60 * 60 * 1000 > now.getTime()) return 'ongoing';
  return 'completed';
});

// Middleware to update status based on date before saving
opportunitySchema.pre('save', function(next) {
  this.status = this.calculatedStatus;
  next();
});

// Static method to get opportunities by category
opportunitySchema.statics.findByCategory = function(category) {
  return this.find({ category });
};

// Static method to get opportunities by location
opportunitySchema.statics.findByLocation = function(location) {
  return this.find({ location: { $regex: location, $options: 'i' } });
};

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

export default Opportunity;