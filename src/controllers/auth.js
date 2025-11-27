const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otputils = require('../utils/otp');
const smtpEmail = require('../helper/email');
const whatsapp = require('../helper/whatsapp');
const { comparePassword, hashPassword, generateToken} = require('../utils/auth.js');
const { user: select } = require('../helper/fields');
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
    const password_status = await comparePassword(password, user.password);
    if (!password_status || password_status === false) {
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
    res.status(500).json({ success: false, message: 'Invalid username/Server error' });
  }
},

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.user;
    
    // Get user profile from database
    const { data, error } = await supabase
      .from('tbuser')
      .select(select)
      .eq('userid', id)
      .single();
    
    if (error) throw error;
    
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
    
    if (error) throw error;
    
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

exports.googleCallback = (req, res) => {
  const user = req.user;
  const role = roleMapping[user.roleid];

  const payload = { id: user.userid, username: user.username, role };
  const token = generateToken(payload);

  // Extract avatar URL from raw_meta_data if available
  const avatarUrl = user.raw_meta_data?.picture || '';
  const givenName = user.raw_meta_data?.given_name || '';
  const familyName = user.raw_meta_data?.family_name || '';

  const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&role=${role}&id=${user.userid}&username=${user.username}&email=${user.email}&avatar_url=${encodeURIComponent(avatarUrl)}&given_name=${encodeURIComponent(givenName)}&family_name=${encodeURIComponent(familyName)}`;
  
  res.redirect(redirectUrl);
};

exports.requestOtp = async (req, res) => {
  try {
    const { address, phone, channel } = req.body;
    const OTP_EXPIRY_MINUTES = 10;
    const RESEND_COOLDOWN_SECONDS = 60;
    const RESET_TOKEN_EXPIRY = '15m';
    let user;

    if (address) {
      const { data, error } = await supabase
        .from('tbuser')
        .select('userid, email, tbstudent(phone)')
        .eq('email', address)
        .limit(1);

      if (error) throw error;

      user = data?.[0];

    } else if (phone) {
      const { data, error } = await supabase
        .from('tbuser')
        .select('userid, email, tbstudent(phone)')
        .eq('phone', phone)
        .limit(1);

      if (error) throw error;

      user = data?.[0];

    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'email address or phone required' 
      });
    };

    const defaultResponse = { 
      success: true, 
      message: 'If the account exists, an OTP was sent.' 
    };

    if (!user) {
      return res.json(defaultResponse);
    }

    const chosenChannel = channel || (address ? 'email' : 'whatsapp');

    // check resend cooldown and get last OTP created
    const { data: dataOtp, error: errorOtp } = await supabase
      .from('tbpassword_otp')
      .select('*')
      .eq('userid', user.userid)
      .eq('channel', chosenChannel)
      .order('created_at', { ascending: false })
      .limit(1);

    if (errorOtp) {
      console.error('Error fetching OTP data:', errorOtp);
      throw errorOtp
    };

    if (dataOtp && dataOtp.length) {
      const last = dataOtp[0];
      const since = (Date.now() - new Date(last.created_at).getTime()) / 1000;
      if (since < RESEND_COOLDOWN_SECONDS) {
        // still within cooldown — but don't disclose real reason
        return res.json(defaultResponse);
      }
    }

    //generate OTP
    const otp = otputils.generate(6);
    const otp_hash = await otputils.hash(otp);
    const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // insert new OTP record
    const { error: insertErr } = await supabase
      .from('tbpassword_otp')
      .insert([
        {
          userid: user.userid,
          channel: chosenChannel,
          otp_hash,
          expires_at,
          expired: false,
          attempts: 0,
        },
      ]);
    if (insertErr) {
      console.error('insert otp err', insertErr);
      return res.json(defaultResponse);
    }

    //send OTP
    try {
      if (chosenChannel === 'email') {
        const to = user.email;
        await smtpEmail.send('otp', to, 'Password Change Request', { otp, expiresIn: 10 });
      } else {
        const to = user.phone;
        await whatsapp.send(to, otp);
      }
    } catch (sendErr) {
      console.error('otp send failed', sendErr);
      // Do not reveal to user, log for admin
    }

    return res.json(defaultResponse);
  } catch (err) {
    console.error(err);
    return res.json({ success: true, message: 'If the account exists, an OTP was sent.' });
  }
};

exports.verifyOtp = (req, res) => {
  try {
    const { address, phone, channel, otp } = req.body;

    if (!otp) return res.status(400).json({ 
      success: false, 
      message: 'OTP required' 
    });

    let user;
    if (address) {
      const { data, error } = await supabase
        .from('tbuser')
        .select('userid')
        .eq('email', address)
        .limit(1);

      if(error) throw error;
 
      user = data?.[0];

    } else if (phone) {
      const { data, error } = await supabase
      .from('tbstudent')
      .select('userid')
      .eq('phone', phone)
      .limit(1);

      if(error) throw error;

      user = data?.[0];

    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'address or phone required' });
    }

    if (!user) return res.status(400).json({ 
      success: false, 
      message: 'Invalid OTP' 
    });

    const choosenChannel = channel || (address ? 'email' : 'whatsapp');

    // fetch latest unused otp for that user+channel
    const { data: otpData, error: otpError } = await supabase
      .from('tbpassword_otp')
      .select()
      .eq('userid', user.userid)
      .eq('channel', chosenChannel)
      .eq('expired', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (otpError) throw otpError;

    const otpRow = otpData?.[0];

    if (!otpRow) return res.status(400).json({ 
      success: false, 
      message: 'Invalid or expired OTP' 
    });

    // check expiry
    if (new Date(otpRow.expires_at) < new Date()) {
      await supabase.from('password_otps').update({ used: true }).eq('id', otpRow.id);
      return res.status(400).json({ ok: false, message: 'Expired OTP' });
    }

    // check attempts
    if (otpRow.attempts >= 5) {
      await supabase.from('password_otps').update({ used: true }).eq('id', otpRow.id);
      return res.status(429).json({ ok: false, message: 'Too many attempts' });
    }

    const isValid = await verifyOTPHash(otp, otpRow.otp_hash);
    if (!isValid) {
      await supabase
        .from('password_otps')
        .update({ attempts: otpRow.attempts + 1 })
        .eq('id', otpRow.id);
      return res.status(400).json({ ok: false, message: 'Invalid OTP' });
    }

    // valid -> mark used
    await supabase.from('password_otps').update({ used: true }).eq('id', otpRow.id);

    // create reset token (JWT)
    const payload = { sub: user.id, purpose: 'password_reset' };
    const resetToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: RESET_TOKEN_EXPIRY });

    return res.json({ ok: true, resetToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}