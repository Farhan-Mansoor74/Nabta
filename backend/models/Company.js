// models/Company.js - Company model
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide company name'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide company email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  description: {
    type: String,
    required: [true, 'Please provide company description']
  },
  logo: String,
  website: String,
  industry: String,
  size: {
    type: String,
    enum: ['small', 'medium', 'large', 'enterprise']
  },
  location: String,
  sponsoredOpportunities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  }],
  sustainabilityGoals: [String],
  impactMetrics: {
    carbonOffset: {
      type: Number,
      default: 0
    },
    volunteersEngaged: {
      type: Number,
      default: 0
    },
    hoursContributed: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password before saving
companySchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
companySchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: 'company' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match company entered password to hashed password in database
companySchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update impact metrics
companySchema.methods.updateImpactMetrics = async function(metrics) {
  this.impactMetrics.carbonOffset += metrics.carbonOffset || 0;
  this.impactMetrics.volunteersEngaged += metrics.volunteersEngaged || 0;
  this.impactMetrics.hoursContributed += metrics.hoursContributed || 0;
  await this.save();
  return this.impactMetrics;
};

const Company = mongoose.model('Company', companySchema);

export default Company;