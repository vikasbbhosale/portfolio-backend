const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

//Email
const ADMIN_EMAIL = 'bhosalevikas2006@gmail.com'; 
const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 587;
const SMTP_USER = 'bhosalevikas2006@gmail.com'; 
const SMTP_PASS = 'chtg vmfd tbyd uqgh'; 




// Middleware
const corsOptions = {
  origin: 'https://vikasbhosale.vercel.app', // Update with your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, 
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Configuration Error:', error.message);
    console.log('⚠️  Please update SMTP credentials in server.js');
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});


// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
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
    subject: `New Portfolio Contact from ${name}`,
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
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
            border-left: 4px solid #667eea;
          }
          .field label {
            display: block;
            font-weight: bold;
            color: #667eea;
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
            border-left-color: #764ba2;
          }
          .message-field label {
            color: #764ba2;
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
          <h1>💌 New Contact Form Submission</h1>
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
            <label>Phone</label>
            <div class="value">${phone}</div>
          </div>
          ` : ''}
          <div class="field message-field">
            <label>Message</label>
            <div class="value">${message.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from your portfolio contact form</p>
          <p>You can reply directly to ${email}</p>
        </div>
      </body>
      </html>
    `,
    text: `
New Contact Form Submission

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
    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully from ${email}`);
    
    res.json({
      success: true,
      message: 'Your message has been sent successfully! I will get back to you soon.'
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later or contact directly via email.'
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📧 Contact form endpoint: http://localhost:${PORT}/api/contact\n`);
  
  // Configuration reminder
  if (SMTP_USER === 'your-email@gmail.com') {
    console.log('⚠️  REMINDER: Update SMTP credentials in server.js before using contact form!\n');
  }
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});
























// const express = require("express");
// const nodemailer = require("nodemailer");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const PORT = 5000;

// // DIRECT HARD-CODED SETTINGS (NO .env)
// const EMAIL_USER = "YOUR_EMAIL@gmail.com";   // Gmail ID
// const EMAIL_PASS = "YOUR_APP_PASSWORD";      // Gmail App Password
// const OWNER_EMAIL = "bhosalevikas2006@gmail.com"; // Where emails will be sent

// app.post("/api/contact", async (req, res) => {
//   const { name, email, phone, message } = req.body;

//   if (!name || !email || !message) {
//     return res.status(400).json({ message: "Name, email & message are required." });
//   }

//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: EMAIL_USER,
//         pass: EMAIL_PASS
//       }
//     });

//     const mailOptions = {
//       from: EMAIL_USER,
//       to: OWNER_EMAIL,
//       subject: `New message from ${name}`,
//       html: `
//         <h3>New Contact Form Submission</h3>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Phone:</strong> ${phone || "N/A"}</p>
//         <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
//       `
//     };

//     await transporter.sendMail(mailOptions);

//     res.json({ message: "Message sent successfully!" });

//   } catch (error) {
//     console.error("Error sending mail:", error);
//     res.status(500).json({ message: "Failed to send message. Try again later." });
//   }
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
