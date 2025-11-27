const bcrypt = require('bcryptjs');

exports.generate = (len = 6) => {
  const min = 10 ** (len - 1);
  const max = 10 ** len - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

exports.hash = async (otp) => {
  const saltRounds = 10;
  return bcrypt.hash(otp, saltRounds);
}

exports.verify = (otp, otpHash) => {
  return bcrypt.compare(otp, otpHash);
}
