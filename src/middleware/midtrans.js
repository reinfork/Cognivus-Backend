const crypto = require("crypto");
require('dotenv').config();

exports.verify = (req, res, next) => {
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key
  } = req.body;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  const raw = order_id + status_code + gross_amount + serverKey;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");

  if (expected !== signature_key) {
    return res.status(403).json({
      success: false,
      message: "Invalid midtrans signature"
    });
  }

  next();
}
