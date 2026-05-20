import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../utils/jwt.js';
import type { SafeUser } from '../types/auth.types.js';

const getSafeUserData = (user: any): SafeUser => {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role: role || 'sales',
  });

  const token = generateToken({
    userId: newUser._id.toString(),
    role: newUser.role,
    email: newUser.email,
  });

  const safeUser = getSafeUserData(newUser);

  res.status(201).json(
    ApiResponse.success({ token, user: safeUser }, 'User registered successfully')
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  const safeUser = getSafeUserData(user);

  res.status(200).json(
    ApiResponse.success({ token, user: safeUser }, 'Logged in successfully')
  );
});
