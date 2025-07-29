import nodemailer from 'nodemailer';
// Request OTP for login
export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    // Check if user exists and is active
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1 AND status = $2', [email, 'active']);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or not active' });
    }
    // Generate OTP
    const otp = generateOTP();
    otpStore[email] = { otp, timestamp: Date.now() };

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.OTP_EMAIL_USER,
        pass: process.env.OTP_EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.OTP_EMAIL_USER,
      to: email,
      subject: 'Your OTP for Login',
      text: `Your OTP for login is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface User {
  id: number;
  email: string;
  password?: string;
  google_id?: string;
}

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in memory (in production, use Redis or similar)
const otpStore: { [key: string]: { otp: string; timestamp: number } } = {};

export const signup = async (req: Request, res: Response) => {
  try {
    console.log('Signup request received:', { ...req.body, password: '[REDACTED]' });
    
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Validation failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      // Check if user exists
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        console.log('User already exists:', email);
        return res.status(400).json({ error: 'User already exists' });
      }
    } catch (dbError) {
      console.error('Database error checking existing user:', dbError);
      throw new Error('Database connection error');
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      throw new Error('Error processing password');
    }

    // Generate OTP
    const otp = generateOTP();
    otpStore[email] = {
      otp,
      timestamp: Date.now(),
    };

    // Store user with pending status
    let result;
    try {
      result = await pool.query(
        'INSERT INTO users (email, password, name, status) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
        [email, hashedPassword, name || '', 'pending']
      );
      console.log('User successfully created:', { id: result.rows[0].id, email: result.rows[0].email });
    } catch (dbError) {
      console.error('Database error creating user:', dbError);
      throw new Error('Failed to create user account');
    }

    // TODO: Send OTP via email (implement email service)
    console.log(`OTP for ${email}: ${otp}`);

    res.status(201).json({ 
      message: 'OTP sent to email',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name
      }
    });
  } catch (error) {
    console.error('Signup error:', error instanceof Error ? error.message : error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!otpStore[email] || otpStore[email].otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check OTP expiry (5 minutes)
    if (Date.now() - otpStore[email].timestamp > 5 * 60 * 1000) {
      delete otpStore[email];
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Update user status
    await pool.query('UPDATE users SET status = $1 WHERE email = $2', ['active', email]);

    // Clear OTP
    delete otpStore[email];

    const user = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET || 'default_secret'
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying OTP' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user: User = result.rows[0];

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret'
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID is not configured');
      return res.status(500).json({ error: 'Google authentication is not configured properly' });
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      console.error('Google token verification failed:', error);
      return res.status(401).json({ error: 'Failed to verify Google token' });
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      console.error('Invalid Google token payload:', payload);
      return res.status(400).json({ error: 'Invalid Google token payload' });
    }

    // Check if user exists with either email or Google ID
    let result = await pool.query('SELECT * FROM users WHERE email = $1 OR google_id = $2', [
      payload.email,
      payload.sub,
    ]);
    let user = result.rows[0];

    if (!user) {
      // Create new user
      try {
        result = await pool.query(
          'INSERT INTO users (email, google_id, status, name) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
          [payload.email, payload.sub, 'active', payload.name || '']
        );
        user = result.rows[0];
      } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Error creating user account' });
      }
    } else if (!user.google_id) {
      // User exists but doesn't have Google ID linked
      try {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [payload.sub, user.id]);
      } catch (error) {
        console.error('Error linking Google account:', error);
        return res.status(500).json({ error: 'Error linking Google account' });
      }
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Authentication is not configured properly' });
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name || '',
        google_id: payload.sub
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || payload.name || '',
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Error with Google authentication' });
  }
};
