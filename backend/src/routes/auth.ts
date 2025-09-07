import express from 'express';
import axios from 'axios';
import User from '../models/User';
import { generateToken } from '../middleware/auth';

const router = express.Router();

// GitHub OAuth callback
router.post('/github/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({ message: 'Failed to get access token' });
    }

    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${access_token}`
      }
    });

    const githubUser = userResponse.data;

    // Get user repositories
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${access_token}`
      }
    });

    const repositories = reposResponse.data.map((repo: any) => repo.full_name);

    // Find or create user
    let user = await User.findOne({ githubId: githubUser.id.toString() });

    if (user) {
      // Update existing user
      user.username = githubUser.login;
      user.email = githubUser.email || user.email;
      user.avatarUrl = githubUser.avatar_url;
      user.accessToken = access_token;
      user.repositories = repositories;
    } else {
      // Create new user
      user = new User({
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url,
        accessToken: access_token,
        repositories
      });
    }
    
    await user.save();

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        repositories: user.repositories
      }
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// Get GitHub OAuth URL
router.get('/github/url', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/callback';
  const scope = 'user:email,repo';
  
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  
  res.json({ url: githubUrl });
});

export default router;
