// In a routes file, e.g., src/routes/index.js
const mailService = require('../services/mail');

// Test route for email - add this to your existing router
router.get('/test-email', async (req, res) => {
  try {
    const info = await mailService.testEmailConfig();
    res.json({ 
      success: true, 
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});