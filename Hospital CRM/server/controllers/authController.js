import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
];

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, role, phone });
    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { code } = req.body;
    const { tokens } = await googleClient.getToken(code);
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    let user = await User.findOne({ email, isActive: true });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-16),
        role: 'receptionist',
        avatar: picture,
      });
    }
    // Store Gmail tokens for email access
    user.googleTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    };
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const getGoogleAuthUrl = (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  res.json({ url });
};

export const getGmailClient = async (user) => {
  if (!user.googleTokens?.refreshToken && !user.googleTokens?.accessToken) {
    throw new Error('Google account not connected. Please sign in with Google.');
  }

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  let accessToken = user.googleTokens.accessToken;
  const expiryDate = user.googleTokens.expiryDate;

  // Refresh token if expired
  if (!expiryDate || Date.now() >= expiryDate) {
    if (user.googleTokens.refreshToken) {
      client.setCredentials({ refresh_token: user.googleTokens.refreshToken });
      const { tokens } = await client.refreshAccessToken();
      accessToken = tokens.access_token;
      // Update stored tokens
      user.googleTokens = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || user.googleTokens.refreshToken,
        expiryDate: tokens.expiry_date,
      };
      await user.save();
    }
  }

  client.setCredentials({ access_token: accessToken });
  return client;
};
