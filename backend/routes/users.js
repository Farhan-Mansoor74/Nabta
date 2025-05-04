// controllers/userController.js
import User from '../models/User.js';

/**
 * @desc    Register a new volunteer
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerVolunteer = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // In production, hash password before saving
    const newUser = new User({ username, email, password });

    // Save the new user to the database
    await newUser.save();

    res.status(201).json({ message: 'Volunteer registered successfully' });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
