const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// Email Configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bhosalevikas2006@gmail.com'; 
const SMTP_USER = process.env.SMTP_USER || 'bhosalevikas2006@gmail.com'; 
// Strip any spaces from the 16-character Google App Password
const rawPass = process.env.SMTP_PASS || 'ocxk awxd bhaz uimb';
const SMTP_PASS = rawPass.replace(/\s+/g, '');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Gmail Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ SMTP Configuration Error:', error.message);
    if (error.responseCode === 535 || (error.message && error.message.includes('535'))) {
      console.log('\n======================================================');
      console.log('⚠️  GMAIL APP PASSWORD REJECTED (Google Error 535)');
      console.log('Your Google App Password has expired, was revoked, or is invalid.');
      console.log('To generate a fresh 16-character App Password:');
      console.log('1. Go to: https://myaccount.google.com/security');
      console.log('2. Make sure "2-Step Verification" is ON.');
      console.log('3. Search for "App passwords" (or go to https://myaccount.google.com/apppasswords).');
      console.log('4. Create a new App Password (e.g., name it "Portfolio Backend").');
      console.log('5. Paste the 16-character password into SMTP_PASS in server.js or set SMTP_PASS in .env.');
      console.log('======================================================\n');
    } else {
      console.log('⚠️  Please verify your SMTP credentials in server.js or .env\n');
    }
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Portfolio backend server is running' });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required fields.'
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  // Email content
  const mailOptions = {
    from: `"Portfolio Contact Form" <${SMTP_USER}>`,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `New Portfolio Project Inquiry from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .field {
            margin-bottom: 20px;
            padding: 15px;
            background: white;
            border-radius: 5px;
            border-left: 4px solid #6366f1;
          }
          .field label {
            display: block;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 5px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .field .value {
            color: #333;
            font-size: 16px;
          }
          .message-field {
            border-left-color: #06b6d4;
          }
          .message-field label {
            color: #06b6d4;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💌 New Portfolio Contact Inquiry</h1>
        </div>
        <div class="content">
          <div class="field">
            <label>Name</label>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <label>Email</label>
            <div class="value">${email}</div>
          </div>
          ${phone ? `
          <div class="field">
            <label>Phone / WhatsApp</label>
            <div class="value">${phone}</div>
          </div>
          ` : ''}
          <div class="field message-field">
            <label>Message / Project Scope</label>
            <div class="value">${message.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        <div class="footer">
          <p>Sent from your portfolio contact form</p>
          <p>Reply directly to ${email}</p>
        </div>
      </body>
      </html>
    `,
    text: `
New Portfolio Contact Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}

Message:
${message}

---
You can reply directly to this email.
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully from ${email}`);
    
    res.json({
      success: true,
      message: 'Your message has been sent successfully! I will get back to you soon.'
    });
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send message via Gmail SMTP. Please update the Gmail App Password in the backend server or contact directly at bhosalevikas2006@gmail.com.'
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📧 Contact form endpoint: http://localhost:${PORT}/api/contact\n`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
