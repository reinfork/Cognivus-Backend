const transporter = require('../config/email');
const loader = require('./email_template/loader');

exports.send = async (templateName, to, subject, variables = {}) => {
  try {
    const html = loader.append(templateName, variables);

    const info = await transporter.sendMail({
      from: `"ITTR English Course" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Send email error:", error);
    throw error;
  }
};