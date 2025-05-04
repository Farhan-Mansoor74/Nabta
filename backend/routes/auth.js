// routes/auth.js - Authentication routes
import express from 'express';
import { register,login } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);
router.post('/login', login); 

export default router;

// import express from 'express';
// import {
//   register
// //   login,
// //   logout,
// //   getMe
// //   forgotPassword,
// //   resetPassword,
// //   updatePassword,
// //   registerCompany,
// //   loginCompany
// } from '../controllers/authController.js';
// import { protect } from '../middleware/auth.js';

// const router = express.Router();

// // User authentication routes
// router.post('/register', register);
// // router.post('/login', login);
// // router.get('/logout', logout);
// // router.get('/me', protect, getMe);
// // router.post('/forgotpassword', forgotPassword);
// // router.put('/resetpassword/:resettoken', resetPassword);
// // router.put('/updatepassword', protect, updatePassword);

// // Company authentication routes
// router.post('/company/register', registerCompany);
// router.post('/company/login', loginCompany);

// export default router;