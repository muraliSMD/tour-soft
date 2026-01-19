import jwt from 'jsonwebtoken';
import User from '@/models/User';
import connectDB from '@/lib/db';

export const protect = async (req) => {
  let token;

  if (
    req.headers.get('authorization') &&
    req.headers.get('authorization').startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.get('authorization').split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      await connectDB();
      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
         throw new Error('Not authorized, user not found');
      }

      return user;
    } catch (error) {
      console.error(error);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    throw new Error('Not authorized, no token');
  }
};

export const requireAdmin = (user) => {
    if (user && (user.role === 'admin' || user.role === 'owner')) {
        return true;
    }
    throw new Error('Not authorized as an admin');
};
