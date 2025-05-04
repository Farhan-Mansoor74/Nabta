// models/User.js - User model for volunteers
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
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
  role: {
    type: String,
    enum: ['volunteer', 'admin'],
    default: 'volunteer'
  },
  points: {
    type: Number,
    default: 0
  },
  attendedOpportunities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  }],
  completedOpportunities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  }],
  bio: String,
  skills: [String],
  interests: [String],
  avatar: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add points to user
userSchema.methods.addPoints = async function(points) {
  this.points += points;
  await this.save();
  return this.points;
};

const User = mongoose.model('User', userSchema);

export default User;