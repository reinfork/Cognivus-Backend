const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const helper = require('../utils/auth.js');
const { user: select } = require('../helper/fields');
const { user: payload } = require('../helper/payload');
require('dotenv').config();

const roleMapping = {
  1: 'student',
  2: 'lecturer',
  3: 'moderator',
  4: 'admin',
  5: 'owner'
};

exports.register = async (req, res) => {
  try {
    const insert = payload(req.body);
    
    //validate input
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    //hash password
    const hashed_password = helper.hashPassword(password);

    //create user
    const { data, error } = await supabase
      .from('tbuser')
      .insert(payload)
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      user: data.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
},

//user login
exports.login = async (req, res) => {
  const headers = req.headers;
  const ip = req.ip;
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    //find user in database
    const { data: user, error: userError } = await supabase
      .from('tbuser')
      .select(select)
      .eq('username', username)
      .single();

    let role = user.roleid;

    if (userError || !user) {
      return res.status(401).json({ success: false, message: 'Invalid Username' });
    }

    //check password
    const password_status = await helper.comparePassword(password, user.password);
    if (!password_status || password_status === false) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    //create JWT
    const accessPayload = { id: user.userid, username: user.username, roleid: user.roleid };
    const refreshPayload = { id: user.userid, roleid: user.roleid };
    const accessToken = helper.generateToken(accessPayload);
    const refreshToken = helper.generateRefresh(refreshPayload);

    //hash token
    const hash = helper.hashPassword(refreshToken);

    //insert new token
    const { data: refresh, error: refreshError } = await supabase
      .from('tbrefresh_tokens')
      .insert({
        'userid': user.userid,
        'token': hash,
        'user_agent': headers['user-agent'],
        'ip_address': ip,
        'expires_at': new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      })

    if (refreshError) throw refreshError;

    //access token cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000
    });

    //refresh token cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 14 * 24 * 60 * 60 * 1000 //days
    });

    res.redirect(`${process.env.FRONTEND_URL}/login-success`);

  } catch (error) {
    console.error('server error:', error);
    res.status(500).json({ success: false, message: 'Invalid username/Server error' });
  }
},

//get account profile
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.user;
    
    // Get user profile from database
    const { data: userData, error: userError } = await supabase
      .from('tbuser')
      .select(select)
      .eq('userid', id)
      .single();
    
    if (userError) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
        error: userError.message
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...req.user,
        profile: userData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
},

//account logout
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    const hash1 = helper.hashPassword(token);

    //invalidating token
    const { data: validateData, error: validateError } = await supabase
      .from('tbrefresh_tokens')
      .update({
        'revoked': true,
        'expires_at': Date.now()
      })
      .eq('token', hash1)
      .select();

    if (validateError) throw validateError;

    //clearing cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ 
      success: true,
      message: 'Logged out' 
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
}

//google callback
exports.googleCallback = async (req, res) => {
  const user = req.user;
  const headers = req.headers;
  const ip = req.ip;

  try{
    //create JWT
    const accessPayload = { id: user.userid, username: user.username, roleid: 1 };
    const refreshPayload = { id: user.userid, roleid: 1 };
    const accessToken = helper.generateToken(accessPayload);
    const refreshToken = helper.generateRefresh(refreshPayload);

    //hash token
    const hash = helper.hashPassword(refreshToken);

    //insert new token
    const { data: refresh, error: refreshError } = await supabase
      .from('tbrefresh_tokens')
      .insert({
        'userid': user.userid,
        'token': hash,
        'user_agent': headers['user-agent'],
        'ip_address': ip,
        'expires_at': new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      })

    if (refreshError) throw refreshError;

    //access token cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000
    });

    //refresh token cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 14 * 24 * 60 * 60 * 1000 //14 days
    });

    res.redirect(`${process.env.FRONTEND_URL}/login-success`);
  } catch (error){
    res.status(500).json({
      success: false,
      message: 'Error in Google Callback',
      error: error.message
    });
  }
};

//issue new tokens
exports.refresh = async (req, res) => {
  const user = req.user;
  const token = req.cookies.refreshToken;
  const headers = req.headers;
  const ip = req.ip;

  try{
    const hash1 = helper.hashPassword(refreshToken);

    //invalidating token
    const { data: validateData, error: validateError } = await supabase
      .from('tbrefresh_tokens')
      .update({
        'revoked': true,
        'expires_at': Date.now()
      })
      .eq('token', hash1);

    if (validateError) throw validateError;

    //create JWT
    const accessPayload = { id: user.userid, username: user.username, roleid: user.roleid };
    const refreshPayload = { id: user.userid, roleid: user.roleid };
    const accessToken = helper.generateToken(accessPayload);
    const refreshToken = helper.generateRefresh(refreshPayload);

    //hash token
    const hash = helper.hashPassword(refreshToken);

    //rotate token
    //insert new token
    const { data: refresh, error: refreshError } = await supabase
      .from('tbrefresh_tokens')
      .insert({
        'userid': user.userid,
        'token': hash,
        'user_agent': headers['user-agent'],
        'ip_address': ip,
        'expires_at': new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      })

    if (refreshError) throw refreshError;

    //remove cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    //access token cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000
    });

    //refresh token cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 14 * 24 * 60 * 60 * 1000 //14 days
    });

    res.status(200).json({
      success: true,
      message: 'token refreshed'
    })

  } catch (error){
    res.status(500).json({
      success: false,
      message: 'Error while refresh token',
      error: error.message
    });
  }
}