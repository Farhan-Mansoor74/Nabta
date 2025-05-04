// controllers/userController.js
import User from '../models/User.js';

export const registerVolunteer = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ username, email, password }); // Add hashing in production
    await newUser.save();

    res.status(201).json({ message: 'Volunteer registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
