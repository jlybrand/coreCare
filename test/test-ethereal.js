const mailService = require('../src/services/mail');

async function testEthereal() {
  console.log('Testing Ethereal email...');
  
  try {
    // Send a test email
    const result = await mailService.testEmailConfig();
    
    console.log('Test email sent successfully!');
    console.log('Preview URL:', result.previewUrl);
    console.log('Copy and paste this URL in your browser to view the test email');
    
    // Test with more sample data
    console.log('\nTesting with sample prospect data...');
    const prospectResult = await mailService.sendProspectNotification({
      name: 'John Doe',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postal_code: '12345',
      phone: '555-123-4567'
    });
    
    console.log('Prospect notification email sent!');
    console.log('Preview URL:', prospectResult.previewUrl);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testEthereal();