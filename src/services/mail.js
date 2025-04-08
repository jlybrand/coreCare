const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const config = require('../../config');

// Initialize SendGrid if API key is available
if (config.sendgrid && config.sendgrid.apiKey) {
  sgMail.setApiKey(config.sendgrid.apiKey);
  console.log('SendGrid initialized successfully');
} else {
  console.log('SendGrid API key not found, SendGrid not available in development');
}

/**
 * Create mail transporter with Ethereal for development and SendGrid for production
 */
const createTransporter = async () => {
  // For development - use Ethereal
  if (config.nodeEnv !== 'production') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      // Create a transporter with the test account
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('Created Ethereal test account:', testAccount.user);
      return { transporter, testAccount, type: 'ethereal' };
    } catch (error) {
      console.error('Failed to create Ethereal account:', error);
      throw error;
    }
  } 
  else {
    return { type: 'sendgrid' };
  }
};

// Send email helper function
const sendEmail = async (options) => {
  try {
    // Get environment-appropriate transporter
    const { transporter, testAccount, type } = await createTransporter();
    
    // Development/Ethereal
    if (type === 'ethereal') {
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        ...options
      };
      
      const info = await transporter.sendMail(mailOptions);
      
      console.log('Email sent (Ethereal): %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      
      return { info, previewUrl: nodemailer.getTestMessageUrl(info) };
    }
    // Production/SendGrid
    else {
      const msg = {
        from: {
          email: config.email.fromEmail,
          name: config.email.fromName
        },
        ...options
      };
      
      const response = await sgMail.send(msg);
      console.log('Email sent with SendGrid');
      
      return response;
    }
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

const sendProspectNotification = async (prospect) => {
  const subject = 'New Prospect Added';
  const text = `
    A new prospect has been added to the database:
    
    Name: ${prospect.name}
    Address: ${prospect.address}
    City: ${prospect.city}, ${prospect.state} ${prospect.postal_code}
    Phone: ${prospect.phone || 'Not provided'}
    
    Date Added: ${new Date().toLocaleString()}
  `;
  
  const html = `
    <h2>New Prospect Added</h2>
    <p>A new prospect has been added to the database:</p>
    <table>
      <tr><td><strong>Name:</strong></td><td>${prospect.name}</td></tr>
      <tr><td><strong>Address:</strong></td><td>${prospect.address}</td></tr>
      <tr><td><strong>City, State, ZIP:</strong></td><td>${prospect.city}, ${prospect.state} ${prospect.postal_code}</td></tr>
      <tr><td><strong>Phone:</strong></td><td>${prospect.phone || 'Not provided'}</td></tr>
    </table>
    <p>Date Added: ${new Date().toLocaleString()}</p>
  `;
  
  return sendEmail({
    to: config.email.adminEmail,
    subject,
    text,
    html
  });
};

const sendNewClientNotification = async (client) => {
  const subject = 'New Client Registration';
  const text = `
    A new client has registered:
    
    Name: ${client.firstname} ${client.lastname}
    Email: ${client.email}
    
    Date Registered: ${new Date().toLocaleString()}
  `;
  
  const html = `
    <h2>New Client Registration</h2>
    <p>A new client has registered:</p>
    <table>
      <tr><td><strong>Name:</strong></td><td>${client.firstname} ${client.lastname}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${client.email}</td></tr>
    </table>
    <p>Date Registered: ${new Date().toLocaleString()}</p>
  `;
  
  return sendEmail({
    to: config.email.adminEmail,
    subject,
    text,
    html
  });
};

const sendClientWelcome = async (client) => {
  const subject = 'Welcome to CareConnect';
  const text = `
    Hello ${client.firstname},
    
    Thank you for registering with our service. Your account has been created successfully.
    
    Your account information:
    Email: ${client.email}
    
    You can now log in to access your dashboard and view your referrals.
    
    If you have any questions, please don't hesitate to contact us.
    
    Best regards,

    The CareConnectTeam
  `;
  
  const html = `
    <h2>Welcome to CareConnect</h2>
    <p>Hello ${client.firstname},</p>
    <p>Thank you for registering with our service. Your account has been created successfully.</p>
    <h3>Your account information:</h3>
    <p><strong>Email:</strong> ${client.email}</p>
    <p>You can now log in to access your dashboard and view your referrals.</p>
    <p>If you have any questions, please don't hesitate to contact us.</p>
    <p>Best regards,<br>The Team</p>
  `;
  
  return sendEmail({
    to: client.email,
    subject,
    text,
    html
  });
};

const sendPasswordResetEmail = async (client, token) => {
  if (!token) {
    console.error('Token is undefined in sendPasswordResetEmail');
    throw new Error('Reset token is required');
  }
  
  const appUrl = config.appUrl;
  console.log('Using appUrl:', appUrl);
  
  const resetUrl = `${appUrl}/users/reset-password?token=${token}`;
  console.log('Generated reset URL:', resetUrl);
  
  const subject = 'Password Reset Request';
  const text = `
    Hello ${client.firstname},
    
    You requested a password reset for your account.
    
    Please click on the following link to set a new password:
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request this password reset, please ignore this email.
    
    Thank you,
    The CareConnect Team
  `;
  
  const html = `
    <h2>Password Reset Request</h2>
    <p>Hello ${client.firstname},</p>
    <p>You requested a password reset for your account.</p>
    <p>Please click the button below to set a new password:</p>
    <p style="text-align: center; margin: 25px 0;">
      <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
    </p>
    <p>Or copy and paste this link in your browser:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this password reset, please ignore this email.</p>
    <p>Thank you,<br>The CareConnect Team</p>
  `;
  
  return sendEmail({
    to: client.email,
    subject,
    text,
    html
  });
};

const sendErrorNotification = async (subject, errorDetails) => {
  const text = `
    An error occurred in the application:
    
    ${errorDetails}
    
    Time: ${new Date().toLocaleString()}
  `;
  
  const html = `
    <h2>Application Error</h2>
    <p>An error occurred in the application:</p>
    <pre>${errorDetails}</pre>
    <p>Time: ${new Date().toLocaleString()}</p>
  `;
  
  return sendEmail({
    to: config.email.adminEmail,
    subject,
    text,
    html
  });
};

const testEmailConfig = async () => {
  try {
    const result = await sendEmail({
      to: config.email.adminEmail,
      subject: "Test Email Configuration",
      text: "If you're reading this, your email configuration is working correctly!",
      html: "<b>If you're reading this, your email configuration is working correctly!</b>"
    });
    
    console.log('Test email sent successfully!');
    return result;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    throw error;
  }
};

module.exports = {
  sendProspectNotification,
  sendNewClientNotification,
  sendClientWelcome,
  sendPasswordResetEmail,
  sendErrorNotification,
  testEmailConfig
};