const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { comparePassword, hashPassword, generateToken} = require('../utils/auth.js');
const { user: select } = require('../helper/fields');

const roleMapping = {
  1: 'student',
  2: 'lecturer',
  3: 'moderator',
  4: 'admin',
  5: 'owner'
};

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;
    
    //validate input
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    //hash password
    const hashed_password = hashPassword(password);

    //create user
    const { data, error } = await supabase.auth.signUp({
      email,
      hashed_password,
      options: {
        data: {
          full_name,
          role: role || 'student'
        }
      }
    });
    
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
    const password_status = comparePassword(password, user.password);
    if (!password_status) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    //create JWT
    const payload = { id: user.userid, username: user.username, role: roleMapping[role] };
    const token = generateToken(payload);

    // send response
    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token: token,
      user: {
        id: user.userid,
        username: user.username,
        email: user.email,
      },
      role: roleMapping[role] // Kirim nama peran ke frontend
    });

  } catch (error) {
    console.error('server error:', error);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
},

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

exports.logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
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
exports.googleCallback = (req, res) => {
  const user = req.user;

  //create JWT
  const payload = { id: user.userid, username: user.username, role: roleMapping[role] };
  const token = generateToken(payload);

  res.json({ token, user });
}